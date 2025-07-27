# Troubleshooting Guide - Common Issues and Solutions

## GitHub Upload Issues

### Problem: "File too large" error
**Solution**: 
- Remove `node_modules` folder before uploading
- Only upload source code files, not dependencies

### Problem: Can't find files after extraction
**Solution**:
- Make sure you extracted the ZIP completely
- Look inside the extracted folder for files like `package.json`, `client`, `server`

### Problem: Upload keeps failing
**Solution**:
- Try uploading files in smaller batches
- Check your internet connection
- Try using GitHub Desktop instead

## Vercel Deployment Issues

### Problem: Build fails with "npm install" error
**Solution**:
1. Check that `package.json` file was uploaded to GitHub
2. Go to Vercel Settings → General → Node.js Version → Set to 18.x

### Problem: Build fails with "command not found"
**Solution**:
- Make sure Build Command is exactly: `npm run build`
- Make sure Output Directory is exactly: `dist`

### Problem: App shows "404 Not Found"
**Solution**:
- Check that Output Directory is set to `dist`
- Redeploy after fixing settings

### Problem: App loads but shows errors
**Solution**:
- Check that all 6 environment variables are set
- Make sure variable names are spelled exactly right
- Redeploy after adding all variables

## Environment Variables Issues

### Problem: Database connection error
**Solutions**:
- Double-check DATABASE_URL format
- Make sure password in URL matches your Supabase password
- Test connection in Supabase SQL Editor: `SELECT 1;`

### Problem: Stripe not working
**Solutions**:
- Verify you have both secret key (sk_) and public key (pk_)
- Make sure keys are from the same Stripe account
- Check that keys aren't expired

### Problem: Email not sending
**Solutions**:
- Verify Resend API key starts with `re_`
- Check Resend dashboard for any sending issues
- Make sure domain is verified in Resend

### Problem: App crashes on startup
**Solutions**:
- Check all 6 environment variables are present
- Look at Vercel Functions logs for specific errors
- Make sure SESSION_SECRET is at least 16 characters

## Getting Help

### Where to Find Logs
1. **Vercel**: Project → Functions → Click on function → View logs
2. **Supabase**: Project → Logs → Database logs
3. **Browser**: Right-click → Inspect → Console tab

### Testing Individual Components
- **Database**: Run `SELECT 1;` in Supabase SQL Editor
- **Stripe**: Visit Stripe dashboard → Logs
- **Email**: Send test email from Resend dashboard

### If All Else Fails
1. Try redeploying: Vercel → Deployments → Redeploy
2. Check that all files uploaded correctly to GitHub
3. Verify all environment variables are exactly as specified
4. Compare your setup with the working Replit version

## Success Indicators

### ✅ Everything Working Correctly:
- GitHub shows all your project files
- Vercel deployment shows "Ready"
- Your .vercel.app URL loads the landing page
- User registration creates accounts
- Login works with created accounts
- Profile creation saves properly

### 🔄 Normal Warnings (Safe to Ignore):
- "Browserslist data is old" - cosmetic warning
- Build warnings about unused variables - won't break functionality
- Some TypeScript warnings - app will still work

Your platform should work exactly like it did on Replit, but now it's on professional, scalable hosting!