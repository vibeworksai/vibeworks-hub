/**
 * Astrology API Integration
 * Uses Aztro API for daily horoscopes (free, no key required)
 */

type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type Horoscope = {
  date_range: string;
  current_date: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
};

/**
 * Fetch daily horoscope from Aztro API
 * Free API, no key required
 */
export async function getDailyHoroscope(sunSign: string): Promise<Horoscope | null> {
  try {
    const sign = sunSign.toLowerCase() as ZodiacSign;
    
    const response = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Aztro API error:", response.status);
      return getFallbackHoroscope(sunSign);
    }

    const data = await response.json();
    return data as Horoscope;
  } catch (error) {
    console.error("Failed to fetch horoscope:", error);
    return getFallbackHoroscope(sunSign);
  }
}

/**
 * Fallback horoscope if API fails
 */
function getFallbackHoroscope(sunSign: string): Horoscope {
  return {
    date_range: new Date().toLocaleDateString(),
    current_date: new Date().toLocaleDateString(),
    description: `Today brings opportunities for ${sunSign} natives. Trust your intuition and stay open to new experiences.`,
    compatibility: "All signs",
    mood: "Optimistic",
    color: "Blue",
    lucky_number: "7",
    lucky_time: "Morning",
  };
}

/**
 * Get zodiac sign emoji
 */
export function getZodiacEmoji(sunSign: string): string {
  const emojis: Record<string, string> = {
    aries: "♈",
    taurus: "♉",
    gemini: "♊",
    cancer: "♋",
    leo: "♌",
    virgo: "♍",
    libra: "♎",
    scorpio: "♏",
    sagittarius: "♐",
    capricorn: "♑",
    aquarius: "♒",
    pisces: "♓",
  };

  return emojis[sunSign.toLowerCase()] || "⭐";
}
