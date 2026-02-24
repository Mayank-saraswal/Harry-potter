import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ projectId: string }> };

const renameSchema = z.object({
    name: z.string().min(1).max(100),
});

/**
 * POST /api/projects/[projectId]/rename — Rename a project
 */
export async function POST(request: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const parsed = renameSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name } = parsed.data;

    const project = await prisma.project.updateMany({
        where: { id: projectId, userId },
        data: { name },
    });

    if (project.count === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
