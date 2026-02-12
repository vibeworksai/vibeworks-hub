import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  console.warn("DATABASE_URL not configured. Using mock data.");
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

export const isDatabaseConfigured = () => {
  return Boolean(databaseUrl);
};
