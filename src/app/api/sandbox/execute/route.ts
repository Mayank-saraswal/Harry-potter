import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Sandbox } from "e2b";

import { runInSandbox } from "@/lib/e2b-sandbox";
import type { SandboxExecRequest, SandboxExecResult } from "@/types/sandbox";

/**
 * POST /api/sandbox/execute
 *
 * Run a command inside an E2B sandbox.
 * Body: { command: string; sandboxId?: string }
 * Returns: SandboxExecResult
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: SandboxExecRequest;
    try {
        body = (await req.json()) as SandboxExecRequest;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const { command, sandboxId } = body;
    if (!command || typeof command !== "string") {
        return NextResponse.json(
            { error: "Missing or invalid 'command' field" },
            { status: 400 }
        );
    }

    if (sandboxId !== undefined && sandboxId !== null && typeof sandboxId !== "string") {
        return NextResponse.json(
            { error: "Invalid 'sandboxId' field" },
            { status: 400 }
        );
    }

    try {
        let sb: Sandbox | undefined;
        if (sandboxId) {
            try {
                sb = await Sandbox.connect(sandboxId);
            } catch {
                // Sandbox may have timed out — fall through to runInSandbox default
            }
        }

        // Wrap the command to run in /code when reconnecting to an existing sandbox
        const cmdToRun =
            sandboxId && !command.startsWith("cd ")
                ? `cd /code && ${command}`
                : command;

        const result: SandboxExecResult = await runInSandbox(cmdToRun, sb);
        return NextResponse.json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Sandbox execution failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
