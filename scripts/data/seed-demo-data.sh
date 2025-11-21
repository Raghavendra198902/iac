#!/bin/bash
# Citadel CMDB - Demo Data Seeder Script
# Compiles and runs the TypeScript seeder

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║       Citadel CMDB - Demo Data Seeder                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if API is running
echo "🔍 Checking if API Gateway is running..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Error: API Gateway is not running at http://localhost:3000"
    echo ""
    echo "Please start the services first:"
    echo "  docker-compose up -d"
    echo ""
    exit 1
fi
echo "✅ API Gateway is running"
echo ""

# Compile TypeScript seeder
echo "🔨 Compiling TypeScript seeder..."
cd "$SCRIPT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --save-dev typescript @types/node ts-node
    npm install axios
fi

# Run with ts-node
echo "🌱 Running demo data seeder..."
echo ""

npx ts-node seed-demo-data.ts

echo ""
echo "✅ Demo data seeding complete!"
echo ""
