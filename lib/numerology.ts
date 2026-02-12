/**
 * Numerology & Astrology Utilities
 * Handles Life Path calculations (preserving master numbers) and Sun Sign determination
 */

/**
 * Calculate Life Path number from birth date
 * Preserves Master Numbers: 11, 22, 33
 * 
 * Example: May 28, 1980
 * 5 + 2 + 8 + 1 + 9 + 8 + 0 = 33 → Life Path 33 (Master Teacher)
 */
export function calculateLifePath(birthDate: Date): number {
  const month = birthDate.getMonth() + 1; // 0-indexed
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  
  // Sum ALL individual digits (this preserves master numbers)
  const dateString = `${month}${day}${year}`;
  let sum = 0;
  
  for (const char of dateString) {
    sum += parseInt(char, 10);
  }
  
  // Check for Master Numbers (11, 22, 33) BEFORE reducing
  if (sum === 11 || sum === 22 || sum === 33) {
    return sum; // Keep master numbers
  }
  
  // Otherwise reduce to single digit
  while (sum > 9) {
    const digits = sum.toString().split('');
    sum = digits.reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  
  return sum;
}

/**
 * Get Life Path meaning and description
 */
export function getLifePathMeaning(lifePathNumber: number): {
  title: string;
  description: string;
  strengths: string[];
} {
  const meanings: Record<number, { title: string; description: string; strengths: string[] }> = {
    1: {
      title: "The Leader",
      description: "Independent, pioneering, and ambitious. Natural-born leaders who forge their own path.",
      strengths: ["Leadership", "Independence", "Innovation", "Determination"]
    },
    2: {
      title: "The Peacemaker",
      description: "Diplomatic, intuitive, and cooperative. Natural mediators who seek harmony.",
      strengths: ["Diplomacy", "Intuition", "Cooperation", "Sensitivity"]
    },
    3: {
      title: "The Creative",
      description: "Expressive, optimistic, and imaginative. Natural communicators and artists.",
      strengths: ["Creativity", "Communication", "Optimism", "Social Skills"]
    },
    4: {
      title: "The Builder",
      description: "Practical, organized, and dependable. Natural organizers who build strong foundations.",
      strengths: ["Organization", "Reliability", "Hard Work", "Discipline"]
    },
    5: {
      title: "The Freedom Seeker",
      description: "Adventurous, versatile, and dynamic. Natural explorers who embrace change.",
      strengths: ["Adaptability", "Freedom", "Adventure", "Versatility"]
    },
    6: {
      title: "The Nurturer",
      description: "Responsible, caring, and protective. Natural healers and caregivers.",
      strengths: ["Compassion", "Responsibility", "Service", "Harmony"]
    },
    7: {
      title: "The Seeker",
      description: "Analytical, spiritual, and introspective. Natural philosophers and truth-seekers.",
      strengths: ["Analysis", "Wisdom", "Spirituality", "Intuition"]
    },
    8: {
      title: "The Powerhouse",
      description: "Ambitious, efficient, and authoritative. Natural executives and manifestors.",
      strengths: ["Ambition", "Authority", "Material Success", "Efficiency"]
    },
    9: {
      title: "The Humanitarian",
      description: "Compassionate, idealistic, and generous. Natural humanitarians and visionaries.",
      strengths: ["Compassion", "Idealism", "Wisdom", "Generosity"]
    },
    11: {
      title: "The Master Intuitive",
      description: "Highly intuitive, inspirational, and spiritual. Channels higher wisdom to inspire others.",
      strengths: ["Intuition", "Inspiration", "Spiritual Insight", "Vision"]
    },
    22: {
      title: "The Master Builder",
      description: "Visionary architect of grand plans. Turns dreams into reality on a massive scale.",
      strengths: ["Mastery", "Manifestation", "Vision", "Global Impact"]
    },
    33: {
      title: "The Master Teacher",
      description: "Highest level of spiritual teaching and healing. Selfless service to humanity through love and compassion.",
      strengths: ["Master Teaching", "Unconditional Love", "Healing", "Global Service"]
    }
  };
  
  return meanings[lifePathNumber] || meanings[1];
}

/**
 * Determine Sun Sign from birth date
 */
export function getSunSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1; // 0-indexed
  const day = birthDate.getDate();
  
  // Aries: March 21 - April 19
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  
  // Taurus: April 20 - May 20
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  
  // Gemini: May 21 - June 20
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  
  // Cancer: June 21 - July 22
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  
  // Leo: July 23 - August 22
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  
  // Virgo: August 23 - September 22
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  
  // Libra: September 23 - October 22
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  
  // Scorpio: October 23 - November 21
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  
  // Sagittarius: November 22 - December 21
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  
  // Capricorn: December 22 - January 19
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  
  // Aquarius: January 20 - February 18
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  
  // Pisces: February 19 - March 20
  return "Pisces";
}

/**
 * Calculate Universal Day Number from today's date
 */
export function calculateUniversalDayNumber(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Sum all digits
  let sum = 0;
  const dateStr = `${month}${day}${year}`;
  
  for (const char of dateStr) {
    sum += parseInt(char, 10);
  }
  
  // Reduce to single digit (1-9)
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  
  return sum;
}
