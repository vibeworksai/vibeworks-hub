import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculateDealProbability } from "@/lib/business-timing";
import { calculateUniversalDayNumber } from "@/lib/numerology";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dealValue = parseFloat(searchParams.get("dealValue") || "0");
    const dealStage = searchParams.get("dealStage") || "Discovery";

    const universalDayNumber = calculateUniversalDayNumber();

    const probability = calculateDealProbability(
      dealValue,
      dealStage,
      session.user.lifePathNumber,
      universalDayNumber
    );

    return NextResponse.json({
      success: true,
      data: probability,
    });
  } catch (error: any) {
    console.error("Deal probability error:", error);
    return NextResponse.json(
      { error: "Failed to calculate deal probability" },
      { status: 500 }
    );
  }
}
