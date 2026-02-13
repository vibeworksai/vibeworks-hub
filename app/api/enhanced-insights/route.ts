import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentMoonPhase, getNextFullMoon, getNextNewMoon } from "@/lib/moon-phase";
import { getDailyTarot } from "@/lib/tarot";
import { getTodayBusinessRecommendations } from "@/lib/business-timing";
import { calculateUniversalDayNumber } from "@/lib/numerology";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get moon phase
    const moonPhase = getCurrentMoonPhase();
    const nextFullMoon = getNextFullMoon();
    const nextNewMoon = getNextNewMoon();

    // Get daily tarot (personalized per user)
    const tarot = getDailyTarot(new Date(), session.user.id);

    // Get business timing recommendations (personalized per user)
    const universalDayNumber = calculateUniversalDayNumber();
    const businessRecommendations = getTodayBusinessRecommendations(
      session.user.lifePathNumber,
      universalDayNumber,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        moonPhase: {
          phase: moonPhase.phase,
          emoji: moonPhase.emoji,
          meaning: moonPhase.meaning,
          businessGuidance: moonPhase.businessGuidance,
          illumination: moonPhase.illumination,
        },
        tarot: {
          name: tarot.name,
          emoji: tarot.emoji,
          meaning: tarot.meaning,
          businessMeaning: tarot.businessMeaning,
          reversed: tarot.reversed,
        },
        businessRecommendations,
        nextFullMoon: nextFullMoon.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        nextNewMoon: nextNewMoon.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      },
    });
  } catch (error: any) {
    console.error("Enhanced insights error:", error);
    return NextResponse.json(
      { error: "Failed to load enhanced insights" },
      { status: 500 }
    );
  }
}
