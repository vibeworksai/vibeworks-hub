import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Ensure onboarding is marked complete
    const result = await sql`
      UPDATE users 
      SET 
        onboarding_complete = TRUE,
        updated_at = NOW()
      WHERE id = ${session.user.id}
      RETURNING id, onboarding_complete
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`User ${session.user.id} onboarding marked complete:`, result[0]);

    return NextResponse.json({
      success: true,
      data: {
        onboardingComplete: result[0].onboarding_complete,
      },
    });
  } catch (error: any) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
