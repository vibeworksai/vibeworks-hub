import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Comprehensive diagnostic endpoint for OpenAI API issues
 */
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      error: "OPENAI_API_KEY not configured",
      hasKey: false
    });
  }

  const openai = new OpenAI({ apiKey });
  const results: any = {
    apiKeyConfigured: true,
    apiKeyPrefix: apiKey.substring(0, 20) + "...",
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: List available models
  try {
    const models = await openai.models.list();
    const gptModels = models.data
      .filter(m => m.id.toLowerCase().includes('gpt'))
      .map(m => m.id)
      .sort();
    
    results.availableModels = {
      success: true,
      gptModels,
      totalModels: models.data.length
    };
  } catch (error: any) {
    results.availableModels = {
      success: false,
      error: error.message,
      statusCode: error.status
    };
  }

  // Test 2: Try calling different models
  const modelsToTest = [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-5.2"
  ];

  for (const model of modelsToTest) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: "Say 'test'" }],
        max_tokens: 5
      });
      
      results.tests[model] = {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage
      };
    } catch (error: any) {
      results.tests[model] = {
        success: false,
        error: error.message,
        statusCode: error.status,
        code: error.code,
        type: error.type
      };
    }
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
