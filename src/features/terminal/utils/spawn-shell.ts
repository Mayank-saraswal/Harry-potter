import type { SandboxExecResult } from "@/types/sandbox";

/**
 * Execute a command in a server-side E2B sandbox via the API route.
 * Returns the execution result (stdout, stderr, exitCode).
 */
export const executeCommand = async (
    command: string
): Promise<SandboxExecResult> => {
    const response = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
            (data as { error?: string } | null)?.error ??
                `Server error (${response.status})`
        );
    }

    return response.json() as Promise<SandboxExecResult>;
};
