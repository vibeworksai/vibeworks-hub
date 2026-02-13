const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createTasksSchema() {
  try {
    console.log('🚀 Creating tasks management schema...\n');

    // Create tasks table
    console.log('Creating tasks table...');
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        context VARCHAR(50),
        project_id VARCHAR(255),
        deal_id VARCHAR(255),
        next_action BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'inbox',
        priority VARCHAR(20),
        energy_level VARCHAR(20),
        time_estimate INTEGER,
        due_date TIMESTAMP,
        scheduled_date TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255),
        tags TEXT[]
      )
    `;
    console.log('✅ tasks table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_user_next ON tasks(user_id, next_action) WHERE next_action = TRUE`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_context ON tasks(context) WHERE context IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date) WHERE due_date IS NOT NULL AND status != 'completed'`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id) WHERE project_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id) WHERE deal_id IS NOT NULL`;
    console.log('✅ indexes created');

    // Create subtasks table
    console.log('\nCreating task_subtasks table...');
    await sql`
      CREATE TABLE IF NOT EXISTS task_subtasks (
        id VARCHAR(255) PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        position INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_subtasks_task ON task_subtasks(task_id)`;
    console.log('✅ task_subtasks table created');

    // Create task notes table
    console.log('\nCreating task_notes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS task_notes (
        id VARCHAR(255) PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id),
        note TEXT NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_notes_task ON task_notes(task_id)`;
    console.log('✅ task_notes table created');

    // Insert sample tasks for Ivan
    console.log('\nInserting sample tasks for Ivan...');
    
    const ivanId = '640401e9-106a-488f-8585-86519c60fc99';
    const now = Date.now();
    
    await sql`
      INSERT INTO tasks (id, user_id, title, description, context, deal_id, status, priority, energy_level, time_estimate, due_date, created_by)
      VALUES 
        (${`task-${now}`}, ${ivanId}, 
         'Follow up with Supreme Financial on proposal',
         'Check if they received the $36K copy trading platform proposal. Be friendly, not pushy.',
         '@calls', 'deal-1770931453990', 'next_actions', 'high', 'low', 10, 
         NOW() + INTERVAL '1 day', 'farrah'),
        
        (${`task-${now + 1}`}, ${ivanId}, 
         'Review and enhance VibeWorks Hub mystical recommendations',
         'Make the daily advice more actionable and less generic. Integrate with tasks.',
         '@office', NULL, 'next_actions', 'medium', 'high', 60,
         NOW() + INTERVAL '2 days', 'ivan'),
        
        (${`task-${now + 2}`}, ${ivanId}, 
         'Send ALife Hospitality proposal details',
         'They asked for more information on AI solutions',
         '@computer', 'deal-1770931837899', 'inbox', 'medium', 'medium', 30,
         NULL, 'farrah')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Sample tasks inserted');

    // Verify
    const tasks = await sql`
      SELECT id, title, context, status, priority, created_by
      FROM tasks 
      WHERE user_id = ${ivanId}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log('\n📋 Tasks created:');
    tasks.forEach((t, i) => {
      console.log(`  ${i + 1}. [${t.status}] ${t.title}`);
      console.log(`     Context: ${t.context || 'none'} | Priority: ${t.priority} | By: ${t.created_by}`);
    });

    console.log('\n🎉 Task management schema created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

createTasksSchema().catch(console.error);
