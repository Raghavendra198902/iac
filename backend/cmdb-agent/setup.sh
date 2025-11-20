#!/bin/bash

# CMDB Agent Setup Script

set -e

echo "🚀 CMDB Agent Setup"
echo "==================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the cmdb-agent directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and set CMDB_API_KEY before starting${NC}"
    echo ""
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✓ Created logs directory${NC}"

# Build Docker image
echo ""
echo "Building Docker image..."
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi

# Start agent
echo ""
echo "Starting CMDB Agent..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ CMDB Agent started successfully${NC}"
    echo ""
    echo "Agent is running at: http://localhost:9000"
    echo ""
    echo "Useful commands:"
    echo "  docker-compose logs -f        # View logs"
    echo "  docker-compose ps             # Check status"
    echo "  docker-compose stop           # Stop agent"
    echo "  docker-compose restart        # Restart agent"
    echo "  curl http://localhost:9000/health   # Health check"
    echo "  curl http://localhost:9000/status   # Agent status"
else
    echo -e "${RED}✗ Failed to start CMDB Agent${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
