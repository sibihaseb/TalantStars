import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedTalentCategories() {
  try {
    console.log('Seeding talent categories...');
    
    // Insert talent categories
    const categories = [
      {
        name: 'Featured Performer',
        description: 'Top-tier talent with exceptional performance history',
        icon: 'crown',
        color: 'gold',
        isActive: true
      },
      {
        name: 'Rising Star',
        description: 'Emerging talent with promising potential',
        icon: 'sparkles',
        color: 'purple',
        isActive: true
      },
      {
        name: 'Industry Expert',
        description: 'Seasoned professional with extensive experience',
        icon: 'shield',
        color: 'blue',
        isActive: true
      },
      {
        name: 'Breakthrough Artist',
        description: 'Innovative talent breaking new ground',
        icon: 'zap',
        color: 'orange',
        isActive: true
      },
      {
        name: 'Award Winner',
        description: 'Recognized talent with notable achievements',
        icon: 'trophy',
        color: 'green',
        isActive: true
      }
    ];

    // Insert categories
    for (const category of categories) {
      await db.execute(sql`
        INSERT INTO talent_categories (name, description, icon, color, is_active)
        VALUES (${category.name}, ${category.description}, ${category.icon}, ${category.color}, ${category.isActive})
        ON CONFLICT (name) DO NOTHING
      `);
    }

    console.log('Talent categories seeded successfully!');
    
    // Now let's check if we have users to create featured talents
    const users = await db.execute(sql`
      SELECT id, username, role, type FROM users 
      WHERE role = 'talent' 
      LIMIT 10
    `);
    
    console.log(`Found ${users.rows.length} talent users`);
    
    if (users.rows.length > 0) {
      // Get category IDs
      const categoryRows = await db.execute(sql`
        SELECT id, name FROM talent_categories
      `);
      
      const categoryMap = {};
      categoryRows.rows.forEach(row => {
        categoryMap[row.name] = row.id;
      });
      
      // Create some featured talents
      const featuredTalents = [
        {
          userId: users.rows[0].id,
          categoryId: categoryMap['Featured Performer'],
          featuredReason: 'Outstanding performance in recent productions',
          displayOrder: 1,
          isActive: true
        },
        {
          userId: users.rows[1] ? users.rows[1].id : users.rows[0].id,
          categoryId: categoryMap['Rising Star'],
          featuredReason: 'Exceptional growth and potential',
          displayOrder: 2,
          isActive: true
        },
        {
          userId: users.rows[2] ? users.rows[2].id : users.rows[0].id,
          categoryId: categoryMap['Industry Expert'],
          featuredReason: 'Years of professional experience',
          displayOrder: 3,
          isActive: true
        }
      ];
      
      // Insert featured talents
      for (const featured of featuredTalents) {
        await db.execute(sql`
          INSERT INTO featured_talents (user_id, category_id, featured_reason, display_order, is_active)
          VALUES (${featured.userId}, ${featured.categoryId}, ${featured.featuredReason}, ${featured.displayOrder}, ${featured.isActive})
          ON CONFLICT (user_id) DO UPDATE SET
            category_id = EXCLUDED.category_id,
            featured_reason = EXCLUDED.featured_reason,
            display_order = EXCLUDED.display_order,
            is_active = EXCLUDED.is_active
        `);
      }
      
      console.log('Featured talents seeded successfully!');
    }
    
  } catch (error) {
    console.error('Error seeding talent categories:', error);
  } finally {
    await pool.end();
  }
}

seedTalentCategories();