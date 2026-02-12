# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in (use farahaiemail@gmail.com)
3. Click "New Project"
4. Fill in:
   - **Name:** vibeworks-hub
   - **Database Password:** (generate strong password, save it)
   - **Region:** East US (iad) - closest to you
5. Click "Create Project" (takes ~2 minutes)

## Step 2: Run Database Schema

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy **all contents** from `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. You should see: "Success. No rows returned"

## Step 3: Get API Credentials

1. In Supabase dashboard, click "Settings" (left sidebar)
2. Click "API" under Project Settings
3. Copy these two values:
   - **Project URL** (starts with https://...)
   - **anon/public key** (long string starting with eyJ...)

## Step 4: Add Credentials to Vercel

1. Go to https://vercel.com/ivan-jacksons-projects/app-dir
2. Click "Settings" → "Environment Variables"
3. Add these **TWO** variables:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     **Value:** (paste Project URL from step 3)
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     **Value:** (paste anon key from step 3)
4. Click "Save"
5. Go to "Deployments" → click "..." on latest deployment → "Redeploy"

## Step 5: Verify It Works

1. Wait for deployment to complete (~30 seconds)
2. Go to https://app-dir-mu.vercel.app
3. Open browser console (F12)
4. You should see NO "Supabase credentials not configured" warning
5. Test: Create a new contact or deal
6. Refresh the page — data should persist!

## Step 6: Tell Farrah

Once verified, ping Farrah:
> "Supabase is live! You can now push real updates via the APIs. Everything will persist."

---

## Troubleshooting

**"Supabase credentials not configured" warning:**
- Check that environment variables are set in Vercel
- Make sure you redeployed after adding them

**Data not persisting:**
- Check Supabase SQL Editor → "Table Editor" to see if data is being written
- Check browser console for any errors

**Need to update the database?**
- Add new SQL queries in Supabase SQL Editor
- Or ask Fero to generate migration scripts
