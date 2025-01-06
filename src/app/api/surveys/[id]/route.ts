import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    const surveyId = (await params).id;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if survey exists and belongs to the user
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: { creatorId: true }
    });

    if (!survey) {
      return NextResponse.json(
        { success: false, error: "Survey not found" },
        { status: 404 }
      );
    }

    if (survey.creatorId !== userId) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this survey" },
        { status: 403 }
      );
    }

    // Use transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete all answers related to the survey's responses
      await tx.answer.deleteMany({
        where: {
          response: {
            surveyId: surveyId
          }
        }
      });

      // Delete all responses
      await tx.response.deleteMany({
        where: {
          surveyId: surveyId
        }
      });

      // Delete all email notifications
      await tx.emailNotification.deleteMany({
        where: {
          surveyId: surveyId
        }
      });

      // Delete all questions
      await tx.question.deleteMany({
        where: {
          surveyId: surveyId
        }
      });

      // Finally, delete the survey
      await tx.survey.delete({
        where: {
          id: surveyId
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Survey deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { success: false, error: "Failed to delete survey" },
      { status: 500 }
    );
  }
}