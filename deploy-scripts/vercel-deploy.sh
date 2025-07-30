#!/bin/bash
# Vercel Deployment Script for Talents & Stars Platform

echo "🚀 Deploying Talents & Stars Platform to Vercel..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Vercel login (if required)..."
vercel login

# Set up project
echo "📁 Setting up Vercel project..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at the provided Vercel URL"
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Configure custom domain (if needed)"
echo "   3. Test all functionality in production"