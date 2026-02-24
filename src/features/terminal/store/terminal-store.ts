import { create } from "zustand";

import type { SandboxExecResult } from "@/types/sandbox";

export interface TerminalInstance {
    id: string;
    title: string;
    /** Whether the terminal is awaiting or processing a command */
    isRunning: boolean;
    /** Accumulated output for display */
    output: string;
    /** Latest execution result (null while running) */
    lastResult: SandboxExecResult | null;
}

interface TerminalState {
    terminals: Map<string, TerminalInstance>;
    activeTerminalId: string | null;
    nextId: number;
    /** The sandbox ID of the currently running E2B sandbox */
    sandboxId: string | null;

    addTerminal: () => string;
    removeTerminal: (id: string) => void;
    setActiveTerminal: (id: string) => void;
    setRunning: (id: string, isRunning: boolean) => void;
    appendOutput: (id: string, data: string) => void;
    setLastResult: (id: string, result: SandboxExecResult | null) => void;
    renameTerminal: (id: string, title: string) => void;
    clearOutput: (id: string) => void;
    setSandboxId: (sandboxId: string | null) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
    terminals: new Map(),
    activeTerminalId: null,
    nextId: 1,
    sandboxId: null,

    addTerminal: () => {
        const { nextId, terminals } = get();
        const id = `terminal-${nextId}`;
        const title = `Terminal ${nextId}`;
        const instance: TerminalInstance = {
            id,
            title,
            isRunning: false,
            output: "",
            lastResult: null,
        };

        const newTerminals = new Map(terminals);
        newTerminals.set(id, instance);

        set({
            terminals: newTerminals,
            activeTerminalId: id,
            nextId: nextId + 1,
        });

        return id;
    },

    removeTerminal: (id) => {
        const { terminals, activeTerminalId } = get();
        const newTerminals = new Map(terminals);
        newTerminals.delete(id);

        // If we removed the active tab, switch to the last remaining one
        let newActive = activeTerminalId;
        if (activeTerminalId === id) {
            const keys = Array.from(newTerminals.keys());
            newActive = keys.length > 0 ? keys[keys.length - 1] : null;
        }

        set({ terminals: newTerminals, activeTerminalId: newActive });
    },

    setActiveTerminal: (id) => {
        set({ activeTerminalId: id });
    },

    setRunning: (id, isRunning) => {
        const { terminals } = get();
        const terminal = terminals.get(id);
        if (!terminal) return;

        const newTerminals = new Map(terminals);
        newTerminals.set(id, { ...terminal, isRunning });
        set({ terminals: newTerminals });
    },

    appendOutput: (id, data) => {
        const { terminals } = get();
        const terminal = terminals.get(id);
        if (!terminal) return;

        const newTerminals = new Map(terminals);
        newTerminals.set(id, {
            ...terminal,
            output: terminal.output + data,
        });
        set({ terminals: newTerminals });
    },

    setLastResult: (id, result) => {
        const { terminals } = get();
        const terminal = terminals.get(id);
        if (!terminal) return;

        const newTerminals = new Map(terminals);
        newTerminals.set(id, { ...terminal, lastResult: result });
        set({ terminals: newTerminals });
    },

    renameTerminal: (id, title) => {
        const { terminals } = get();
        const terminal = terminals.get(id);
        if (!terminal) return;

        const newTerminals = new Map(terminals);
        newTerminals.set(id, { ...terminal, title });
        set({ terminals: newTerminals });
    },

    clearOutput: (id) => {
        const { terminals } = get();
        const terminal = terminals.get(id);
        if (!terminal) return;

        const newTerminals = new Map(terminals);
        newTerminals.set(id, { ...terminal, output: "", lastResult: null });
        set({ terminals: newTerminals });
    },

    setSandboxId: (sandboxId) => {
        set({ sandboxId });
    },
}));
