import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { calculateUniversalDayNumber } from "@/lib/numerology";
import { getDailyHoroscope } from "@/lib/astrology";
import { generatePersonalizedAdvice } from "@/lib/ai-advice";

// Energy types for Universal Day Numbers 1-9
const universalDayEnergies: Record<number, string> = {
  1: "New Beginnings & Leadership",
  2: "Partnership & Cooperation",
  3: "Creativity & Expression",
  4: "Foundation & Structure",
  5: "Change & Adventure",
  6: "Harmony & Service",
  7: "Analysis & Strategy",
  8: "Power & Material Success",
  9: "Completion & Wisdom",
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if we have cached advice for today
    if (sql) {
      const cachedAdvice = await sql`
        SELECT * FROM personalized_advice
        WHERE user_id = ${session.user.id}
          AND advice_date = ${today}
      `;

      if (cachedAdvice.length > 0) {
        // Return cached advice
        const cache = cachedAdvice[0];
        return NextResponse.json({
          success: true,
          data: {
            universalDayNumber: cache.universal_day_number,
            universalDayEnergy: universalDayEnergies[cache.universal_day_number] || "Unknown",
            horoscope: JSON.parse(cache.horoscope_text || "{}"),
            personalizedAdvice: cache.advice_text,
          },
          cached: true,
        });
      }
    }

    // Generate fresh personalized data
    const universalDayNumber = calculateUniversalDayNumber();
    const horoscope = await getDailyHoroscope(session.user.sunSign);

    // Fetch user's projects (if any)
    let userProjects: string[] = [];
    if (sql) {
      try {
        const projects = await sql`
          SELECT name FROM projects
          WHERE status = 'On Track'
          ORDER BY updated_at DESC
          LIMIT 5
        `;
        userProjects = projects.map((p: any) => p.name);
      } catch (error) {
        // Projects table might not exist yet, that's ok
        console.log("Projects not available, skipping");
      }
    }

    // Generate AI-powered advice
    const personalizedAdvice = await generatePersonalizedAdvice({
      userName: session.user.name || "friend",
      lifePathNumber: session.user.lifePathNumber,
      universalDayNumber,
      sunSign: session.user.sunSign,
      horoscope: horoscope || {
        description: "Trust your intuition today.",
        mood: "Optimistic",
        color: "Blue",
        lucky_number: "7",
        date_range: "",
        current_date: "",
        compatibility: "",
        lucky_time: "",
      },
      userProjects,
    });

    // Cache the advice
    if (sql && horoscope) {
      await sql`
        INSERT INTO personalized_advice (
          user_id,
          advice_date,
          advice_text,
          universal_day_number,
          horoscope_text
        ) VALUES (
          ${session.user.id},
          ${today},
          ${personalizedAdvice},
          ${universalDayNumber},
          ${JSON.stringify(horoscope)}
        )
        ON CONFLICT (user_id, advice_date)
        DO UPDATE SET
          advice_text = ${personalizedAdvice},
          universal_day_number = ${universalDayNumber},
          horoscope_text = ${JSON.stringify(horoscope)}
      `;
    }

    return NextResponse.json({
      success: true,
      data: {
        universalDayNumber,
        universalDayEnergy: universalDayEnergies[universalDayNumber] || "Unknown",
        horoscope: horoscope
          ? {
              description: horoscope.description,
              mood: horoscope.mood,
              color: horoscope.color,
              lucky_number: horoscope.lucky_number,
            }
          : null,
        personalizedAdvice,
      },
      cached: false,
    });
  } catch (error: any) {
    console.error("Mystical dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load personalized data" },
      { status: 500 }
    );
  }
}
