"use client";

import { useCallback, useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import { executeCommand } from "@/features/terminal/utils/spawn-shell";
import { useTerminalStore } from "@/features/terminal/store/terminal-store";

import "@xterm/xterm/css/xterm.css";

interface InteractiveTerminalProps {
    terminalId: string;
    onProcessExit?: (exitCode: number) => void;
}

export const InteractiveTerminal = ({
    terminalId,
    onProcessExit,
}: InteractiveTerminalProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const inputBufferRef = useRef("");
    const isExecutingRef = useRef(false);

    const appendOutput = useTerminalStore((s) => s.appendOutput);
    const setRunning = useTerminalStore((s) => s.setRunning);
    const setLastResult = useTerminalStore((s) => s.setLastResult);

    // Execute a command via the E2B sandbox API
    const handleCommand = useCallback(
        async (command: string) => {
            const terminal = terminalRef.current;
            if (!terminal || !command.trim()) {
                terminal?.write("\r\n$ ");
                return;
            }

            isExecutingRef.current = true;
            setRunning(terminalId, true);

            try {
                const result = await executeCommand(command.trim());

                if (result.stdout) {
                    terminal.write(result.stdout.replace(/\n/g, "\r\n"));
                }
                if (result.stderr) {
                    terminal.write(
                        `\x1b[31m${result.stderr.replace(/\n/g, "\r\n")}\x1b[0m`
                    );
                }

                setLastResult(terminalId, result);
                appendOutput(
                    terminalId,
                    `$ ${command}\n${result.stdout}${result.stderr}`
                );

                if (result.exitCode !== 0) {
                    terminal.write(
                        `\r\n\x1b[90m[exit code ${result.exitCode}]\x1b[0m`
                    );
                    onProcessExit?.(result.exitCode);
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Command execution failed";
                terminal.write(`\r\n\x1b[31mError: ${message}\x1b[0m`);
            } finally {
                isExecutingRef.current = false;
                setRunning(terminalId, false);
                terminal.write("\r\n$ ");
            }
        },
        [terminalId, appendOutput, setRunning, setLastResult, onProcessExit]
    );

    // Initialize xterm
    useEffect(() => {
        if (!containerRef.current || terminalRef.current) return;

        const terminal = new Terminal({
            convertEol: true,
            disableStdin: false,
            fontSize: 13,
            fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
            theme: {
                background: "#0a0a0f",
                foreground: "#d4d4d8",
                cursor: "#a78bfa",
                cursorAccent: "#0a0a0f",
                selectionBackground: "#a78bfa33",
                black: "#18181b",
                red: "#f87171",
                green: "#4ade80",
                yellow: "#facc15",
                blue: "#60a5fa",
                magenta: "#c084fc",
                cyan: "#22d3ee",
                white: "#e4e4e7",
                brightBlack: "#3f3f46",
                brightRed: "#fca5a5",
                brightGreen: "#86efac",
                brightYellow: "#fde68a",
                brightBlue: "#93c5fd",
                brightMagenta: "#d8b4fe",
                brightCyan: "#67e8f9",
                brightWhite: "#fafafa",
            },
            cursorBlink: true,
            cursorStyle: "bar",
            scrollback: 5000,
            allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(containerRef.current);

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Show initial prompt
        terminal.write("E2B Sandbox Terminal\r\n$ ");

        // Handle user input
        terminal.onData((data) => {
            if (isExecutingRef.current) return;

            if (data === "\r") {
                // Enter pressed — execute the buffered command
                terminal.write("\r\n");
                const cmd = inputBufferRef.current;
                inputBufferRef.current = "";
                handleCommand(cmd);
            } else if (data === "\x7f") {
                // Backspace
                if (inputBufferRef.current.length > 0) {
                    inputBufferRef.current = inputBufferRef.current.slice(0, -1);
                    terminal.write("\b \b");
                }
            } else if (data === "\x03") {
                // Ctrl+C
                inputBufferRef.current = "";
                terminal.write("^C\r\n$ ");
            } else if (data >= " ") {
                // Printable characters
                inputBufferRef.current += data;
                terminal.write(data);
            }
        });

        requestAnimationFrame(() => fitAddon.fit());

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => fitAddon.fit());
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            terminal.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        };
    }, [handleCommand]);

    return (
        <div
            ref={containerRef}
            className="flex-1 min-h-0 px-2 py-1 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full!"
            style={{ backgroundColor: "#0a0a0f" }}
        />
    );
};
