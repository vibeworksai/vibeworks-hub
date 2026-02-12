/**
 * Moon Phase Calculations
 * Based on astronomical formulas - no API needed
 */

export type MoonPhase = {
  phase: string;
  illumination: number;
  emoji: string;
  meaning: string;
  businessGuidance: string;
};

/**
 * Calculate current moon phase
 * Algorithm based on astronomical calculations
 */
export function getCurrentMoonPhase(date: Date = new Date()): MoonPhase {
  // Known new moon: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const lunarMonth = 29.53058867; // days

  // Calculate days since known new moon
  const daysSinceNewMoon =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate current position in lunar cycle
  const currentPhase = (daysSinceNewMoon % lunarMonth) / lunarMonth;

  // Determine phase name and illumination
  let phase: string;
  let emoji: string;
  let meaning: string;
  let businessGuidance: string;
  let illumination: number;

  if (currentPhase < 0.0625 || currentPhase >= 0.9375) {
    phase = "New Moon";
    emoji = "🌑";
    illumination = 0;
    meaning = "New beginnings, fresh starts, planting seeds";
    businessGuidance =
      "Perfect for starting new projects, launching ventures, setting intentions. Initiate deals.";
  } else if (currentPhase < 0.1875) {
    phase = "Waxing Crescent";
    emoji = "🌒";
    illumination = 25;
    meaning = "Growth, expansion, building momentum";
    businessGuidance =
      "Build on new initiatives. Network actively. Momentum is building.";
  } else if (currentPhase < 0.3125) {
    phase = "First Quarter";
    emoji = "🌓";
    illumination = 50;
    meaning = "Action, decision-making, overcoming obstacles";
    businessGuidance =
      "Make bold decisions. Push through resistance. Take decisive action on deals.";
  } else if (currentPhase < 0.4375) {
    phase = "Waxing Gibbous";
    emoji = "🌔";
    illumination = 75;
    meaning = "Refinement, adjustment, preparation";
    businessGuidance =
      "Fine-tune strategies. Prepare for launches. Refine pitches before major presentations.";
  } else if (currentPhase < 0.5625) {
    phase = "Full Moon";
    emoji = "🌕";
    illumination = 100;
    meaning = "Culmination, celebration, peak energy";
    businessGuidance =
      "Close major deals. Launch products. Celebrate wins. Maximum visibility and energy.";
  } else if (currentPhase < 0.6875) {
    phase = "Waning Gibbous";
    emoji = "🌖";
    illumination = 75;
    meaning = "Gratitude, sharing, teaching";
    businessGuidance =
      "Share knowledge. Mentor team members. Express gratitude to clients and partners.";
  } else if (currentPhase < 0.8125) {
    phase = "Last Quarter";
    emoji = "🌗";
    illumination = 50;
    meaning = "Release, forgiveness, letting go";
    businessGuidance =
      "Cut underperforming projects. Release what doesn't serve you. Make space for new opportunities.";
  } else {
    phase = "Waning Crescent";
    emoji = "🌘";
    illumination = 25;
    meaning = "Rest, reflection, introspection";
    businessGuidance =
      "Review and reflect. Rest before next cycle. Strategic planning, not execution.";
  }

  return {
    phase,
    illumination,
    emoji,
    meaning,
    businessGuidance,
  };
}

/**
 * Get next significant moon phase date
 */
export function getNextFullMoon(fromDate: Date = new Date()): Date {
  const lunarMonth = 29.53058867;
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));

  const daysSinceNewMoon =
    (fromDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentPhase = (daysSinceNewMoon % lunarMonth) / lunarMonth;

  let daysUntilFullMoon: number;
  if (currentPhase < 0.5) {
    daysUntilFullMoon = (0.5 - currentPhase) * lunarMonth;
  } else {
    daysUntilFullMoon = (1 - currentPhase + 0.5) * lunarMonth;
  }

  return new Date(fromDate.getTime() + daysUntilFullMoon * 24 * 60 * 60 * 1000);
}

export function getNextNewMoon(fromDate: Date = new Date()): Date {
  const lunarMonth = 29.53058867;
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));

  const daysSinceNewMoon =
    (fromDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const daysUntilNewMoon = lunarMonth - (daysSinceNewMoon % lunarMonth);

  return new Date(fromDate.getTime() + daysUntilNewMoon * 24 * 60 * 60 * 1000);
}
