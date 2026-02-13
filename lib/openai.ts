import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY not configured. Intelligence features will use mock data.");
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const isOpenAIConfigured = () => {
  return Boolean(apiKey);
};

/**
 * Call GPT-4 with a system prompt and user message
 */
export async function callGPT4(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI not configured");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return completion.choices[0].message.content || "";
}

/**
 * Call GPT-4 and request JSON output
 */
export async function callGPT4JSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  if (!openai) {
    throw new Error("OpenAI not configured");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: systemPrompt + "\n\nRespond with valid JSON only." },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content || "{}";
  return JSON.parse(content);
}
