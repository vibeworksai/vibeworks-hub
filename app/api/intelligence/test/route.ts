import { NextResponse } from "next/server";
import { isOpenAIConfigured } from "@/lib/openai";
import { isDatabaseConfigured } from "@/lib/db";

/**
 * Test endpoint to check intelligence engine configuration
 */
export async function GET() {
  const openaiConfigured = isOpenAIConfigured();
  const dbConfigured = isDatabaseConfigured();
  
  return NextResponse.json({
    status: "ok",
    checks: {
      openai: {
        configured: openaiConfigured,
        envVarSet: Boolean(process.env.OPENAI_API_KEY),
        message: openaiConfigured 
          ? "OpenAI is configured and ready" 
          : "OpenAI API key not found in environment"
      },
      database: {
        configured: dbConfigured,
        envVarSet: Boolean(process.env.DATABASE_URL),
        message: dbConfigured
          ? "Database is configured and ready"
          : "Database URL not found in environment"
      }
    },
    timestamp: new Date().toISOString()
  });
}
