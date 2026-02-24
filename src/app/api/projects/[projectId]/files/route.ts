import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uploadTextFile } from "@/lib/file-storage";
import { z } from "zod";

type Params = { params: Promise<{ projectId: string }> };

/**
 * Validate that a path does not contain traversal sequences
 */
function isValidPath(path: string): boolean {
    const normalized = path.replace(/\\/g, "/");
    return !normalized.includes("..") && !normalized.startsWith("/");
}

/**
 * GET /api/projects/[projectId]/files — List all files in a project
 * GET /api/projects/[projectId]/files?parentPath=src/components — List files in folder
 */
export async function GET(request: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const url = new URL(request.url);
    const parentPath = url.searchParams.get("parentPath");

    if (parentPath && !isValidPath(parentPath)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let files;
    if (parentPath) {
        // Get direct children of the specified folder
        files = await prisma.file.findMany({
            where: {
                projectId,
                path: { startsWith: `${parentPath}/` },
            },
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });

        // Filter to direct children only (query results already start with parentPath/)
        files = files.filter((f: { path: string }) => {
            const relativePath = f.path.slice(parentPath.length + 1);
            return relativePath.length > 0 && !relativePath.includes("/");
        });
    } else {
        // Get all files (flat list)
        files = await prisma.file.findMany({
            where: { projectId },
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });
    }

    return NextResponse.json(files);
}

const createFileSchema = z.object({
    name: z.string().min(1).max(255),
    content: z.string().optional(),
    parentPath: z.string().max(500).optional(),
    type: z.enum(["file", "folder"]).optional(),
});

/**
 * POST /api/projects/[projectId]/files — Create a file or folder
 */
export async function POST(request: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const parsed = createFileSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, content, parentPath, type } = parsed.data;

    // Path traversal protection
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
        return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }
    if (parentPath && !isValidPath(parentPath)) {
        return NextResponse.json({ error: "Invalid parent path" }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const filePath = parentPath ? `${parentPath}/${name}` : name;

    if (type === "folder") {
        const folder = await prisma.file.create({
            data: {
                projectId,
                name,
                path: filePath,
                type: "folder",
            },
        });
        return NextResponse.json(folder);
    }

    // Create file
    const file = await prisma.file.create({
        data: {
            projectId,
            name,
            path: filePath,
            type: "file",
            size: content?.length ?? 0,
        },
    });

    // Upload content to Azure Blob if provided
    if (content) {
        const blobPath = await uploadTextFile(projectId, file.id, content, name);
        await prisma.file.update({
            where: { id: file.id },
            data: { blobPath },
        });
    }

    return NextResponse.json(file);
}
