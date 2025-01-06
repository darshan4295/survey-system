import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InputJsonValue } from "@prisma/client/runtime/library";

export async function POST(
  req: Request, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any 
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
        surveyId: context.params.id,
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
        surveyId: context.params.id,
        userId: userId,
        completed: true,
        submittedAt: new Date(),
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            question: { connect: { id: questionId } },
            value:  value as InputJsonValue,
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
        surveyId: context.params.id,
      },
    });

    return NextResponse.json({ success: true, data: response });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Response creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit response" },
      { status: 500 }
    );
  }
}