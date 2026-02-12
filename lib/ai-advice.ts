/**
 * AI-Powered Personalized Advice Generation
 * Uses OpenAI GPT-4 to combine numerology, astrology, and user context
 */

import OpenAI from "openai";
import { getLifePathMeaning } from "./numerology";
import type { Horoscope } from "./astrology";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

type PersonalizedAdviceInput = {
  userName: string;
  lifePathNumber: number;
  universalDayNumber: number;
  sunSign: string;
  horoscope: Horoscope;
  userProjects?: string[];
};

/**
 * Generate personalized daily advice using GPT-4
 */
export async function generatePersonalizedAdvice(
  input: PersonalizedAdviceInput
): Promise<string> {
  if (!openai.apiKey) {
    console.warn("OpenAI API key not configured, using fallback advice");
    return generateFallbackAdvice(input);
  }

  try {
    const lifePathMeaning = getLifePathMeaning(input.lifePathNumber);

    const prompt = `Generate personalized daily guidance for ${input.userName}:

**Numerology Profile:**
- Life Path: ${input.lifePathNumber} (${lifePathMeaning.title})
- Universal Day Number: ${input.universalDayNumber}

**Astrology:**
- Sun Sign: ${input.sunSign}
- Today's Horoscope: ${input.horoscope.description}
- Mood: ${input.horoscope.mood}
- Lucky Color: ${input.horoscope.color}

${input.userProjects && input.userProjects.length > 0 ? `**Active Projects:**\n${input.userProjects.map(p => `- ${p}`).join('\n')}` : ''}

Provide 3-4 sentences of actionable, empowering advice that:
1. Combines the Life Path ${input.lifePathNumber} energy with Universal Day ${input.universalDayNumber}
2. Integrates insights from the ${input.sunSign} horoscope
3. ${input.userProjects && input.userProjects.length > 0 ? 'Offers specific guidance for their active projects' : 'Provides general strategic guidance'}

Tone: Mystical yet practical, empowering, conversational. No fluff - actionable wisdom only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a mystical advisor combining numerology, astrology, and practical business wisdom. You provide clear, actionable guidance that empowers entrepreneurs and creators.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const advice = completion.choices[0]?.message?.content?.trim();

    if (!advice) {
      return generateFallbackAdvice(input);
    }

    return advice;
  } catch (error) {
    console.error("OpenAI advice generation failed:", error);
    return generateFallbackAdvice(input);
  }
}

/**
 * Fallback advice when OpenAI is unavailable
 */
function generateFallbackAdvice(input: PersonalizedAdviceInput): string {
  const lifePathMeaning = getLifePathMeaning(input.lifePathNumber);

  return `Your Life Path ${input.lifePathNumber} (${lifePathMeaning.title}) energy combines powerfully with today's Universal Day ${input.universalDayNumber}. ${input.horoscope.description} Focus on ${lifePathMeaning.strengths[0].toLowerCase()} and ${lifePathMeaning.strengths[1].toLowerCase()} today. The stars align for ${input.sunSign} natives to make bold moves. Trust your intuition and act with confidence.`;
}
