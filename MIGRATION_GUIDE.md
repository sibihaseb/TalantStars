# Migration Guide: Replit to GitHub + Supabase

## Overview
This guide will help you migrate your Talents & Stars platform from Replit to GitHub with Supabase as the database backend.

## Prerequisites
1. GitHub account
2. Supabase account (free tier available)
3. Node.js 18+ installed locally
4. Git installed locally

## Step 1: Database Migration to Supabase

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and enter project details:
   - Name: `talents-stars-platform`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project initialization (2-3 minutes)

### 1.2 Get Database Connection String
1. In your Supabase project dashboard
2. Go to Settings → Database
3. Copy the "Connection string" under "Connection pooling"
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Save this as your `DATABASE_URL`

### 1.3 Export Current Database Schema
```bash
# If you have PostgreSQL tools locally
pg_dump $DATABASE_URL --schema-only > schema.sql

# Or use the provided schema files in this project
```

### 1.4 Import Schema to Supabase
1. In Supabase dashboard, go to SQL Editor
2. Run the schema creation scripts (see `supabase-schema.sql` in this project)
3. Or upload your exported `schema.sql` file

## Step 2: GitHub Repository Setup

### 2.1 Create GitHub Repository
1. Go to GitHub and create new repository
2. Name: `talents-stars-platform`
3. Set to Private (recommended for production app)
4. Don't initialize with README (we'll push existing code)

### 2.2 Initialize Git and Push Code
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: Talents & Stars platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/talents-stars-platform.git
git push -u origin main
```

## Step 3: Environment Configuration

### 3.1 Create Environment Files
Create `.env` file in project root:
```env
# Database
DATABASE_URL=your_supabase_connection_string
PGHOST=your_supabase_host
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=your_password
PGPORT=5432

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Email
RESEND_API_KEY=your_resend_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Session
SESSION_SECRET=generate_random_string_here

# Node Environment
NODE_ENV=production
```

### 3.2 Create Production Environment File
Create `.env.production`:
```env
# Same as .env but with production values
NODE_ENV=production
# ... other production environment variables
```

## Step 4: Code Updates for Supabase

### 4.1 Update Database Configuration
The `server/db.ts` file is already configured for Supabase compatibility:
- Uses `@neondatabase/serverless` which works with Supabase
- Connection pooling enabled
- Proper error handling

### 4.2 Verify Drizzle Configuration
The `drizzle.config.ts` is already set up correctly:
- Uses `DATABASE_URL` environment variable
- PostgreSQL driver configuration
- Schema files properly referenced

## Step 5: Deployment Options

### Option A: Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option B: Railway
1. Connect GitHub repository to Railway
2. Set environment variables
3. Railway auto-detects Node.js and builds automatically

### Option C: DigitalOcean App Platform
1. Create new app from GitHub repository
2. Configure environment variables
3. Set build and run commands

### Option D: Self-hosted VPS
1. Clone repository on server
2. Install Node.js and dependencies
3. Set up PM2 for process management
4. Configure nginx as reverse proxy

## Step 6: Data Migration

### 6.1 Export Current Data
```bash
# Export all data from current database
pg_dump $CURRENT_DATABASE_URL --data-only --inserts > data.sql
```

### 6.2 Import Data to Supabase
1. Clean the exported data file (remove Replit-specific references)
2. Use Supabase SQL Editor to run data import
3. Or use command line:
```bash
psql $SUPABASE_DATABASE_URL < data.sql
```

## Step 7: Testing Migration

### 7.1 Local Testing
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### 7.2 Verify Functionality
- [ ] User registration/login
- [ ] Profile creation/editing
- [ ] File uploads (configure S3/Supabase Storage)
- [ ] Payment processing
- [ ] Admin functions
- [ ] Email notifications

## Step 8: Domain and SSL

### 8.1 Custom Domain (Optional)
1. Purchase domain from registrar
2. Configure DNS to point to your hosting platform
3. Set up SSL certificate (most platforms handle automatically)

### 8.2 Environment-Specific URLs
- Development: `http://localhost:5000`
- Staging: `https://your-app-staging.vercel.app`
- Production: `https://your-domain.com`

## Step 9: Monitoring and Maintenance

### 9.1 Set Up Monitoring
- Database monitoring via Supabase dashboard
- Application monitoring (Vercel Analytics, etc.)
- Error tracking (Sentry recommended)

### 9.2 Backup Strategy
- Supabase automatic backups (paid plans)
- Regular database exports
- Code backups via Git

## File Changes Required

The following files need attention during migration:

### Critical Files to Review:
1. `server/db.ts` - Database connection
2. `drizzle.config.ts` - Database configuration
3. `package.json` - Dependencies and scripts
4. Environment files - All secrets and URLs

### Files Already Configured:
- Database schema (`shared/schema.ts`)
- Storage system (`server/simple-storage.ts`)
- Authentication system (`server/auth.ts`)
- API routes (`server/routes.ts`)

## Troubleshooting

### Common Issues:
1. **Database Connection Errors**: Verify DATABASE_URL format
2. **Build Failures**: Check Node.js version compatibility
3. **Environment Variables**: Ensure all required variables are set
4. **File Uploads**: Configure Supabase Storage or keep Wasabi S3

### Support Resources:
- Supabase Documentation: https://supabase.com/docs
- Drizzle ORM Documentation: https://orm.drizzle.team
- Platform-specific deployment guides

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use connection pooling for production
3. **API Keys**: Rotate keys regularly
4. **CORS**: Configure proper CORS settings for production
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Cost Estimation

### Supabase (Database):
- Free tier: Up to 500MB, 2 CPU hours
- Pro tier: $25/month for larger databases

### Hosting Platform:
- Vercel: Free tier for small apps, $20/month Pro
- Railway: $5/month minimum
- DigitalOcean: $10-25/month depending on size

### Total Estimated Monthly Cost: $10-50 depending on usage