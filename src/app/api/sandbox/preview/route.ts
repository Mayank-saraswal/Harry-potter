import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSandbox, getLanguageConfig } from "@/lib/e2b-sandbox";
import type { SandboxPreviewRequest, SandboxStreamEvent } from "@/types/sandbox";

/**
 * POST /api/sandbox/preview
 *
 * Creates an E2B sandbox, writes project files, installs dependencies,
 * and runs the dev/start command.  Output is streamed as newline-delimited JSON
 * (each line is a `SandboxStreamEvent`).
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

    const { files } = body;
    if (!files || typeof files !== "object" || Object.keys(files).length === 0) {
        return Response.json(
            { error: "Missing or empty 'files' field" },
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

                // 2. Write project files
                for (const [filePath, content] of Object.entries(files)) {
                    await sandbox.files.write(`/code/${filePath}`, content);
                }

                // 3. Detect language & commands
                const detected = getLanguageConfig(files);
                const installCmd =
                    body.installCommand ?? detected.installCommand;
                const devCmd = body.devCommand ?? detected.runCommand;

                // 4. Install dependencies
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
                        await sandbox.kill();
                        return;
                    }
                }

                // 5. Run the project
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

                // 6. Provide sandbox host URL for web projects
                try {
                    const url = sandbox.getHost(3000);
                    if (url) {
                        send({ type: "url", url: `https://${url}` });
                    }
                } catch {
                    // Not all projects expose a port — this is fine
                }

                // Cleanup
                await sandbox.kill();
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
