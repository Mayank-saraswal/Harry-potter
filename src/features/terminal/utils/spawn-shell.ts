import type { SandboxExecResult } from "@/types/sandbox";

/**
 * Execute a command in a server-side E2B sandbox via the API route.
 * When `sandboxId` is provided the backend reconnects to the existing
 * sandbox so that project files in `/code` remain accessible.
 */
export const executeCommand = async (
    command: string,
    sandboxId?: string
): Promise<SandboxExecResult> => {
    const response = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, sandboxId }),
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
