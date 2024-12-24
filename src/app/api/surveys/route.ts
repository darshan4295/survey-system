import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSurveyNotification } from "@/lib/email";

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

    const survey = await prisma.survey.create({
      data: {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        creatorId: userId,
        questions: {
          create: data.questions.map((q: any, index: number) => ({
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

    // Get all employees
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        id: {
          not: userId // Don't send to creator
        }
      }
    });

    // Send notifications
    for (const employee of employees) {
      await sendSurveyNotification(
        employee.email,
        survey.title,
        survey.id
      );
    }

    return NextResponse.json({ success: true, data: survey });

  } catch (error: any) {
    console.error("Survey creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create survey" },
      { status: 500 }
    );
  }
}