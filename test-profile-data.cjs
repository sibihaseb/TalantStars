const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function testAndPopulateData() {
  try {
    console.log('🔍 Testing data population for tglassman...');

    // Just check if user exists and add basic info
    const userCheck = await db.execute(`SELECT id, username FROM users WHERE username = 'tglassman'`);
    console.log('User check result:', userCheck.rows);

    if (userCheck.rows.length > 0) {
      const userId = userCheck.rows[0].id;
      console.log(`✅ Found tglassman with ID: ${userId}`);

      // Update basic user info
      await db.execute(`
        UPDATE users SET 
          first_name = 'Tom',
          last_name = 'Glassman',
          email = 'tom@tglassman.com',
          pricing_tier_id = 3
        WHERE id = ${userId}
      `);

      console.log('✅ Updated user basic info');

      // Check for existing profile
      const profileCheck = await db.execute(`SELECT id FROM user_profiles WHERE user_id = ${userId}`);
      
      if (profileCheck.rows.length > 0) {
        // Update existing profile
        await db.execute(`
          UPDATE user_profiles SET
            display_name = 'Tom Glassman',
            bio = 'Emmy-nominated actor with 15+ years experience in film, TV and theater. Known for powerful dramatic performances.',
            location = 'Los Angeles, CA',
            website = 'https://tomglassman.com'
          WHERE user_id = ${userId}
        `);
        console.log('✅ Updated existing profile');
      } else {
        // Create new profile
        await db.execute(`
          INSERT INTO user_profiles (user_id, role, talent_type, display_name, bio, location, website)
          VALUES (${userId}, 'talent', 'actor', 'Tom Glassman', 'Emmy-nominated actor with 15+ years experience in film, TV and theater.', 'Los Angeles, CA', 'https://tomglassman.com')
        `);
        console.log('✅ Created new profile');
      }

      console.log('🎉 Basic data population completed for tglassman!');
    } else {
      console.log('❌ User tglassman not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAndPopulateData();