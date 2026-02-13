-- VibeWorks Hub - Intelligence Layer Schema
-- All Tier 1, 2, 3 Features (minus Market Pulse)
-- Created: 2026-02-12

-- ==========================================
-- TIER 1: GAME CHANGERS
-- ==========================================

-- Revenue Catalyst: Upsell Opportunity Detection
CREATE TABLE IF NOT EXISTS upsell_opportunities (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE CASCADE,
  contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Opportunity Details
  opportunity_type VARCHAR(50), -- upsell, cross-sell, renewal
  recommended_product VARCHAR(255),
  estimated_value NUMERIC(10, 2),
  confidence_score INTEGER, -- 0-100
  
  -- Analysis
  reasoning TEXT, -- Why this is a good opportunity
  similar_customers TEXT[], -- Who else bought this
  optimal_timing VARCHAR(100), -- "within 30 days", "after 3 months", etc.
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, completed
  presented_at TIMESTAMP,
  actioned_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upsell_user_status ON upsell_opportunities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_upsell_confidence ON upsell_opportunities(confidence_score DESC);

-- Financial Foresight: Cash Flow Forecasting
CREATE TABLE IF NOT EXISTS cash_flow_forecasts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Forecast Period
  forecast_date DATE NOT NULL,
  period_type VARCHAR(20), -- daily, weekly, monthly
  
  -- Projections
  projected_revenue NUMERIC(10, 2),
  projected_expenses NUMERIC(10, 2),
  projected_cash_balance NUMERIC(10, 2),
  burn_rate NUMERIC(10, 2),
  runway_days INTEGER,
  
  -- Confidence
  confidence_level INTEGER, -- 0-100
  model_version VARCHAR(50),
  
  -- Alerts
  alert_level VARCHAR(20), -- none, warning, critical
  alert_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_user_date ON cash_flow_forecasts(user_id, forecast_date DESC);
CREATE INDEX IF NOT EXISTS idx_forecast_alerts ON cash_flow_forecasts(alert_level) WHERE alert_level != 'none';

-- Vibe Check: Relationship Health Scoring
CREATE TABLE IF NOT EXISTS relationship_health (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id VARCHAR(255) NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Health Metrics
  health_score INTEGER, -- 0-100
  engagement_trend VARCHAR(20), -- rising, stable, declining
  response_time_avg INTEGER, -- minutes
  sentiment_score INTEGER, -- -100 to 100
  
  -- Communication Patterns
  last_contact_date TIMESTAMP,
  contact_frequency INTEGER, -- contacts per month
  email_count_30d INTEGER,
  meeting_count_30d INTEGER,
  
  -- Risk Assessment
  risk_level VARCHAR(20), -- low, medium, high
  risk_factors TEXT[], -- ["Slow responses", "Negative sentiment"]
  recommendations TEXT[], -- ["Schedule check-in call", "Send value add"]
  
  -- Analysis Period
  analysis_date DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relationship_user ON relationship_health(user_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_relationship_risk ON relationship_health(risk_level) WHERE risk_level = 'high';

-- Burnout Shield: Founder Energy Protection
CREATE TABLE IF NOT EXISTS burnout_metrics (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Energy Metrics
  measurement_date DATE NOT NULL,
  energy_level INTEGER, -- 0-100
  burnout_risk INTEGER, -- 0-100
  
  -- Work Patterns
  hours_worked_today NUMERIC(4, 1),
  hours_worked_week NUMERIC(4, 1),
  consecutive_long_days INTEGER,
  
  -- Task Metrics
  tasks_completed_today INTEGER,
  tasks_completion_rate NUMERIC(3, 2), -- 0.00 to 1.00
  overdue_tasks_count INTEGER,
  
  -- Communication Load
  emails_sent_today INTEGER,
  meetings_today INTEGER,
  
  -- Recovery
  last_break_date DATE,
  days_since_break INTEGER,
  
  -- Recommendations
  recommendation_type VARCHAR(50), -- "take_break", "delegate_tasks", "block_recovery_time"
  recommendation_text TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_burnout_user_date ON burnout_metrics(user_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_burnout_risk ON burnout_metrics(burnout_risk DESC);

-- ==========================================
-- TIER 2: HIGH-VALUE ADD-ONS
-- ==========================================

-- Opportunity Radar: Lead Discovery
CREATE TABLE IF NOT EXISTS discovered_opportunities (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Discovery Details
  source VARCHAR(100), -- "LinkedIn", "Twitter", "RFP Site", "Reddit"
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Qualification
  qualification_score INTEGER, -- 0-100
  match_reasons TEXT[], -- Why this is relevant
  estimated_value NUMERIC(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'new', -- new, reviewed, contacted, qualified, disqualified
  reviewed_at TIMESTAMP,
  contacted_at TIMESTAMP,
  
  -- Metadata
  discovered_at TIMESTAMP DEFAULT NOW(),
  keywords_matched TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_user_status ON discovered_opportunities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON discovered_opportunities(qualification_score DESC);

-- Strategic Oracle: Scenario Modeling
CREATE TABLE IF NOT EXISTS scenarios (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Scenario Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(50), -- "hire", "pricing_change", "marketing_spend", "new_service"
  
  -- Inputs
  assumptions JSONB, -- Flexible storage for scenario inputs
  time_horizon_months INTEGER,
  
  -- Outputs
  projected_revenue NUMERIC(10, 2),
  projected_expenses NUMERIC(10, 2),
  projected_profit NUMERIC(10, 2),
  break_even_months INTEGER,
  roi_percentage NUMERIC(5, 2),
  
  -- Risk Analysis
  best_case JSONB,
  base_case JSONB,
  worst_case JSONB,
  
  -- Decision Support
  recommendation VARCHAR(20), -- "proceed", "caution", "avoid"
  key_risks TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_user ON scenarios(user_id, created_at DESC);

-- Client Zero-D: Ideal Customer Profile
CREATE TABLE IF NOT EXISTS ideal_customer_profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Profile Version
  profile_version INTEGER DEFAULT 1,
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- Customer Attributes
  attributes JSONB, -- Industry, company size, budget range, etc.
  
  -- Performance Metrics
  avg_ltv NUMERIC(10, 2),
  avg_deal_size NUMERIC(10, 2),
  avg_time_to_close INTEGER, -- days
  churn_rate NUMERIC(3, 2),
  referral_rate NUMERIC(3, 2),
  
  -- Behavioral Patterns
  common_pain_points TEXT[],
  common_objections TEXT[],
  decision_factors TEXT[],
  
  -- Sample Customers
  sample_customer_ids TEXT[], -- Reference IDs of best customers
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_icp_user ON ideal_customer_profiles(user_id, profile_version DESC);

-- Lead Scoring (based on ICP)
CREATE TABLE IF NOT EXISTS lead_scores (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE CASCADE,
  
  -- Scoring
  overall_score INTEGER, -- 0-100
  icp_match_score INTEGER, -- 0-100
  engagement_score INTEGER, -- 0-100
  
  -- Breakdown
  score_factors JSONB, -- Detailed scoring breakdown
  
  -- Recommendation
  priority_level VARCHAR(20), -- "high", "medium", "low"
  recommended_actions TEXT[],
  
  scored_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_user ON lead_scores(user_id, overall_score DESC);

-- Risk Cartographer: Risk Identification
CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Risk Details
  risk_category VARCHAR(50), -- "financial", "operational", "strategic", "relationship"
  risk_title VARCHAR(255) NOT NULL,
  risk_description TEXT,
  
  -- Linked Entity
  entity_type VARCHAR(50), -- "deal", "project", "contact", "business"
  entity_id VARCHAR(255),
  
  -- Assessment
  probability INTEGER, -- 0-100
  impact INTEGER, -- 0-100 (financial or operational impact)
  risk_score INTEGER, -- probability * impact / 100
  
  -- Mitigation
  mitigation_strategies TEXT[],
  mitigation_status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  
  -- Timeline
  identified_at TIMESTAMP DEFAULT NOW(),
  mitigation_deadline TIMESTAMP,
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risks_user_score ON risks(user_id, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(mitigation_status);

-- ==========================================
-- TIER 3: PRODUCTIVITY MULTIPLIERS
-- ==========================================

-- Content Compass: Marketing Intelligence
CREATE TABLE IF NOT EXISTS content_ideas (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content Details
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(50), -- "blog", "social", "video", "email"
  platform VARCHAR(50), -- "LinkedIn", "Twitter", "YouTube", etc.
  
  -- Generation
  generated_reason TEXT, -- Why this topic is relevant now
  target_audience VARCHAR(255),
  key_message TEXT,
  
  -- SEO/Keywords
  keywords TEXT[],
  trending_score INTEGER, -- 0-100
  
  -- Competitive Gap
  competitor_gap_analysis TEXT, -- What competitors are missing
  
  -- Status
  status VARCHAR(50) DEFAULT 'suggested', -- suggested, in_progress, published, archived
  published_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_user_status ON content_ideas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_trending ON content_ideas(trending_score DESC);

-- Fero's Autopilot: Workflow Automation
CREATE TABLE IF NOT EXISTS automated_workflows (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Workflow Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_pattern VARCHAR(100), -- "new_lead_followup", "deal_won_onboarding", etc.
  
  -- Detection
  detected_from_history BOOLEAN DEFAULT false,
  occurrence_count INTEGER, -- How many times this pattern was detected
  
  -- Automation
  trigger_conditions JSONB, -- When to run
  actions JSONB, -- What to do
  
  -- Status
  status VARCHAR(50) DEFAULT 'suggested', -- suggested, active, paused, archived
  activated_at TIMESTAMP,
  
  -- Performance
  executions_count INTEGER DEFAULT 0,
  success_rate NUMERIC(3, 2),
  time_saved_minutes INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_user_status ON automated_workflows(user_id, status);

-- Brand Echo: Sentiment Tracking
CREATE TABLE IF NOT EXISTS brand_mentions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Mention Details
  source VARCHAR(100), -- "Twitter", "Reddit", "Review Site", etc.
  source_url TEXT,
  mention_text TEXT,
  author VARCHAR(255),
  
  -- Sentiment
  sentiment_score INTEGER, -- -100 (very negative) to 100 (very positive)
  sentiment_label VARCHAR(20), -- "very_positive", "positive", "neutral", "negative", "very_negative"
  
  -- Impact
  reach INTEGER, -- Follower count, upvotes, etc.
  engagement INTEGER, -- Likes, comments, shares
  
  -- Response
  requires_response BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  response_text TEXT,
  responded_at TIMESTAMP,
  
  mentioned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentions_user_sentiment ON brand_mentions(user_id, sentiment_score DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_requires_response ON brand_mentions(requires_response) WHERE requires_response = true;

-- Founder's Edge: Skill Development
CREATE TABLE IF NOT EXISTS skill_gaps (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Gap Details
  skill_name VARCHAR(255) NOT NULL,
  skill_category VARCHAR(100), -- "sales", "marketing", "technical", "operations", "finance"
  
  -- Evidence
  identified_from VARCHAR(100), -- "lost_deals", "project_delays", "customer_feedback"
  evidence_details TEXT,
  impact_level VARCHAR(20), -- "critical", "high", "medium", "low"
  
  -- Recommendations
  recommended_resources JSONB[], -- {type: "course", title: "...", url: "..."}
  estimated_learning_time VARCHAR(50),
  
  -- Progress
  status VARCHAR(50) DEFAULT 'identified', -- identified, learning, improved
  started_learning_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  identified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_gaps_user ON skill_gaps(user_id, impact_level);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_status ON skill_gaps(status);
