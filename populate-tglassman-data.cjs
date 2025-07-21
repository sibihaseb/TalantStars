const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq } = require('drizzle-orm');
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// Define schemas inline
const users = {
  id: 'id',
  username: 'username',
  firstName: 'firstName',  
  lastName: 'lastName',
  email: 'email',
  tierId: 'tierId',
  isVerified: 'isVerified',
  profileImageUrl: 'profileImageUrl'
};

async function populateTglassmanData() {
  try {
    console.log('🎬 Populating Tom Glassman with comprehensive data...');

    // Update tglassman user
    await db.execute(`
      UPDATE users SET 
        first_name = 'Tom',
        last_name = 'Glassman', 
        email = 'tom@tglassman.com',
        pricing_tier_id = 10,
        profile_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
      WHERE username = 'tglassman'
    `);

    // Update profile
    await db.execute(`
      UPDATE user_profiles SET
        display_name = 'Tom Glassman',
        bio = 'Emmy-nominated actor with over 15 years of experience in film, television, and theater. Known for powerful dramatic performances and versatile character work. Recent Emmy nomination for Best Supporting Actor in "City of Dreams" (2024). Classically trained at Juilliard with extensive stage experience including Broadway productions.',
        location = 'Los Angeles, CA',
        website = 'https://tomglassman.com',
        phone_number = '+1 (555) 123-4567',
        profile_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        hero_image_url = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=400&fit=crop',
        is_verified = true,
        is_available = true,
        completion_percentage = 100,
        rates = '{"hourly": 500, "daily": 3500, "project": 15000}',
        skills = '["Method Acting", "Stage Combat", "Improvisation", "Voice Acting", "Dialects & Accents", "Musical Theater", "Classical Theater", "Film Acting", "Television", "Character Development"]',
        social_links = '{"instagram": "https://instagram.com/tomglassman", "twitter": "https://twitter.com/tomglassman", "linkedin": "https://linkedin.com/in/tomglassman", "website": "https://tomglassman.com"}'
      WHERE user_id = (SELECT id FROM users WHERE username = 'tglassman')
    `);

    // Clear and add job history
    await db.execute(`DELETE FROM job_history WHERE user_id = (SELECT id FROM users WHERE username = 'tglassman')`);
    
    const userId = await db.execute(`SELECT id FROM users WHERE username = 'tglassman'`);
    const userIdValue = userId.rows[0]?.id;

    if (userIdValue) {
      // Add comprehensive job history
      await db.execute(`
        INSERT INTO job_history (user_id, title, company, project, role, start_date, end_date, description, skills, is_ongoing)
        VALUES 
        (${userIdValue}, 'Lead Actor - Marcus Stone', 'HBO Productions', 'City of Dreams', 'Lead Actor', '2023-03-01', '2024-01-15', 'Emmy-nominated performance as Marcus Stone, a complex detective struggling with moral ambiguity in this critically acclaimed crime drama series.', '["Drama", "Character Development", "Method Acting", "Television"]', false),
        (${userIdValue}, 'Supporting Actor - James Morrison', 'Universal Pictures', 'The Last Stand', 'Supporting Actor', '2022-06-01', '2022-11-30', 'Supporting role in major motion picture, playing a war veteran with PTSD. Film grossed $85M worldwide.', '["Film Acting", "Drama", "Stunts", "Character Work"]', false),
        (${userIdValue}, 'Hamlet', 'Broadway Theater District', 'Hamlet Revival', 'Lead Actor', '2021-09-01', '2022-02-28', 'Critically acclaimed Broadway revival of Hamlet. Received Tony nomination for Best Actor in a Play.', '["Classical Theater", "Shakespeare", "Stage Acting", "Live Performance"]', false),
        (${userIdValue}, 'Recurring Role - Dr. Mitchell', 'Netflix', 'Medical Center', 'Recurring Actor', '2020-01-01', '2021-06-30', 'Recurring role across 18 episodes as head of cardiology. Character became fan favorite and was promoted to series regular.', '["Television", "Medical Drama", "Character Development", "Long-form Storytelling"]', false),
        (${userIdValue}, 'Voice Actor - Captain Steel', 'Disney Animation', 'Galaxy Heroes', 'Voice Actor', '2019-03-01', '2019-09-30', 'Lead voice role in animated feature film. Character required range from heroic to vulnerable moments.', '["Voice Acting", "Animation", "Character Voice", "Recording Studio Work"]', false)
      `);

      // Clear and add media
      await db.execute(`DELETE FROM media WHERE user_id = ${userIdValue}`);
      
      await db.execute(`
        INSERT INTO media (user_id, title, description, url, category, type, is_public)
        VALUES 
        (${userIdValue}, 'Professional Headshot', 'Primary professional headshot for casting submissions', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face', 'headshot', 'image', true),
        (${userIdValue}, 'Character Headshot - Dramatic', 'Dramatic character headshot for intense roles', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face', 'headshot', 'image', true),
        (${userIdValue}, 'City of Dreams - Behind the Scenes', 'Behind the scenes footage from Emmy-nominated performance', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=800&fit=crop', 'portfolio', 'image', true),
        (${userIdValue}, 'Broadway Hamlet Performance', 'Live performance capture from Tony-nominated Hamlet production', 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=1200&h=800&fit=crop', 'portfolio', 'image', true),
        (${userIdValue}, 'Film Set - The Last Stand', 'On-set photo from Universal Pictures production', 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&h=800&fit=crop', 'portfolio', 'image', true),
        (${userIdValue}, 'Demo Reel 2024', 'Professional acting demo reel showcasing range and recent work', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', 'video', true)
      `);
    }

    console.log('✅ Tom Glassman account fully populated!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

populateTglassmanData();