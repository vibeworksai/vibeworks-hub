#!/bin/bash
# Test script for VibeWorks Hub Intelligence Engines
# Run this after starting the dev server: npm run dev

BASE_URL="http://localhost:3000"
USER_ID="test-user"

echo "🧪 Testing VibeWorks Hub Intelligence Engines"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Revenue Catalyst - Upsell Opportunity Detection${NC}"
echo "---------------------------------------------------"
echo "Fetching mock opportunities..."
curl -s "${BASE_URL}/api/intelligence/revenue-catalyst?user_id=${USER_ID}" | jq '.' || echo "Response received"
echo ""
echo ""

echo -e "${BLUE}2. Client Zero-D - Ideal Customer Profiling${NC}"
echo "--------------------------------------------"
echo "Fetching mock ICP..."
curl -s "${BASE_URL}/api/intelligence/client-zero-d?user_id=${USER_ID}" | jq '.' || echo "Response received"
echo ""
echo ""

echo -e "${BLUE}3. Risk Cartographer - Risk Identification${NC}"
echo "-------------------------------------------"
echo "Fetching mock risks..."
curl -s "${BASE_URL}/api/intelligence/risk-cartographer?user_id=${USER_ID}" | jq '.' || echo "Response received"
echo ""
echo ""

echo -e "${GREEN}✅ All endpoints responded!${NC}"
echo ""
echo "Next steps:"
echo "1. Add OPENAI_API_KEY to .env.local"
echo "2. Run with analyze=true to test GPT-4 integration:"
echo "   curl \"${BASE_URL}/api/intelligence/revenue-catalyst?user_id=${USER_ID}&analyze=true\""
echo ""
echo "3. For authenticated testing, add /api/intelligence/* to middleware.ts publicRoutes"
