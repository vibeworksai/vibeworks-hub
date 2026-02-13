/**
 * Business Timing Recommendations
 * Combines numerology, astrology, moon phase for optimal business decisions
 */

import { getCurrentMoonPhase } from "./moon-phase";
import { getDailyTarot } from "./tarot";

export type BusinessRecommendation = {
  category: string;
  score: number; // 1-10
  recommendation: string;
  reasoning: string;
};

export type DealProbability = {
  probability: number; // 0-100
  confidence: "Low" | "Medium" | "High";
  factors: string[];
  recommendation: string;
};

/**
 * Calculate deal closing probability based on mystical factors
 */
export function calculateDealProbability(
  dealValue: number,
  dealStage: string,
  lifePathNumber: number,
  universalDayNumber: number
): DealProbability {
  let score = 50; // Base 50%
  const factors: string[] = [];

  // Life Path influence
  if (lifePathNumber === 8 || lifePathNumber === 22) {
    score += 15;
    factors.push(`Life Path ${lifePathNumber} (Power/Manifestation) - Highly favorable`);
  } else if (lifePathNumber === 1 || lifePathNumber === 11) {
    score += 10;
    factors.push(`Life Path ${lifePathNumber} (Leadership) - Favorable`);
  }

  // Universal Day influence
  if (universalDayNumber === 8) {
    score += 20;
    factors.push("Universal Day 8 (Material Success) - Perfect for deals");
  } else if (universalDayNumber === 1) {
    score += 10;
    factors.push("Universal Day 1 (New Beginnings) - Good for initiating");
  } else if (universalDayNumber === 9) {
    score -= 10;
    factors.push("Universal Day 9 (Completion) - Better to finish existing deals");
  }

  // Moon Phase influence
  const moonPhase = getCurrentMoonPhase();
  if (moonPhase.phase === "Full Moon") {
    score += 15;
    factors.push("Full Moon - Peak energy for closing");
  } else if (moonPhase.phase === "New Moon") {
    score += 10;
    factors.push("New Moon - Great for starting negotiations");
  } else if (moonPhase.phase.includes("Waning")) {
    score -= 5;
    factors.push("Waning Moon - Less favorable for new deals");
  }

  // Deal stage influence
  if (dealStage === "Negotiation" || dealStage === "Proposal") {
    score += 5;
    factors.push("Deal stage optimal for closing");
  }

  // Deal value influence (larger deals = slightly lower probability)
  if (dealValue > 100000) {
    score -= 5;
    factors.push("Large deal - requires more alignment");
  }

  // Note: Tarot influence requires userId context, skip for deal probability
  // (This function doesn't have userId parameter, would need refactor to add it)

  // Cap between 0-100
  const probability = Math.max(0, Math.min(100, score));

  let confidence: "Low" | "Medium" | "High";
  if (factors.length >= 5) confidence = "High";
  else if (factors.length >= 3) confidence = "Medium";
  else confidence = "Low";

  let recommendation: string;
  if (probability >= 75) {
    recommendation = "🔥 HIGHLY FAVORABLE - Push for close today";
  } else if (probability >= 60) {
    recommendation = "✅ FAVORABLE - Good timing to advance";
  } else if (probability >= 40) {
    recommendation = "⚠️ MIXED - Proceed with caution";
  } else {
    recommendation = "❌ CHALLENGING - Consider delaying or restructuring";
  }

  return {
    probability,
    confidence,
    factors,
    recommendation,
  };
}

/**
 * Get best days for launching new ventures
 */
export function getBestLaunchDays(fromDate: Date = new Date()): Date[] {
  const bestDays: Date[] = [];
  const checkDays = 30; // Look ahead 30 days

  for (let i = 0; i < checkDays; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + i);

    // Calculate day score
    const month = checkDate.getMonth() + 1;
    const day = checkDate.getDate();
    const year = checkDate.getFullYear();

    // Universal Day for that date
    const dateString = `${month}${day}${year}`;
    let sum = 0;
    for (const char of dateString) {
      sum += parseInt(char, 10);
    }
    while (sum > 9) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    const universalDay = sum;

    // Check moon phase for that date
    const moonPhase = getCurrentMoonPhase(checkDate);

    // Ideal conditions: Universal Day 1 or 8, New Moon or Full Moon
    const isIdealUniversalDay = universalDay === 1 || universalDay === 8;
    const isIdealMoonPhase =
      moonPhase.phase === "New Moon" || moonPhase.phase === "Full Moon";

    if (isIdealUniversalDay && isIdealMoonPhase) {
      bestDays.push(checkDate);
    }
  }

  return bestDays.slice(0, 5); // Return top 5
}

/**
 * Team compatibility analysis (Life Path numbers)
 */
