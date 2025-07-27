# Step 2: Database Setup - Detailed Guide

## What You're Doing
You're creating all the database tables your app needs (like users, profiles, jobs, etc.) in Supabase.

## Step-by-Step with Screenshots

### 1. Find SQL Editor
- In your Supabase project dashboard
- Look at the left sidebar menu
- Click on "SQL Editor" (it has a database icon)

### 2. Create New Query
- You'll see the SQL Editor page
- Look for a button that says "New Query" (usually green/blue)
- Click it

### 3. Get the Database Code
- In your project files, find the file named `supabase-schema.sql`
- Open it (double-click)
- You'll see a lot of text starting with "-- Supabase Schema Migration"

### 4. Copy All the Code
- Press **Ctrl+A** (Windows) or **Cmd+A** (Mac) to select everything
- Press **Ctrl+C** (Windows) or **Cmd+C** (Mac) to copy

### 5. Paste into Supabase
- Go back to your Supabase SQL Editor tab
- Click in the big empty text area
- Press **Ctrl+V** (Windows) or **Cmd+V** (Mac) to paste
- You should now see lots of SQL code in the editor

### 6. Run the Code
- Look for a "Run" button (usually bottom-right corner)
- Click "Run"
- Wait 10-30 seconds

### 7. Check for Success
You should see one of these messages:
- ✅ "Success. No rows returned"
- ✅ "Query executed successfully"

If you see an error message, try again or let me know what it says.

## What Gets Created
After running successfully, you'll have:
- Users table (for accounts)
- User profiles table (for detailed profiles)
- Jobs table (for gig postings)
- Pricing tiers table (for subscription plans)
- Media files table (for photos/videos)
- And 46 other tables for all app features

## Verify It Worked
1. In Supabase dashboard, go to "Table Editor" (left sidebar)
2. You should see a list of tables including "users", "user_profiles", "jobs"
3. If you see these tables, it worked perfectly!

## Common Issues
- **"Permission denied"**: Make sure you're the project owner
- **"Syntax error"**: Make sure you copied the entire file content
- **"Table already exists"**: That's OK, it means some tables were already there

The database is now ready for your app!