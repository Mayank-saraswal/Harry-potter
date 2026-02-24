import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSandbox, getLanguageConfig } from "@/lib/e2b-sandbox";
import { prisma } from "@/lib/prisma";
import { readTextFile, isBinaryFile } from "@/lib/file-storage";
import type { SandboxPreviewRequest, SandboxStreamEvent } from "@/types/sandbox";

/**
 * POST /api/sandbox/preview
 *
 * Creates an E2B sandbox, fetches project files from the database and Azure
 * Blob Storage, writes them into the sandbox, installs dependencies, and runs
 * the dev/start command.  Output is streamed as newline-delimited JSON (each
 * line is a `SandboxStreamEvent`).
 */
export async function POST(req: NextRequest): Promise<Response> {
    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: SandboxPreviewRequest;
    try {
        body = (await req.json()) as SandboxPreviewRequest;
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { projectId } = body;
    if (!projectId || typeof projectId !== "string") {
        return Response.json(
            { error: "Missing or invalid 'projectId' field" },
            { status: 400 }
        );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: SandboxStreamEvent) => {
                controller.enqueue(
                    encoder.encode(JSON.stringify(event) + "\n")
                );
            };

            try {
                // 1. Create sandbox
                send({ type: "status", status: "creating" });
                const sandbox = await createSandbox();
                send({ type: "sandboxId", sandboxId: sandbox.sandboxId });

                // 2. Fetch project files from database
                const dbFiles = await prisma.file.findMany({
                    where: { projectId, type: "file" },
                });

                // 3. Download file contents from Azure Blob Storage
                const filesContent: Record<string, string> = {};
                await Promise.all(
                    dbFiles.map(async (file) => {
                        if (isBinaryFile(file.name)) {
                            // Binary files: create an empty placeholder
                            await sandbox.files.write(`/code/${file.path}`, "");
                        } else {
                            try {
                                const content = await readTextFile(projectId, file.id);
                                filesContent[file.path] = content;
                                await sandbox.files.write(`/code/${file.path}`, content);
                            } catch {
                                // If download fails, touch an empty file so the structure exists
                                await sandbox.files.write(`/code/${file.path}`, "");
                            }
                        }
                    })
                );

                // 4. Detect language & commands
                const detected = getLanguageConfig(filesContent);
                const installCmd =
                    body.installCommand ?? detected.installCommand;
                const devCmd = body.devCommand ?? detected.runCommand;

                // 5. Install dependencies
                if (installCmd) {
                    send({ type: "status", status: "installing" });
                    send({ type: "output", data: `$ ${installCmd}\n` });

                    const installResult = await sandbox.commands.run(
                        `cd /code && ${installCmd}`
                    );
                    if (installResult.stdout) {
                        send({ type: "output", data: installResult.stdout });
                    }
                    if (installResult.stderr) {
                        send({ type: "output", data: installResult.stderr });
                    }
                    if (installResult.exitCode !== 0) {
                        send({
                            type: "error",
                            message: `Install failed with exit code ${installResult.exitCode}`,
                        });
                        controller.close();
                        return;
                    }
                }

                // 6. Run the project
                send({ type: "status", status: "running" });
                send({ type: "output", data: `\n$ ${devCmd}\n` });

                const runResult = await sandbox.commands.run(
                    `cd /code && ${devCmd}`
                );
                if (runResult.stdout) {
                    send({ type: "output", data: runResult.stdout });
                }
                if (runResult.stderr) {
                    send({ type: "output", data: runResult.stderr });
                }

                send({ type: "exit", exitCode: runResult.exitCode });

                // 7. Provide sandbox host URL for web projects
                try {
                    const url = sandbox.getHost(3000);
                    if (url) {
                        send({ type: "url", url: `https://${url}` });
                    }
                } catch {
                    // Not all projects expose a port — this is fine
                }

                // NOTE: We intentionally do NOT kill the sandbox here.
                // The sandbox stays alive so the interactive terminal can
                // reconnect to it via Sandbox.connect(sandboxId) and access
                // the project files in /code.
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown sandbox error";
                send({ type: "error", message });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
