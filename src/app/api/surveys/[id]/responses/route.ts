import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type InputJsonValue = string | number | boolean | { [Key: string]: InputJsonValue } | InputJsonValue[];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        responses: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            answers: {
              include: {
                question: true
              }
            }
          }
        }
      }
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: survey });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { answers } = await req.json();

    // Check if user has already responded
    const existingResponse = await prisma.response.findFirst({
      where: {
        surveyId: id,
        userId: userId
      }
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already submitted a response" },
        { status: 400 }
      );
    }

    // Create the response
    const response = await prisma.response.create({
      data: {
        surveyId: id,
        userId: userId,
        completed: true,
        submittedAt: new Date(),
      },
    });

    // Create answers one by one
    for (const [questionId, value] of Object.entries(answers)) {
      await prisma.answer.create({
        data: {
          questionId,
          responseId: response.id,
          value: processAnswerValue(value),
        },
      });
    }

    // Award points
    await prisma.reward.create({
      data: {
        userId,
        points: 10,
        reason: "Survey completion",
        surveyId: id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Response submitted successfully",
      data: {
        responseId: response.id
      }
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}

function processAnswerValue(value: unknown): InputJsonValue {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(processAnswerValue);
  }

  if (value && typeof value === 'object') {
    const result: { [key: string]: InputJsonValue } = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = processAnswerValue(val);
    }
    return result;
  }

  // Default to string for any other types
  return String(value);
}