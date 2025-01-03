import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { answers } = await req.json();

    // Check if user has already responded
    const existingResponse = await prisma.response.findFirst({
      where: {
        surveyId: params.id,
        userId: userId
      }
    });

    if (existingResponse) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a response" },
        { status: 400 }
      );
    }

    // Create response and answers
    const response = await prisma.response.create({
      data: {
        surveyId: params.id,
        userId: userId,
        completed: true,
        submittedAt: new Date(),
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: value,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Award points for completing survey
    await prisma.reward.create({
      data: {
        userId: userId,
        points: 10,
        reason: "Survey completion",
        surveyId: params.id,
      },
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Response creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit response" },
      { status: 500 }
    );
  }
}