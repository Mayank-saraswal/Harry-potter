interface FileRecord {
    id: string;
    name: string;
    path: string;
    type: "file" | "folder";
    blobPath: string | null;
}

/**
 * Convert flat file records to a nested Record<string, string> suitable
 * for writing into an E2B sandbox (path → content).
 *
 * Only text files are included. Binary files (those backed by blob storage)
 * are skipped because they are fetched on demand.
 */
export const buildFilesRecord = (
    files: FileRecord[],
    fileContents?: Map<string, string>
): Record<string, string> => {
    const record: Record<string, string> = {};

    for (const file of files) {
        if (file.type !== "file") continue;

        const content = fileContents?.get(file.id) ?? "";
        // Only include files that have content or are not backed by blob storage
        if (content || !file.blobPath) {
            record[file.path] = content;
        }
    }

    return record;
};

/**
 * Get full path for a file (already stored as path in our model)
 */
export const getFilePath = (file: FileRecord): string => {
    return file.path;
};