import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the user data from the database using the userId
    const user = await prisma.user.findMany({
        where: {
          role: 'EMPLOYEE',
        }
      });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return the user data
    return NextResponse.json({ success: true, data: user });

  } catch (error: unknown) {
    console.error("Failed to load Users:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Failed to load Users:";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
