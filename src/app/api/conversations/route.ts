import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createConversationSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().max(200).optional(),
});

/**
 * POST /api/conversations — Create a new conversation
 */
export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { projectId, title } = parsed.data;

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const conversation = await prisma.conversation.create({
        data: {
            projectId,
            userId,
            title: title || "New Conversation",
        },
    });

    return NextResponse.json(conversation);
}
