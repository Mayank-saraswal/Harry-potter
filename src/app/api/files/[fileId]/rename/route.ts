import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ fileId: string }> };

const renameSchema = z.object({
    newName: z.string().min(1).max(255).refine(
        (name) => !name.includes("/") && !name.includes("\\") && name !== ".." && name !== ".",
        "Invalid file name"
    ),
});

/**
 * POST /api/files/[fileId]/rename — Rename a file
 */
export async function POST(request: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;
    const body = await request.json();
    const parsed = renameSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { newName } = parsed.data;

    const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: { project: { select: { userId: true } } },
    });

    if (!file || file.project.userId !== userId) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update path with new name
    const pathParts = file.path.split("/");
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join("/");

    await prisma.file.update({
        where: { id: fileId },
        data: { name: newName, path: newPath },
    });

    return NextResponse.json({ success: true });
}
