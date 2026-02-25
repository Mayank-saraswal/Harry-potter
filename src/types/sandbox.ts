/**
 * Shared types for the E2B sandbox execution layer.
 * These types are used by both API routes and client-side hooks.
 */

/** Status of a sandbox preview session */
export type SandboxStatus =
    | "idle"
    | "creating"
    | "installing"
    | "running"
    | "error";

/** Result of a single command execution in a sandbox */
export interface SandboxExecResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

/** Payload sent to the preview API to start a sandbox preview */
export interface SandboxPreviewRequest {
    projectId: string;
    installCommand?: string;
    devCommand?: string;
}

/** Response from the preview API */
export interface SandboxPreviewResponse {
    sandboxId: string;
    previewUrl: string | null;
}

/** Payload sent to the execute API to run a command */
export interface SandboxExecRequest {
    sandboxId?: string | null;
    command: string;
}

/** Payload sent to the files API to write files into a sandbox */
export interface SandboxFilesRequest {
    sandboxId: string;
    files: Record<string, string>;
}

/** Shape of each streamed event sent from the sandbox API */
export type SandboxStreamEvent =
    | { type: "status"; status: SandboxStatus }
    | { type: "output"; data: string }
    | { type: "url"; url: string }
    | { type: "error"; message: string }
    | { type: "exit"; exitCode: number }
    | { type: "sandboxId"; sandboxId: string };
