import { useCallback, useEffect, useRef, useState } from "react";

import { useFiles } from "@/features/projects/hooks/use-files";
import { useTerminalStore } from "@/features/terminal/store/terminal-store";
import type { SandboxStatus, SandboxStreamEvent } from "@/types/sandbox";

interface UseSandboxProps {
    projectId: string;
    enabled: boolean;
    settings?: {
        installCommand?: string;
        devCommand?: string;
    };
}

/**
 * Hook that manages an E2B sandbox lifecycle for project preview.
 * Replaces the former WebContainer-based hook with server-side sandbox execution.
 */
export const useSandbox = ({
    projectId,
    enabled,
    settings,
}: UseSandboxProps) => {
    const [status, setStatus] = useState<SandboxStatus>("idle");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [restartKey, setRestartKey] = useState(0);
    const [terminalOutput, setTerminalOutput] = useState("");
    const [sandboxId, setSandboxIdLocal] = useState<string | null>(null);

    const setSandboxId = useTerminalStore((s) => s.setSandboxId);

    const hasStartedRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    // Fetch files from database (used to guard against starting for empty projects)
    const { data: files } = useFiles(projectId);

    // Initial boot and mount
    useEffect(() => {
        if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
            return;
        }

        hasStartedRef.current = true;

        const run = async () => {
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                setStatus("creating");
                setError(null);
                setTerminalOutput("");

                const response = await fetch("/api/sandbox/preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId,
                        installCommand: settings?.installCommand,
                        devCommand: settings?.devCommand,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => null);
                    throw new Error(
                        (data as { error?: string } | null)?.error ??
                            `Server error (${response.status})`
                    );
                }

                if (!response.body) {
                    throw new Error("No response stream from server");
                }

                // Read streamed newline-delimited JSON events
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const event = JSON.parse(line) as SandboxStreamEvent;
                            switch (event.type) {
                                case "status":
                                    setStatus(event.status);
                                    break;
                                case "output":
                                    setTerminalOutput((prev) => prev + event.data);
                                    break;
                                case "url":
                                    setPreviewUrl(event.url);
                                    break;
                                case "sandboxId":
                                    setSandboxIdLocal(event.sandboxId);
                                    setSandboxId(event.sandboxId);
                                    break;
                                case "error":
                                    setError(event.message);
                                    setStatus("error");
                                    break;
                                case "exit":
                                    if (event.exitCode !== 0) {
                                        setStatus("error");
                                    }
                                    break;
                            }
                        } catch {
                            // Skip malformed lines
                        }
                    }
                }
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Unknown error");
                setStatus("error");
            }
        };

        run();
    }, [
        enabled,
        files,
        restartKey,
        projectId,
        settings?.devCommand,
        settings?.installCommand,
        setSandboxId,
    ]);

    // Reset when disabled
    useEffect(() => {
        if (!enabled) {
            hasStartedRef.current = false;
            setStatus("idle");
            setPreviewUrl(null);
            setError(null);
            setSandboxIdLocal(null);
            setSandboxId(null);
            abortRef.current?.abort();
        }
    }, [enabled, setSandboxId]);

    // Restart the sandbox process
    const restart = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        hasStartedRef.current = false;
        setStatus("idle");
        setPreviewUrl(null);
        setError(null);
        setSandboxIdLocal(null);
        setSandboxId(null);
        setRestartKey((k) => k + 1);
    }, [setSandboxId]);

    return {
        status,
        previewUrl,
        error,
        restart,
        terminalOutput,
        sandboxId,
    };
};