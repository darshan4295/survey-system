import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendSurveyNotification } from "@/lib/email"; // Assuming this function sends the email

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
      
      const { selectedUsers, title, surveyID } = data;

      const errors = [];
      if (!surveyID) errors.push({ field: "surveyID", message: "Survey ID is required" });
      if (!title) errors.push({ field: "title", message: "Title cannot be empty" });
  
      if (!selectedUsers || !Array.isArray(selectedUsers) || selectedUsers.length === 0) {
        return NextResponse.json(
          { success: false, error: "No users selected" },
          { status: 400 }
        );
      }
      
      if (!surveyID) {
        return NextResponse.json(
          { success: false, error: "Survey ID is required" },
          { status: 400 }
        );
      }
      // Fetch the survey to ensure it exists
      const survey = await prisma.survey.findUnique({
        where: { id: surveyID },
      });
  
      if (!survey) {
        return NextResponse.json(
          { success: false, error: "Survey not found" },
          { status: 404 }
        );
      }
  
      const selectedEmployees = await prisma.user.findMany({
        where: {
          id: {
            in: selectedUsers,
          },
        },
      });
  
      for (const employee of selectedEmployees) {
        console.log(`Sending email to: ${employee.email}`);
        await sendSurveyNotification(employee.email, title, surveyID); // Uncomment to send emails
      }
  
      return NextResponse.json({
        success: true,
        message: "Notifications sent successfully",
      });
  
    } catch (error: unknown) {
        console.error("Send notifications error:", error);
    
        // Narrow down the error type
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "Failed to send notifications";
    
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 500 }
        );
      }
  }
  