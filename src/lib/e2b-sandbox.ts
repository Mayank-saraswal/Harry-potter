import { Sandbox } from "e2b";

import type { SandboxExecResult } from "@/types/sandbox";

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Validate that E2B_API_KEY is configured.
 * Throws a descriptive error when the key is missing.
 */
function requireApiKey(): void {
    if (!process.env.E2B_API_KEY) {
        throw new Error(
            "Missing E2B_API_KEY environment variable. " +
                "Set it in your .env file to enable sandbox execution."
        );
    }
}

/**
 * Create a new E2B sandbox for code execution.
 * Each sandbox is an isolated Linux micro-VM.
 */
export async function createSandbox(
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Sandbox> {
    requireApiKey();
    return Sandbox.create({ timeoutMs });
}

/**
 * Run a single command in an E2B sandbox and return output.
 * If no sandbox is provided, a new one is created and killed after execution.
 */
export async function runInSandbox(
    command: string,
    sandbox?: Sandbox
): Promise<SandboxExecResult> {
    const ownSandbox = !sandbox;
    const sb = sandbox ?? (await createSandbox());

    try {
        const result = await sb.commands.run(command);
        return {
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
        };
    } finally {
        if (ownSandbox) {
            await sb.kill();
        }
    }
}

/**
 * Write project files into a sandbox, install dependencies, and run the entry command.
 * Returns the execution result and keeps the sandbox alive for further interaction.
 */
export async function runProject(
    files: Record<string, string>,
    entryCommand: string,
    installCommand?: string
): Promise<SandboxExecResult & { sandbox: Sandbox }> {
    const sandbox = await createSandbox();

    try {
        // Write all project files into /code/
        for (const [filePath, content] of Object.entries(files)) {
            await sandbox.files.write(`/code/${filePath}`, content);
        }

        // Install dependencies if specified
        if (installCommand) {
            const installResult = await sandbox.commands.run(
                `cd /code && ${installCommand}`
            );
            if (installResult.exitCode !== 0) {
                throw new Error(
                    `Install command failed (exit ${installResult.exitCode}): ${installResult.stderr}`
                );
            }
        }

        // Run the project
        const result = await sandbox.commands.run(
            `cd /code && ${entryCommand}`
        );

        return {
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            sandbox, // Keep alive for further interaction
        };
    } catch (error) {
        await sandbox.kill();
        throw error;
    }
}

/**
 * Detect language from file names and return appropriate run commands.
 */
export function getLanguageConfig(files: Record<string, string>): {
    language: string;
    installCommand?: string;
    runCommand: string;
} {
    const filenames = Object.keys(files);

    if (filenames.some((f) => f === "package.json")) {
        return {
            language: "javascript",
            installCommand: "npm install",
            runCommand: "npm run dev || npm start",
        };
    }

    if (filenames.some((f) => f.endsWith(".py") || f === "requirements.txt")) {
        const mainFile =
            filenames.find((f) => f.endsWith(".py")) ?? "main.py";
        return {
            language: "python",
            installCommand: filenames.includes("requirements.txt")
                ? "pip install -r requirements.txt"
                : undefined,
            runCommand: `python3 ${mainFile}`,
        };
    }

    if (filenames.some((f) => f === "Cargo.toml")) {
        return {
            language: "rust",
            runCommand: "cargo run",
        };
    }

    if (filenames.some((f) => f === "go.mod")) {
        return {
            language: "go",
            runCommand: "go run .",
        };
    }

    if (filenames.some((f) => f.endsWith(".java"))) {
        const mainFile =
            filenames.find((f) => f.endsWith(".java")) ?? "Main.java";
        const className = mainFile.replace(".java", "");
        return {
            language: "java",
            runCommand: `javac ${mainFile} && java ${className}`,
        };
    }

    const cFile = filenames.find(
        (f) => f.endsWith(".cpp") || f.endsWith(".c")
    );
    if (cFile) {
        const compiler = cFile.endsWith(".c") ? "gcc" : "g++";
        return {
            language: cFile.endsWith(".c") ? "c" : "cpp",
            runCommand: `${compiler} -o main ${cFile} && ./main`,
        };
    }

    if (filenames.some((f) => f.endsWith(".rb") || f === "Gemfile")) {
        const mainFile =
            filenames.find((f) => f.endsWith(".rb")) ?? "main.rb";
        return {
            language: "ruby",
            installCommand: filenames.includes("Gemfile")
                ? "bundle install"
                : undefined,
            runCommand: `ruby ${mainFile}`,
        };
    }

    // Default to Node.js
    return {
        language: "javascript",
        runCommand: "node index.js",
    };
}
