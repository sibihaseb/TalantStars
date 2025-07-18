const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedTalentTypes() {
  try {
    // Create talent types table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS talent_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        display_name VARCHAR NOT NULL,
        description TEXT,
        category VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        question_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default talent types
    const talentTypes = [
      {
        name: 'writer',
        displayName: 'Writer',
        description: 'Creative professionals who write scripts, stories, and content',
        category: 'creative',
        questionCount: 20
      },
      {
        name: 'director',
        displayName: 'Director',
        description: 'Creative professionals who direct films, shows, and productions',
        category: 'creative',
        questionCount: 20
      },
      {
        name: 'cinematographer',
        displayName: 'Cinematographer',
        description: 'Technical professionals who handle camera work and visual storytelling',
        category: 'technical',
        questionCount: 20
      },
      {
        name: 'actor',
        displayName: 'Actor',
        description: 'Performance artists who act in films, shows, and theater',
        category: 'performer',
        questionCount: 21
      },
      {
        name: 'musician',
        displayName: 'Musician',
        description: 'Musical artists who create and perform music',
        category: 'performer',
        questionCount: 20
      },
      {
        name: 'voice_artist',
        displayName: 'Voice Artist',
        description: 'Voice performers for dubbing, commercials, and narration',
        category: 'performer',
        questionCount: 20
      },
      {
        name: 'model',
        displayName: 'Model',
        description: 'Fashion and commercial models',
        category: 'performer',
        questionCount: 20
      }
    ];

    // Check if data already exists
    const existingCount = await pool.query('SELECT COUNT(*) FROM talent_types');
    if (existingCount.rows[0].count > 0) {
      console.log('Talent types already exist, skipping seed');
      return;
    }

    // Insert talent types
    for (const talentType of talentTypes) {
      await pool.query(
        'INSERT INTO talent_types (name, display_name, description, category, question_count) VALUES ($1, $2, $3, $4, $5)',
        [talentType.name, talentType.displayName, talentType.description, talentType.category, talentType.questionCount]
      );
    }

    console.log('Talent types seeded successfully');
  } catch (error) {
    console.error('Error seeding talent types:', error);
  } finally {
    await pool.end();
  }
}

seedTalentTypes();