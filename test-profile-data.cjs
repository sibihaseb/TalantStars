// Simple direct database update using existing connection
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require("ws");

// Configure for serverless
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function updateTGlassmanProfile() {
  const client = await pool.connect();
  
  try {
    console.log('Updating tglassman profile...');
    
    // Update user_profiles table with comprehensive data
    const result = await client.query(`
      UPDATE user_profiles SET 
        display_name = $1,
        first_name = $2,
        last_name = $3,
        bio = $4,
        location = $5,
        phone_number = $6,
        email = $7,
        website = $8,
        instagram_url = $9,
        twitter_url = $10,
        linkedin_url = $11,
        hourly_rate = $12,
        daily_rate = $13,
        weekly_rate = $14,
        availability = $15,
        skills = $16,
        specialties = $17,
        years_experience = $18,
        education = $19,
        awards = $20,
        languages = $21,
        updated_at = NOW()
      WHERE user_id = (
        SELECT id FROM users WHERE username = $22
      )
      RETURNING user_id, display_name;
    `, [
      'Tom Glassman',
      'Tom',
      'Glassman',
      'Emmy-nominated actor with over 15 years of experience in film, television, and theater. Known for powerful dramatic performances and versatile character work. Recent Emmy nomination for Best Supporting Actor in "City of Dreams" (2024). Classically trained at Juilliard with extensive stage experience including Broadway productions.',
      'Los Angeles, CA',
      '+1 (555) 234-5678',
      'tom.glassman@email.com',
      'www.tomglassmanactor.com',
      'https://instagram.com/tomglassmanactor',
      'https://twitter.com/tomglassman',
      'https://linkedin.com/in/tomglassman',
      500,
      4000,
      20000,
      'Available',
      ['Method Acting', 'Stage Combat', 'Voice Acting', 'Improv', 'Character Development', 'Accent Work', 'Musical Theater', 'Shakespearean Theater'],
      ['Drama', 'Thriller', 'Independent Films', 'Character Acting', 'Stage Performance'],
      15,
      'MFA Acting - The Juilliard School, BA Theater Arts - UCLA',
      'Emmy Nomination - Best Supporting Actor (2024), Critics Choice Award - Best Ensemble Cast (2023), Tony Award Nomination - Best Actor in a Play (2019)',
      ['English (Native)', 'Spanish (Conversational)', 'French (Basic)'],
      'tglassman'
    ]);
    
    if (result.rows.length > 0) {
      console.log('✅ Updated profile for user:', result.rows[0].display_name);
      console.log('🎯 Profile URL: /profile/tglassman');
    } else {
      console.log('❌ No profile found for tglassman user');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
  }
}

updateTGlassmanProfile().then(() => {
  pool.end();
  process.exit(0);
}).catch(console.error);