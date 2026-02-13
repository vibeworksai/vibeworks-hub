/**
 * Daily Tarot Card
 * Deterministic selection based on date for consistency
 */

export type TarotCard = {
  name: string;
  arcana: "Major" | "Minor";
  suit?: string;
  meaning: string;
  businessMeaning: string;
  reversed: boolean;
  emoji: string;
};

const majorArcana: Omit<TarotCard, "reversed">[] = [
  {
    name: "The Fool",
    arcana: "Major",
    emoji: "🃏",
    meaning: "New beginnings, spontaneity, faith in the universe",
    businessMeaning:
      "Take calculated risks. Innovation over convention. Trust your entrepreneurial instincts.",
  },
  {
    name: "The Magician",
    arcana: "Major",
    emoji: "🎩",
    meaning: "Manifestation, resourcefulness, power",
    businessMeaning:
      "You have all the tools you need. Execute with confidence. Turn ideas into reality.",
  },
  {
    name: "The High Priestess",
    arcana: "Major",
    emoji: "🔮",
    meaning: "Intuition, sacred knowledge, divine feminine",
    businessMeaning:
      "Trust your gut. Hidden information will reveal itself. Listen more than you speak.",
  },
  {
    name: "The Empress",
    arcana: "Major",
    emoji: "👑",
    meaning: "Abundance, nurturing, creativity",
    businessMeaning:
      "Nurture your projects. Abundance is flowing. Creative solutions to business problems.",
  },
  {
    name: "The Emperor",
    arcana: "Major",
    emoji: "⚔️",
    meaning: "Authority, structure, control",
    businessMeaning:
      "Establish structure and systems. Lead with authority. Strategic planning pays off.",
  },
  {
    name: "The Hierophant",
    arcana: "Major",
    emoji: "📿",
    meaning: "Tradition, conformity, education",
    businessMeaning:
      "Follow proven systems. Seek mentorship. Traditional approaches work today.",
  },
  {
    name: "The Lovers",
    arcana: "Major",
    emoji: "💕",
    meaning: "Choices, partnerships, alignment",
    businessMeaning:
      "Important partnerships forming. Choose collaborators wisely. Alignment creates success.",
  },
  {
    name: "The Chariot",
    arcana: "Major",
    emoji: "🏇",
    meaning: "Determination, willpower, victory",
    businessMeaning:
      "Push forward aggressively. Victory through determination. Control competing priorities.",
  },
  {
    name: "Strength",
    arcana: "Major",
    emoji: "🦁",
    meaning: "Courage, patience, compassion",
    businessMeaning:
      "Lead with compassion. Patience yields results. Inner strength over force.",
  },
  {
    name: "The Hermit",
    arcana: "Major",
    emoji: "🕯️",
    meaning: "Introspection, solitude, wisdom",
    businessMeaning:
      "Strategic solitude. Deep thinking required. Withdraw to gain clarity before acting.",
  },
  {
    name: "Wheel of Fortune",
    arcana: "Major",
    emoji: "☸️",
    meaning: "Cycles, destiny, turning points",
    businessMeaning:
      "Major shifts incoming. Adapt to change. Cycles turning in your favor.",
  },
  {
    name: "Justice",
    arcana: "Major",
    emoji: "⚖️",
    meaning: "Fairness, truth, cause and effect",
    businessMeaning:
      "Fair dealings bring success. Contracts and legal matters favored. Truth prevails.",
  },
  {
    name: "The Hanged Man",
    arcana: "Major",
    emoji: "🙃",
    meaning: "Pause, surrender, new perspective",
    businessMeaning:
      "Strategic pause before acting. See problems from new angle. Surrender control to gain it.",
  },
  {
    name: "Death",
    arcana: "Major",
    emoji: "💀",
    meaning: "Transformation, endings, new beginnings",
    businessMeaning:
      "End what no longer serves you. Transformation brings growth. Kill old business models.",
  },
  {
    name: "Temperance",
    arcana: "Major",
    emoji: "🧘",
    meaning: "Balance, moderation, patience",
    businessMeaning:
      "Balance competing priorities. Moderate approach wins. Patience with processes.",
  },
  {
    name: "The Devil",
    arcana: "Major",
    emoji: "😈",
    meaning: "Bondage, materialism, temptation",
    businessMeaning:
      "Break limiting beliefs. Avoid material obsession. Freedom from business constraints.",
  },
  {
    name: "The Tower",
    arcana: "Major",
    emoji: "🏰",
    meaning: "Upheaval, sudden change, revelation",
    businessMeaning:
      "Disruptive innovation. Sudden market shifts. Rebuild stronger from chaos.",
  },
  {
    name: "The Star",
    arcana: "Major",
    emoji: "⭐",
    meaning: "Hope, inspiration, renewal",
    businessMeaning:
      "Vision and hope guide you. Inspire your team. Renewed optimism attracts opportunities.",
  },
  {
    name: "The Moon",
    arcana: "Major",
    emoji: "🌙",
    meaning: "Illusion, intuition, uncertainty",
    businessMeaning:
      "Not all is as it seems. Trust intuition over data. Navigate uncertainty with care.",
  },
  {
    name: "The Sun",
    arcana: "Major",
    emoji: "☀️",
    meaning: "Success, vitality, joy",
    businessMeaning:
      "Peak success and visibility. Everything illuminated. Maximum confidence and energy.",
  },
  {
    name: "Judgment",
    arcana: "Major",
    emoji: "📯",
    meaning: "Reflection, reckoning, awakening",
    businessMeaning:
      "Evaluate past decisions. Second chances available. Strategic pivots favored.",
  },
  {
    name: "The World",
    arcana: "Major",
    emoji: "🌍",
    meaning: "Completion, achievement, fulfillment",
    businessMeaning:
      "Major milestone achieved. Celebrate success. One cycle ends, another begins.",
  },
];

/**
 * Get daily tarot card (deterministic based on date + user ID)
 * Each user gets a unique card per day
 */
export function getDailyTarot(date: Date = new Date(), userId?: string): TarotCard {
  // Use date + userId as seed for deterministic but personalized selection
  const dateString = date.toISOString().split("T")[0];
  let seed = dateString.split("-").reduce((acc, val) => acc + parseInt(val, 10), 0);
  
  // Add user ID to seed for personalization
  if (userId) {
    // Convert userId string to number
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    seed = seed * userSeed;
  }

  const cardIndex = seed % majorArcana.length;
  const baseCard = majorArcana[cardIndex];

  // Determine if reversed (upside down) - based on combined seed
  const reversed = seed % 2 === 0;

  return {
    ...baseCard,
    reversed,
    meaning: reversed ? `(Reversed) ${baseCard.meaning} - blocked or inverted energy` : baseCard.meaning,
    businessMeaning: reversed
      ? `(Reversed) Obstacles or delays in: ${baseCard.businessMeaning.toLowerCase()}`
      : baseCard.businessMeaning,
  };
}
