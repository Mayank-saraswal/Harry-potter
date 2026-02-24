import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * GET /api/projects — List all projects for the current user
 * GET /api/projects?limit=5 — List limited projects
 */
export async function GET(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    let take: number | undefined;
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 100) {
            return NextResponse.json({ error: "Invalid limit parameter" }, { status: 400 });
        }
        take = parsed;
    }

    const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        ...(take ? { take } : {}),
    });

    return NextResponse.json(projects);
}

const createProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    language: z.string().min(1).max(50).optional(),
    framework: z.string().max(50).optional(),
});

/**
 * POST /api/projects — Create a new project
 */
export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, language, framework } = parsed.data;

    const project = await prisma.project.create({
        data: {
            userId,
            name: name || "untitled-project",
            language: language || "typescript",
            framework,
        },
    });

    return NextResponse.json(project);
}
