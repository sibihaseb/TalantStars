# How to Upload Your Code to GitHub (No Coding Required)

## Method 1: Direct Upload via GitHub Website (Easiest)

### Step 1: Download Your Code from Replit
1. **In your Replit project**: Click the three dots menu (⋯) next to your project name
2. **Click**: "Download as ZIP"
3. **Save the ZIP file** to your computer (remember where you saved it)
4. **Extract the ZIP file**: Right-click → "Extract All" (Windows) or double-click (Mac)

### Step 2: Create GitHub Repository
1. **Go to**: [github.com](https://github.com) and sign up/login
2. **Click**: "New" button (green button on left side)
3. **Repository name**: Type `talents-stars-platform`
4. **Description**: Type `Entertainment talent management platform`
5. **Set to Private**: Check the "Private" option
6. **DON'T check**: "Add a README file" (leave unchecked)
7. **Click**: "Create repository"

### Step 3: Upload Your Files
1. **You'll see an empty repository page**
2. **Click**: "uploading an existing file" link
3. **Drag and drop**: The extracted folder contents into the upload area
   - Select ALL files from your extracted Replit folder
   - This includes folders like `client`, `server`, `shared`, and files like `package.json`
4. **Scroll down** to "Commit new files" section
5. **Type commit message**: "Initial upload of Talents & Stars platform"
6. **Click**: "Commit new files"

**✅ Success**: You should now see all your project files listed on GitHub!

## Method 2: GitHub Desktop (Alternative)

### If you prefer a desktop app:
1. **Download**: [GitHub Desktop](https://desktop.github.com/)
2. **Install and login** with your GitHub account
3. **Clone your repository** you created above
4. **Copy your extracted files** into the cloned folder
5. **Commit and push** using the GitHub Desktop interface

---

# How to Deploy to Vercel (No Coding Required)

## Step 1: Connect GitHub to Vercel
1. **Go to**: [vercel.com](https://vercel.com)
2. **Click**: "Start Deploying" or "Sign Up"
3. **Sign up with GitHub**: Click "Continue with GitHub"
4. **Authorize Vercel**: Click "Authorize vercel" when prompted

## Step 2: Import Your Project
1. **On Vercel dashboard**: Click "New Project"
2. **Find your repository**: Look for `talents-stars-platform`
3. **Click**: "Import" button next to your repository

## Step 3: Configure Build Settings
**Important**: Before clicking "Deploy", configure these settings:

1. **Framework Preset**: Select "Other" from dropdown
2. **Build Command**: Type `npm run build`
3. **Output Directory**: Type `dist`
4. **Install Command**: Leave as `npm install`

## Step 4: Deploy
1. **Click**: "Deploy" button
2. **Wait**: 3-5 minutes for deployment
3. **Success**: You'll get a live URL like `https://talents-stars-platform.vercel.app`

**✅ Your app is now live!** (But needs environment variables to work properly)

---

# Step 5: Environment Variables Configuration

## What Are Environment Variables?
These are secret keys and settings that tell your app how to connect to services like your database, payment system, and email service.

## Step 1: Access Environment Variables
1. **In your Vercel project**: Click on your project name
2. **Click**: "Settings" tab (top menu)
3. **Click**: "Environment Variables" (left sidebar)

## Step 2: Add Each Variable
**Click "Add New" for each of these 6 variables:**

### Variable 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Get from Supabase:
  1. Go to your Supabase project
  2. Settings → Database
  3. Copy "Connection string" under "Connection pooling"
  4. Replace `[YOUR-PASSWORD]` with your actual database password

### Variable 2: STRIPE_SECRET_KEY
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: Get from Stripe:
  1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
  2. Copy the "Secret key" (starts with `sk_`)

### Variable 3: VITE_STRIPE_PUBLIC_KEY
- **Name**: `VITE_STRIPE_PUBLIC_KEY`
- **Value**: Get from Stripe:
  1. Same page as above
  2. Copy the "Publishable key" (starts with `pk_`)

### Variable 4: RESEND_API_KEY
- **Name**: `RESEND_API_KEY`
- **Value**: Get from Resend:
  1. Go to [resend.com/api-keys](https://resend.com/api-keys)
  2. Create new API key if needed
  3. Copy the key (starts with `re_`)

### Variable 5: OPENAI_API_KEY
- **Name**: `OPENAI_API_KEY`
- **Value**: Get from OpenAI:
  1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  2. Create new secret key if needed
  3. Copy the key (starts with `sk-`)

### Variable 6: SESSION_SECRET
- **Name**: `SESSION_SECRET`
- **Value**: Generate random string:
  1. Go to [random.org/strings](https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new)
  2. Generate a 32-character random string
  3. Copy and paste it

## Step 3: Redeploy
1. **After adding all 6 variables**: Go to "Deployments" tab
2. **Find the latest deployment**: Click the three dots (⋯)
3. **Click**: "Redeploy"
4. **Wait**: 2-3 minutes for redeployment

## Step 4: Test Your App
1. **Visit your Vercel URL**: `https://your-project-name.vercel.app`
2. **Test registration**: Create a test account
3. **Test login**: Login with your test account
4. **Success**: Your app should work exactly like it did on Replit!

---

# Complete Checklist

- [ ] Downloaded code from Replit as ZIP
- [ ] Created GitHub repository (private)
- [ ] Uploaded all files to GitHub
- [ ] Connected GitHub to Vercel
- [ ] Configured build settings (npm run build, dist)
- [ ] Added all 6 environment variables
- [ ] Redeployed after adding variables
- [ ] Tested the live app

**🎉 Your platform is now live and scalable on professional hosting!**