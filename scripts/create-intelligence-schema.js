const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createIntelligenceSchema() {
  try {
    console.log('🧠 Creating Intelligence Layer Schema...\n');

    // Tier 1: Game Changers
    console.log('📊 TIER 1: Game Changers');
    
    console.log('  Creating upsell_opportunities table...');
    await sql`
      CREATE TABLE IF NOT EXISTS upsell_opportunities (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE CASCADE,
        contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
        opportunity_type VARCHAR(50),
        recommended_product VARCHAR(255),
        estimated_value NUMERIC(10, 2),
        confidence_score INTEGER,
        reasoning TEXT,
        similar_customers TEXT[],
        optimal_timing VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        presented_at TIMESTAMP,
        actioned_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_upsell_user_status ON upsell_opportunities(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_upsell_confidence ON upsell_opportunities(confidence_score DESC)`;
    console.log('  ✅ Revenue Catalyst ready');

    console.log('  Creating cash_flow_forecasts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS cash_flow_forecasts (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        forecast_date DATE NOT NULL,
        period_type VARCHAR(20),
        projected_revenue NUMERIC(10, 2),
        projected_expenses NUMERIC(10, 2),
        projected_cash_balance NUMERIC(10, 2),
        burn_rate NUMERIC(10, 2),
        runway_days INTEGER,
        confidence_level INTEGER,
        model_version VARCHAR(50),
        alert_level VARCHAR(20),
        alert_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_forecast_user_date ON cash_flow_forecasts(user_id, forecast_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_forecast_alerts ON cash_flow_forecasts(alert_level) WHERE alert_level != 'none'`;
    console.log('  ✅ Financial Foresight ready');

    console.log('  Creating relationship_health table...');
    await sql`
      CREATE TABLE IF NOT EXISTS relationship_health (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contact_id VARCHAR(255) NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        health_score INTEGER,
        engagement_trend VARCHAR(20),
        response_time_avg INTEGER,
        sentiment_score INTEGER,
        last_contact_date TIMESTAMP,
        contact_frequency INTEGER,
        email_count_30d INTEGER,
        meeting_count_30d INTEGER,
        risk_level VARCHAR(20),
        risk_factors TEXT[],
        recommendations TEXT[],
        analysis_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_user ON relationship_health(user_id, analysis_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_risk ON relationship_health(risk_level) WHERE risk_level = 'high'`;
    console.log('  ✅ Vibe Check ready');

    console.log('  Creating burnout_metrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS burnout_metrics (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        measurement_date DATE NOT NULL,
        energy_level INTEGER,
        burnout_risk INTEGER,
        hours_worked_today NUMERIC(4, 1),
        hours_worked_week NUMERIC(4, 1),
        consecutive_long_days INTEGER,
        tasks_completed_today INTEGER,
        tasks_completion_rate NUMERIC(3, 2),
        overdue_tasks_count INTEGER,
        emails_sent_today INTEGER,
        meetings_today INTEGER,
        last_break_date DATE,
        days_since_break INTEGER,
        recommendation_type VARCHAR(50),
        recommendation_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_burnout_user_date ON burnout_metrics(user_id, measurement_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_burnout_risk ON burnout_metrics(burnout_risk DESC)`;
    console.log('  ✅ Burnout Shield ready');

    // Tier 2: High-Value Add-Ons
    console.log('\n💎 TIER 2: High-Value Add-Ons');
    
    console.log('  Creating discovered_opportunities table...');
    await sql`
      CREATE TABLE IF NOT EXISTS discovered_opportunities (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source VARCHAR(100),
        source_url TEXT,
        title TEXT NOT NULL,
        description TEXT,
        qualification_score INTEGER,
        match_reasons TEXT[],
        estimated_value NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'new',
        reviewed_at TIMESTAMP,
        contacted_at TIMESTAMP,
        discovered_at TIMESTAMP DEFAULT NOW(),
        keywords_matched TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_opportunities_user_status ON discovered_opportunities(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_opportunities_score ON discovered_opportunities(qualification_score DESC)`;
    console.log('  ✅ Opportunity Radar ready');

    console.log('  Creating scenarios table...');
    await sql`
      CREATE TABLE IF NOT EXISTS scenarios (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        scenario_type VARCHAR(50),
        assumptions JSONB,
        time_horizon_months INTEGER,
        projected_revenue NUMERIC(10, 2),
        projected_expenses NUMERIC(10, 2),
        projected_profit NUMERIC(10, 2),
        break_even_months INTEGER,
        roi_percentage NUMERIC(5, 2),
        best_case JSONB,
        base_case JSONB,
        worst_case JSONB,
        recommendation VARCHAR(20),
        key_risks TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_scenarios_user ON scenarios(user_id, created_at DESC)`;
    console.log('  ✅ Strategic Oracle ready');

    console.log('  Creating ideal_customer_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ideal_customer_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        profile_version INTEGER DEFAULT 1,
        generated_at TIMESTAMP DEFAULT NOW(),
        attributes JSONB,
        avg_ltv NUMERIC(10, 2),
        avg_deal_size NUMERIC(10, 2),
        avg_time_to_close INTEGER,
        churn_rate NUMERIC(3, 2),
        referral_rate NUMERIC(3, 2),
        common_pain_points TEXT[],
        common_objections TEXT[],
        decision_factors TEXT[],
        sample_customer_ids TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_icp_user ON ideal_customer_profiles(user_id, profile_version DESC)`;
    console.log('  ✅ Client Zero-D ready');

    console.log('  Creating lead_scores table...');
    await sql`
      CREATE TABLE IF NOT EXISTS lead_scores (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE CASCADE,
        deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE CASCADE,
        overall_score INTEGER,
        icp_match_score INTEGER,
        engagement_score INTEGER,
        score_factors JSONB,
        priority_level VARCHAR(20),
        recommended_actions TEXT[],
        scored_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_scores_user ON lead_scores(user_id, overall_score DESC)`;
    console.log('  ✅ Lead Scoring ready');

    console.log('  Creating risks table...');
    await sql`
      CREATE TABLE IF NOT EXISTS risks (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        risk_category VARCHAR(50),
        risk_title VARCHAR(255) NOT NULL,
        risk_description TEXT,
        entity_type VARCHAR(50),
        entity_id VARCHAR(255),
        probability INTEGER,
        impact INTEGER,
        risk_score INTEGER,
        mitigation_strategies TEXT[],
        mitigation_status VARCHAR(50) DEFAULT 'pending',
        identified_at TIMESTAMP DEFAULT NOW(),
        mitigation_deadline TIMESTAMP,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_risks_user_score ON risks(user_id, risk_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(mitigation_status)`;
    console.log('  ✅ Risk Cartographer ready');

    // Tier 3: Productivity Multipliers
    console.log('\n📈 TIER 3: Productivity Multipliers');
    
    console.log('  Creating content_ideas table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_ideas (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content_type VARCHAR(50),
        platform VARCHAR(50),
        generated_reason TEXT,
        target_audience VARCHAR(255),
        key_message TEXT,
        keywords TEXT[],
        trending_score INTEGER,
        competitor_gap_analysis TEXT,
        status VARCHAR(50) DEFAULT 'suggested',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_user_status ON content_ideas(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_trending ON content_ideas(trending_score DESC)`;
    console.log('  ✅ Content Compass ready');

    console.log('  Creating automated_workflows table...');
    await sql`
      CREATE TABLE IF NOT EXISTS automated_workflows (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        workflow_pattern VARCHAR(100),
        detected_from_history BOOLEAN DEFAULT false,
        occurrence_count INTEGER,
        trigger_conditions JSONB,
        actions JSONB,
        status VARCHAR(50) DEFAULT 'suggested',
        activated_at TIMESTAMP,
        executions_count INTEGER DEFAULT 0,
        success_rate NUMERIC(3, 2),
        time_saved_minutes INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_workflows_user_status ON automated_workflows(user_id, status)`;
    console.log('  ✅ Fero\'s Autopilot ready');

    console.log('  Creating brand_mentions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS brand_mentions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source VARCHAR(100),
        source_url TEXT,
        mention_text TEXT,
        author VARCHAR(255),
        sentiment_score INTEGER,
        sentiment_label VARCHAR(20),
        reach INTEGER,
        engagement INTEGER,
        requires_response BOOLEAN DEFAULT false,
        responded BOOLEAN DEFAULT false,
        response_text TEXT,
        responded_at TIMESTAMP,
        mentioned_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_mentions_user_sentiment ON brand_mentions(user_id, sentiment_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mentions_requires_response ON brand_mentions(requires_response) WHERE requires_response = true`;
    console.log('  ✅ Brand Echo ready');

    console.log('  Creating skill_gaps table...');
    await sql`
      CREATE TABLE IF NOT EXISTS skill_gaps (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_name VARCHAR(255) NOT NULL,
        skill_category VARCHAR(100),
        identified_from VARCHAR(100),
        evidence_details TEXT,
        impact_level VARCHAR(20),
        recommended_resources JSONB[],
        estimated_learning_time VARCHAR(50),
        status VARCHAR(50) DEFAULT 'identified',
        started_learning_at TIMESTAMP,
        completed_at TIMESTAMP,
        identified_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_skill_gaps_user ON skill_gaps(user_id, impact_level)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_skill_gaps_status ON skill_gaps(status)`;
    console.log('  ✅ Founder\'s Edge ready');

    console.log('\n🎉 Intelligence Layer Schema Created Successfully!\n');
    console.log('Tables Created: 12');
    console.log('Indexes Created: 18');
    console.log('\nReady for AI intelligence engines ✅');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

createIntelligenceSchema().catch(console.error);
