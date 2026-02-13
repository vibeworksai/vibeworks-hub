# VibeWorks Hub - AI Intelligence Engines

Three GPT-4 powered intelligence APIs that analyze your CRM data to provide actionable business insights.

## 🚀 Quick Start

All endpoints require a `user_id` parameter and support both mock data (when OpenAI isn't configured) and real AI analysis.

### Setup

1. Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

2. Ensure the intelligence schema is deployed to your database:
```bash
# Run schema-intelligence.sql in Neon SQL Editor
```

3. Start the dev server:
```bash
npm run dev
```

## 📊 1. Revenue Catalyst - Upsell Opportunity Detection

**Endpoint:** `GET /api/intelligence/revenue-catalyst`

Analyzes deals and contacts to identify upsell, cross-sell, and renewal opportunities using GPT-4 pattern recognition.

### Request
```bash
# Get existing opportunities
GET /api/intelligence/revenue-catalyst?user_id=USER_ID

# Run fresh AI analysis
GET /api/intelligence/revenue-catalyst?user_id=USER_ID&analyze=true
```

### Response
```json
{
  "opportunities": [
    {
      "id": "upsell-123",
      "deal_id": "deal-1",
      "contact_id": "contact-1",
      "opportunity_type": "upsell",
      "recommended_product": "Premium Copy Trading Platform + White Label",
      "estimated_value": 72000,
      "confidence_score": 85,
      "reasoning": "Supreme Financial has shown strong interest...",
      "similar_customers": ["FinTech Pro Inc", "Wealth Solutions Ltd"],
      "optimal_timing": "within 30 days of initial deal close",
      "status": "pending",
      "created_at": "2026-02-12T..."
    }
  ],
  "analyzed": true,
  "count": 3
}
```

### Accept/Reject Opportunity
```bash
POST /api/intelligence/revenue-catalyst
{
  "user_id": "USER_ID",
  "opportunity_id": "upsell-123",
  "action": "accept" // or "reject"
}
```

### Features
- ✅ Identifies upsell, cross-sell, and renewal opportunities
- ✅ Confidence scoring (0-100)
- ✅ Similar customer comparisons
- ✅ Optimal timing recommendations
- ✅ Estimated revenue impact

---

## 👥 2. Client Zero-D - Ideal Customer Profiling

**Endpoint:** `GET /api/intelligence/client-zero-d`

Analyzes your best customers to build a data-driven Ideal Customer Profile (ICP) and score new leads against it.

### Request
```bash
# Get existing ICP
GET /api/intelligence/client-zero-d?user_id=USER_ID

# Generate new ICP with AI
GET /api/intelligence/client-zero-d?user_id=USER_ID&analyze=true
```

### Response
```json
{
  "profile": {
    "id": "icp-1",
    "user_id": "user-1",
    "profile_version": 2,
    "attributes": {
      "industry": ["Financial Services", "FinTech"],
      "company_size": "50-500 employees",
      "budget_range": "$25K-$100K",
      "decision_maker_role": ["CFO", "CTO", "Head of Operations"],
      "geographic_region": ["North America"]
    },
    "avg_ltv": 85000,
    "avg_deal_size": 42000,
    "avg_time_to_close": 45,
    "churn_rate": 0.15,
    "referral_rate": 0.35,
    "common_pain_points": [
      "Legacy systems holding them back",
      "Need better data visibility"
    ],
    "common_objections": [
      "Price concerns",
      "Implementation timeline"
    ],
    "decision_factors": [
      "ROI demonstration",
      "Case studies from similar companies"
    ],
    "sample_customer_ids": ["contact-1", "contact-5"],
    "created_at": "2026-02-12T..."
  },
  "analyzed": true,
  "version": 2
}
```

### Score a Lead Against ICP
```bash
POST /api/intelligence/client-zero-d
{
  "user_id": "USER_ID",
  "contact_id": "contact-123" // or "deal_id": "deal-456"
}
```

**Response:**
```json
{
  "success": true,
  "score": 85,
  "priority": "high",
  "details": {
    "overall_score": 85,
    "icp_match_score": 85,
    "engagement_score": 70,
    "factors": {
      "industry_match": true,
      "role_match": true,
      "budget_match": true
    },
    "priority_level": "high",
    "recommended_actions": [
      "Schedule demo ASAP",
      "Share relevant case studies",
      "Fast-track proposal"
    ]
  }
}
```

### Features
- ✅ Data-driven ICP generation from your best customers
- ✅ Versioned profiles (track evolution over time)
- ✅ Lead scoring against ICP
- ✅ Actionable recommendations per lead
- ✅ Common pain points & objections analysis

---

## 🚨 3. Risk Cartographer - Business Risk Identification

**Endpoint:** `GET /api/intelligence/risk-cartographer`

Identifies risks across financial, operational, strategic, and relationship dimensions using GPT-4 pattern analysis.

### Request
```bash
# Get existing risks
GET /api/intelligence/risk-cartographer?user_id=USER_ID

# Filter by category
GET /api/intelligence/risk-cartographer?user_id=USER_ID&category=financial

# Run fresh AI analysis
GET /api/intelligence/risk-cartographer?user_id=USER_ID&analyze=true
```

### Response
```json
{
  "risks": [
    {
      "id": "risk-1",
      "user_id": "user-1",
      "risk_category": "financial",
      "risk_title": "Revenue Concentration Risk",
      "risk_description": "Over 60% of pipeline value is from a single client...",
      "entity_type": "deal",
      "entity_id": "deal-1",
      "probability": 30,
      "impact": 90,
      "risk_score": 27,
      "mitigation_strategies": [
        "Diversify client base with 3-5 new mid-size clients",
        "Build long-term relationship with Supreme Financial",
        "Create contingency revenue plan"
      ],
      "mitigation_status": "pending",
      "created_at": "2026-02-12T..."
    }
  ],
  "summary": {
    "total": 8,
    "high_risk": 2,
    "medium_risk": 4,
    "low_risk": 2,
    "by_category": {
      "financial": 2,
      "operational": 1,
      "strategic": 3,
      "relationship": 2
    }
  },
  "overall_risk_level": "medium",
  "immediate_actions": [
    "Address revenue concentration",
    "Re-engage cold leads",
    "Build operational buffer"
  ]
}
```

### Update Risk Mitigation Status
```bash
POST /api/intelligence/risk-cartographer
{
  "user_id": "USER_ID",
  "risk_id": "risk-123",
  "action": "start" // or "complete"
}
```

### Dismiss a Risk
```bash
DELETE /api/intelligence/risk-cartographer?user_id=USER_ID&risk_id=risk-123
```

### Features
- ✅ Multi-dimensional risk analysis (financial, operational, strategic, relationship)
- ✅ Probability × Impact scoring
- ✅ Entity-linked risks (tracks which deals/contacts are at risk)
- ✅ Specific mitigation strategies
- ✅ Risk tracking & status management

---

## 🎯 Risk Categories

**Financial Risks:**
- Revenue concentration
- Cash flow issues
- Pricing problems
- Payment delays

**Operational Risks:**
- Capacity constraints
- Delivery bottlenecks
- Process inefficiencies
- Resource shortages

**Strategic Risks:**
- Market positioning gaps
- Competitive threats
- Service portfolio weaknesses
- Market shifts

**Relationship Risks:**
- Declining client engagement
- Churn indicators
- Communication breakdowns
- Low response rates

---

## 🧠 How It Works

### Architecture
```
Frontend → API Endpoint → Database Query → GPT-4 Analysis → Store Results → Return to Frontend
```

### GPT-4 Integration
Each engine uses specialized prompts:
- **Revenue Catalyst**: Pattern recognition in deal history
- **Client Zero-D**: Statistical analysis of best customers
- **Risk Cartographer**: Multi-factor risk assessment

### Caching & Performance
- Analysis results are stored in the database
- Fresh analysis only runs when `analyze=true`
- Mock data fallback if OpenAI/DB not configured

---

## 🔧 Testing

### Test with Mock Data (no API key needed)
```bash
# Mock opportunities
curl http://localhost:3000/api/intelligence/revenue-catalyst?user_id=test-user

# Mock ICP
curl http://localhost:3000/api/intelligence/client-zero-d?user_id=test-user

# Mock risks
curl http://localhost:3000/api/intelligence/risk-cartographer?user_id=test-user
```

### Test with Real AI Analysis
```bash
# Set OPENAI_API_KEY in .env.local first
curl "http://localhost:3000/api/intelligence/revenue-catalyst?user_id=test-user&analyze=true"
```

---

## 📈 Next Steps

1. **Frontend Integration**: Build UI components to display insights
2. **Webhooks**: Trigger analysis on new deal/contact creation
3. **Scheduled Analysis**: Cron job to run weekly risk/opportunity scans
4. **Email Digests**: Send weekly intelligence reports
5. **Advanced Scoring**: Enhance ICP matching with more data points

---

## 🛠️ Development

### File Structure
```
app/api/intelligence/
├── README.md (this file)
├── revenue-catalyst/
│   └── route.ts
├── client-zero-d/
│   └── route.ts
└── risk-cartographer/
    └── route.ts

lib/
└── openai.ts (shared GPT-4 utilities)
```

### Adding New Intelligence Features

1. Define the schema in `schema-intelligence.sql`
2. Create API route in `app/api/intelligence/[feature]/route.ts`
3. Use `callGPT4JSON()` helper from `@/lib/openai`
4. Follow the pattern: GET (fetch/analyze), POST (update), DELETE (remove)

---

## 📝 API Response Patterns

All endpoints follow this pattern:
```typescript
// Success with data
{ data: {...}, success: true }

// Success with mock data
{ data: {...}, mock: true }

// Error
{ error: "message", status: 400/500 }

// Analysis complete
{ data: {...}, analyzed: true, count: 5 }
```

---

**Built with ❤️ for VibeWorks Hub**
*Turning CRM data into strategic intelligence.*
