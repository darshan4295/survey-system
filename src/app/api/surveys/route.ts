import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.startDate || !data.endDate || !Array.isArray(data.questions)) {
      return NextResponse.json(
        { success: false, error: "Invalid data provided" },
        { status: 400 }
      );
    }

    // Create the survey
    const survey = await prisma.survey.create({
      data: {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        creatorId: userId,
        questions: {
          create: data.questions.map((q: Record<string, unknown>, index: number) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            order: index,
            options: q.options || [],
            minLength: q.minLength || null,
            maxLength: q.maxLength || null,
            dateRange: q.dateRange || null,
            timeRange: q.timeRange || null,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ success: true, data: survey });
  } catch (error: unknown) {
    console.error("Survey creation error:", error);

    // Narrow the error type for better error handling
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while creating the survey";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
