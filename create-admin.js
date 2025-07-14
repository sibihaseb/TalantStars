import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  
  const hashedPassword = await hashPassword('admin123');
  
  try {
    // Create the admin user
    await db.execute(`
      INSERT INTO users (username, password, email, first_name, last_name, role) 
      VALUES ('admin', $1, 'admin@talents-stars.com', 'Admin', 'User', 'admin')
      ON CONFLICT (username) DO UPDATE SET 
        password = $1,
        email = 'admin@talents-stars.com',
        first_name = 'Admin',
        last_name = 'User',
        role = 'admin'
    `, [hashedPassword]);
    
    console.log('Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();