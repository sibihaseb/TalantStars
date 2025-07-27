# Automated GitHub + Supabase Setup (No Code Required)

## 🎯 SIMPLE SETUP - Just Click and Configure

### Step 1: Create Supabase Project (5 minutes)
1. **Go to**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Click**: "New Project"
3. **Fill in**:
   - Organization: Choose or create
   - Project Name: `talents-stars-platform`
   - Database Password: Click "Generate password" and save it
   - Region: Choose closest to you
4. **Wait**: 2-3 minutes for setup
5. **Save**: Your project URL and password

### Step 2: Import Database Schema (2 minutes)
1. **In Supabase dashboard**: Go to "SQL Editor"
2. **Click**: "New Query"
3. **Copy & Paste** the entire content from `supabase-schema.sql` file
4. **Click**: "Run" (creates all 51 tables automatically)

### Step 3: Create GitHub Repository (3 minutes)
1. **Go to**: [github.com/new](https://github.com/new)
2. **Repository Name**: `talents-stars-platform`
3. **Set to**: Private
4. **Click**: "Create repository"
5. **Save**: Your repository URL

### Step 4: Deploy to Vercel (One-Click Deploy)
**Use this magic button for instant deployment:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/talents-stars-platform&env=DATABASE_URL,STRIPE_SECRET_KEY,VITE_STRIPE_PUBLIC_KEY,RESEND_API_KEY,OPENAI_API_KEY,SESSION_SECRET)

**OR Manual Vercel Setup:**
1. **Go to**: [vercel.com](https://vercel.com)
2. **Click**: "New Project"
3. **Import**: Your GitHub repository
4. **Click**: "Deploy"

### Step 5: Configure Environment Variables (5 minutes)
**In Vercel Dashboard > Settings > Environment Variables, add:**

```
DATABASE_URL = [YOUR_SUPABASE_CONNECTION_STRING]
STRIPE_SECRET_KEY = [YOUR_STRIPE_SECRET_KEY]
VITE_STRIPE_PUBLIC_KEY = [YOUR_STRIPE_PUBLIC_KEY]
RESEND_API_KEY = [YOUR_RESEND_API_KEY]
OPENAI_API_KEY = [YOUR_OPENAI_API_KEY]
SESSION_SECRET = [GENERATE_RANDOM_STRING]
```

## 🔗 GET YOUR CONNECTION STRINGS

### Supabase Database URL:
1. **Supabase Dashboard** → Settings → Database
2. **Copy** "Connection string" under "Connection pooling"
3. **Replace** `[YOUR-PASSWORD]` with your actual password

### Stripe Keys:
1. **Go to**: [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. **Copy** "Publishable key" (pk_...) → VITE_STRIPE_PUBLIC_KEY
3. **Copy** "Secret key" (sk_...) → STRIPE_SECRET_KEY

### Resend Email API:
1. **Go to**: [resend.com/api-keys](https://resend.com/api-keys)
2. **Create** new API key → RESEND_API_KEY

### OpenAI API:
1. **Go to**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Create** new API key → OPENAI_API_KEY

### Session Secret:
**Use this random generator**: [random.org/strings](https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new)

## 📋 COMPLETE SETUP CHECKLIST

- [ ] Supabase project created
- [ ] Database schema imported (51 tables)
- [ ] GitHub repository created
- [ ] Vercel deployment completed
- [ ] All environment variables set
- [ ] Test login on your new domain

## 🌐 AFTER DEPLOYMENT

Your app will be live at: `https://your-project-name.vercel.app`

**Test these features:**
1. User registration
2. Login system
3. Profile creation
4. File uploads
5. Payment processing

## 🚨 NEED HELP?

**Common Issues:**
- **Database connection error**: Check DATABASE_URL format
- **Stripe not working**: Verify both public and secret keys
- **Build failure**: Check environment variables are set

**Quick Fixes:**
- Redeploy: Go to Vercel dashboard → Deployments → "Redeploy"
- Check logs: Vercel dashboard → Functions → View logs
- Test database: Supabase dashboard → SQL Editor → `SELECT 1;`

## 💰 COSTS

- **Supabase**: Free (up to 500MB database)
- **Vercel**: Free (for small projects)
- **GitHub**: Free (private repositories)
- **Total**: $0/month to start

Your platform will be live and scalable without writing any code!