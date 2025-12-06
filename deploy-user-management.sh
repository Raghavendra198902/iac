#!/bin/bash

echo "================================================"
echo "Deploying User Management System"
echo "================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Apply database migration
echo -e "\n${BLUE}[1/5]${NC} Applying database migration..."
docker exec -i iac-postgres-1 psql -U iac_user -d iac_platform < /home/rrd/iac/database/migrations/003_create_user_management.sql
echo -e "${GREEN}✓${NC} Database schema created"

# Step 2: Install backend dependencies
echo -e "\n${BLUE}[2/5]${NC} Installing backend dependencies..."
cd /home/rrd/iac/backend/user-management-service
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 3: Create .env file
echo -e "\n${BLUE}[3/5]${NC} Creating environment configuration..."
cp .env.example .env
echo -e "${GREEN}✓${NC} Environment file created"

# Step 4: Build and start backend service
echo -e "\n${BLUE}[4/5]${NC} Building and starting backend service..."
docker build -t iac-user-management:latest .
docker run -d \
  --name iac-user-management \
  --network iac_default \
  -p 3020:3020 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=iac_platform \
  -e DB_USER=iac_user \
  -e DB_PASSWORD=iac_password \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  -e JWT_REFRESH_SECRET=$(openssl rand -base64 32) \
  iac-user-management:latest

echo -e "${GREEN}✓${NC} Backend service started on port 3020"

# Step 5: Rebuild and deploy frontend
echo -e "\n${BLUE}[5/5]${NC} Rebuilding and deploying frontend..."
cd /home/rrd/iac/frontend-v3-new
docker build -t iac-frontend:v3-with-users .
docker stop iac-frontend-v3
docker rm iac-frontend-v3
docker run -d \
  --name iac-frontend-v3 \
  --network iac_default \
  -p 3000:80 \
  -p 3443:443 \
  iac-frontend:v3-with-users

echo -e "${GREEN}✓${NC} Frontend deployed"

# Wait for services to be healthy
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Test backend health
if curl -s http://localhost:3020/health > /dev/null; then
  echo -e "${GREEN}✓${NC} Backend service is healthy"
else
  echo -e "${YELLOW}⚠${NC} Backend service may still be starting..."
fi

# Test frontend health
if curl -k -s https://localhost:3443 > /dev/null; then
  echo -e "${GREEN}✓${NC} Frontend is accessible"
else
  echo -e "${YELLOW}⚠${NC} Frontend may still be starting..."
fi

echo -e "\n================================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "================================================"
echo -e "\nAccess Points:"
echo -e "  Frontend:    ${BLUE}https://localhost:3443${NC}"
echo -e "  Dashboard:   ${BLUE}https://localhost:3443/dashboard${NC}"
echo -e "  Users:       ${BLUE}https://localhost:3443/users${NC}"
echo -e "  Backend API: ${BLUE}http://localhost:3020${NC}"
echo -e "  Health:      ${BLUE}http://localhost:3020/health${NC}"
echo ""
echo -e "Default Roles Created:"
echo "  - Super Administrator (super_admin)"
echo "  - Administrator (admin)"
echo "  - Operator (operator)"
echo "  - Developer (developer)"
echo "  - Auditor (auditor)"
echo "  - Viewer (viewer)"
echo ""
echo -e "${YELLOW}Note:${NC} Use the /api/auth/register endpoint to create your first admin user"
echo "================================================"
