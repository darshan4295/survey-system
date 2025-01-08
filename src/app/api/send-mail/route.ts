/* eslint-disable @typescript-eslint/no-explicit-any */
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
  
    } catch (error: any) {
      console.error("Send notifications error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to send notifications" },
        { status: 500 }
      );
    }
  }
  