#!/bin/bash

# Hugging Face Integration Quick Setup Script
# This script automates the setup process for Hugging Face integration

set -e  # Exit on any error

echo "🤖 Hugging Face Integration - Quick Setup"
echo "==========================================="
echo ""

# Check if we're in the examples directory
if [ ! -f "huggingface-proxy-backend.js" ]; then
    echo "❌ Error: Please run this script from the examples directory"
    echo "   cd examples && ./setup-huggingface.sh"
    exit 1
fi

# Step 1: Check if Node.js is installed
echo "📋 Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

node_version=$(node --version)
echo "✅ Node.js found: $node_version"
echo ""

# Step 2: Check if npm is installed
echo "📋 Step 2: Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

npm_version=$(npm --version)
echo "✅ npm found: v$npm_version"
echo ""

# Step 3: Install dependencies
echo "📋 Step 3: Installing dependencies..."
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json from template..."
    cp huggingface-backend-package.json package.json
fi

npm install
echo "✅ Dependencies installed successfully"
echo ""

# Step 4: Setup environment file
echo "📋 Step 4: Setting up environment configuration..."
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi
echo ""

# Step 5: Check for API key
echo "📋 Step 5: Checking API key configuration..."
if grep -q "hf_your_api_key_here" .env; then
    echo "⚠️  API key not configured yet!"
    echo ""
    echo "🔑 To complete setup:"
    echo "   1. Visit: https://huggingface.co/settings/tokens"
    echo "   2. Create a new token with 'Read' permissions"
    echo "   3. Edit .env file and replace 'hf_your_api_key_here' with your token"
    echo ""
    echo "📝 Edit command: nano .env"
    echo ""
else
    echo "✅ API key appears to be configured"
fi

# Step 6: Test configuration
echo "📋 Step 6: Testing configuration..."
if [ -f ".env" ] && [ -f "package.json" ] && [ -d "node_modules" ]; then
    echo "✅ All files are in place"
else
    echo "❌ Some files are missing. Please check the setup."
    exit 1
fi
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 Next Steps:"
echo "   1. Configure your API key in .env (if not done yet)"
echo "   2. Start the proxy server: npm run dev"
echo "   3. Or use: make huggingface-start (from project root)"
echo ""
echo "📖 Documentation:"
echo "   • Full guide: README-HuggingFace.md"
echo "   • Example component: BookmarkFormWithHuggingFace.tsx"
echo "   • Service layer: huggingFaceService.ts"
echo ""
echo "🔧 Useful Commands:"
echo "   npm run dev      - Start development server with auto-reload"
echo "   npm start        - Start production server"
echo "   npm run test     - Run tests (if available)"
echo ""
echo "💡 Tip: Keep this terminal open to see server logs when running"
echo ""

# Optional: Ask if user wants to start the server immediately
read -p "🚀 Would you like to start the proxy server now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting Hugging Face proxy server..."
    echo "📝 Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo "👍 Setup complete! Run 'npm run dev' when ready to start the server."
fi