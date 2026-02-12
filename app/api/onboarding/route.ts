import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { calculateLifePath, getSunSign } from "@/lib/numerology";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { birthDate, birthTime, birthPlace, birthLat, birthLng } = body;

    // Validate required fields
    if (!birthDate) {
      return NextResponse.json(
        { error: "Birth date is required" },
        { status: 400 }
      );
    }

    // Parse birth date
    const birthDateObj = new Date(birthDate);
    
    // Calculate Life Path number (preserving master numbers)
    const lifePathNumber = calculateLifePath(birthDateObj);
    
    // Determine Sun Sign
    const sunSign = getSunSign(birthDateObj);

    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Update user record
    await sql`
      UPDATE users 
      SET 
        birth_date = ${birthDate},
        birth_time = ${birthTime || null},
        birth_place = ${birthPlace || null},
        birth_lat = ${birthLat || null},
        birth_lng = ${birthLng || null},
        life_path_number = ${lifePathNumber},
        sun_sign = ${sunSign},
        onboarding_complete = TRUE,
        updated_at = NOW()
      WHERE id = ${session.user.id}
    `;

    return NextResponse.json({
      success: true,
      data: {
        lifePathNumber,
        sunSign,
      },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
