#!/bin/bash

echo "🚀 CMDB Agent GUI Setup"
echo "====================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js version 20+ is recommended (you have v$NODE_VERSION)"
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "🎨 Available commands:"
echo "  npm run dev          - Run in development mode"
echo "  npm run build        - Build React app"
echo "  npm run electron:dev - Run Electron app in development"
echo "  npm run electron:build - Build Electron app for production"
echo ""

# Ask user what to do
read -p "Would you like to start the development app now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting CMDB Agent GUI in development mode..."
    echo "   Press Ctrl+C to stop"
    echo ""
    npm run electron:dev
fi
