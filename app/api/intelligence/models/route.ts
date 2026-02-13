import { NextResponse } from "next/server";
import { openai, isOpenAIConfigured } from "@/lib/openai";

/**
 * List available OpenAI models for debugging
 */
export async function GET() {
  if (!isOpenAIConfigured() || !openai) {
    return NextResponse.json({
      error: "OpenAI not configured",
      configured: false
    });
  }

  try {
    const models = await openai.models.list();
    
    // Extract just the model IDs that include "gpt"
    const gptModels = models.data
      .filter(m => m.id.includes('gpt'))
      .map(m => m.id)
      .sort();
    
    return NextResponse.json({
      success: true,
      availableGPTModels: gptModels,
      totalModels: models.data.length,
      allModels: models.data.map(m => ({
        id: m.id,
        created: m.created,
        ownedBy: m.owned_by
      }))
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      details: error.response?.data || error
    }, { status: 500 });
  }
}
