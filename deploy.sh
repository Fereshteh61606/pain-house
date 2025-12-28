#!/bin/bash

# Pain House - Quick Deployment Script
# This script helps you deploy to Vercel quickly

echo "🏠 Pain House - Deployment Helper"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Pain House"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Choose deployment option:"
echo "1) Deploy to Vercel (Recommended)"
echo "2) Just build locally"
echo "3) Exit"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."
        echo ""
        echo "⚠️  IMPORTANT: After deployment, add these environment variables in Vercel dashboard:"
        echo "   NEXT_PUBLIC_SUPABASE_URL"
        echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo ""
        read -p "Press Enter to continue..."
        vercel
        ;;
    2)
        echo ""
        echo "🔨 Building locally..."
        npm run build
        echo ""
        echo "✅ Build complete! Run 'npm start' to test locally"
        ;;
    3)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "📚 For more deployment options, see DEPLOYMENT_GUIDE.md"
