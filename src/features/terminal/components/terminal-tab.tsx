"use client";

import { useCallback } from "react";
import { InteractiveTerminal } from "./interactive-terminal";

interface TerminalTabProps {
    id: string;
    onExit: (id: string) => void;
}

export const TerminalTab = ({ id, onExit }: TerminalTabProps) => {
    const handleExit = useCallback(
        (_code: number) => {
            onExit(id);
        },
        [id, onExit]
    );

    return <InteractiveTerminal terminalId={id} onProcessExit={handleExit} />;
};