export function analyzeTeamCompatibility(
  teamMembers: { name: string; lifePathNumber: number }[]
): {
  overall: number;
  insights: string[];
} {
  if (teamMembers.length < 2) {
    return {
      overall: 50,
      insights: ["Need at least 2 team members for compatibility analysis"],
    };
  }

  let compatibilityScore = 50;
  const insights: string[] = [];

  // Check for master numbers
  const masterNumbers = teamMembers.filter(
    (m) => m.lifePathNumber === 11 || m.lifePathNumber === 22 || m.lifePathNumber === 33
  );
  if (masterNumbers.length >= 1) {
    compatibilityScore += 10;
    insights.push(
      `Master number presence (${masterNumbers.map((m) => m.name).join(", ")}) - High spiritual alignment`
    );
  }

  // Check for balanced skills (1=Leader, 4=Builder, 8=Executive, 3=Creative, 7=Strategist)
  const leaders = teamMembers.filter((m) => m.lifePathNumber === 1 || m.lifePathNumber === 11);
  const builders = teamMembers.filter((m) => m.lifePathNumber === 4 || m.lifePathNumber === 22);
  const executives = teamMembers.filter((m) => m.lifePathNumber === 8);
  const creatives = teamMembers.filter((m) => m.lifePathNumber === 3);
  const strategists = teamMembers.filter((m) => m.lifePathNumber === 7);

  if (leaders.length >= 1 && builders.length >= 1) {
    compatibilityScore += 15;
    insights.push("Leadership + Builder balance - Strong execution capability");
  }

  if (creatives.length >= 1 && strategists.length >= 1) {
    compatibilityScore += 10;
    insights.push("Creative + Strategic balance - Innovation with planning");
  }

  if (executives.length >= 1) {
    compatibilityScore += 10;
    insights.push("Executive presence - Strong manifestation energy");
  }

  // Check for too many of same number (can cause friction)
  const counts: Record<number, number> = {};
  teamMembers.forEach((m) => {
    counts[m.lifePathNumber] = (counts[m.lifePathNumber] || 0) + 1;
  });

  const duplicates = Object.entries(counts).filter(([, count]) => count > 2);
  if (duplicates.length > 0) {
    compatibilityScore -= 10;
    insights.push(
      "Multiple members with same Life Path - May create competition or blind spots"
    );
  }

  // Cap score
  compatibilityScore = Math.max(0, Math.min(100, compatibilityScore));

  return {
    overall: compatibilityScore,
    insights,
  };
}

/**
 * Get today's business recommendations
 */
export function getTodayBusinessRecommendations(
  lifePathNumber: number,
  universalDayNumber: number,
  userId?: string
): BusinessRecommendation[] {
  const recommendations: BusinessRecommendation[] = [];
  const moonPhase = getCurrentMoonPhase();
  const tarot = getDailyTarot(new Date(), userId);

  // Deal Closing (personalized)
  let dealScore = 5;
  let dealReasoning = "";
  
  // Add user-specific variation (-1 to +1)
  if (userId) {
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = (userSeed % 3) - 1; // -1, 0, or +1
    dealScore += variation;
  }

  if (universalDayNumber === 8) {
    dealScore += 3;
    dealReasoning += "Universal Day 8 (Power). ";
  }
  if (moonPhase.phase === "Full Moon") {
    dealScore += 2;
    dealReasoning += "Full Moon energy. ";
  }
  if (lifePathNumber === 8 || lifePathNumber === 22) {
    dealScore += 1;
    dealReasoning += `Your Life Path ${lifePathNumber}. `;
  }

  recommendations.push({
    category: "Deal Closing",
    score: Math.min(10, dealScore),
    recommendation:
      dealScore >= 8
        ? "Highly favorable - Push for closes"
        : dealScore >= 6
        ? "Favorable - Good day for negotiations"
        : "Mixed - Focus on relationship building",
    reasoning: dealReasoning + moonPhase.businessGuidance,
  });

  // New Ventures (personalized)
  let ventureScore = 5;
  let ventureReasoning = "";
  
  // Add user-specific variation (-1 to +1)
  if (userId) {
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = ((userSeed * 2) % 3) - 1; // Different seed than deal score
    ventureScore += variation;
  }

  if (universalDayNumber === 1) {
    ventureScore += 3;
    ventureReasoning += "Universal Day 1 (New Beginnings). ";
  }
  if (moonPhase.phase === "New Moon") {
    ventureScore += 2;
    ventureReasoning += "New Moon - perfect for launches. ";
  }

  recommendations.push({
    category: "New Ventures",
    score: Math.min(10, ventureScore),
    recommendation:
      ventureScore >= 8
        ? "Excellent timing for launches"
        : ventureScore >= 6
        ? "Good for planning new initiatives"
        : "Better to refine existing projects",
    reasoning: ventureReasoning || "Focus on existing momentum.",
  });

  // Strategic Planning (personalized)
  let strategyScore = 5;
  let strategyReasoning = "";
  
  // Add user-specific variation (0 to +2)
  if (userId) {
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = (userSeed * 3) % 3; // Different seed, 0-2 range
    strategyScore += variation;
  }

  if (universalDayNumber === 7) {
    strategyScore += 3;
    strategyReasoning += "Universal Day 7 (Analysis). ";
  }
  if (lifePathNumber === 7 || lifePathNumber === 11) {
    strategyScore += 1;
    strategyReasoning += "Your natural strategic energy. ";
  }

  recommendations.push({
    category: "Strategic Planning",
    score: Math.min(10, strategyScore),
    recommendation:
      strategyScore >= 7 ? "Ideal for deep strategic work" : "Good for tactical execution",
    reasoning: strategyReasoning || "Balance strategy with action.",
  });

  return recommendations;
}
