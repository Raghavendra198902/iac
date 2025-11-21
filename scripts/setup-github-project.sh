#!/bin/bash

# GitHub Project Board Setup Script
# Automates the creation and population of GitHub Projects board

set -e

echo "🚀 GitHub Project Board Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh is authenticated
echo -e "${BLUE}Checking GitHub CLI authentication...${NC}"
if ! gh auth status &>/dev/null; then
    echo -e "${YELLOW}Not authenticated. Please login to GitHub CLI:${NC}"
    gh auth login
fi

echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Repository info
REPO="Raghavendra198902/iac"
PROJECT_TITLE="IAC Dharma v1.0 - Production Release"

echo -e "${BLUE}Setting up project for: ${REPO}${NC}"
echo ""

# Get existing projects
echo -e "${BLUE}Checking for existing projects...${NC}"
PROJECT_NUMBER=$(gh project list --owner Raghavendra198902 --format json | jq -r '.projects[] | select(.title=="'"$PROJECT_TITLE"'") | .number' 2>/dev/null || echo "")

if [ -z "$PROJECT_NUMBER" ]; then
    echo -e "${YELLOW}Project not found. Creating new project...${NC}"
    
    # Create new project
    gh project create --owner Raghavendra198902 --title "$PROJECT_TITLE" --format json > /tmp/project.json
    PROJECT_NUMBER=$(jq -r '.number' /tmp/project.json)
    
    echo -e "${GREEN}✓ Created project #${PROJECT_NUMBER}${NC}"
else
    echo -e "${GREEN}✓ Found existing project #${PROJECT_NUMBER}${NC}"
fi

echo ""
echo -e "${BLUE}Adding tasks to project #${PROJECT_NUMBER}...${NC}"
echo ""

# Array of tasks with priorities
declare -a TASKS=(
    "Publish npm package to npmjs.com registry|priority-high|Run npm login and execute ./publish.sh to publish @raghavendra198902/iac-dharma to npm registry. Package is ready (22.5KB, 10 files verified)."
    "Create v1.0.0 GitHub Release page with assets|priority-high|Navigate to /releases/new, select v1.0.0 tag, copy RELEASE_NOTES.md content, attach docker-compose.yml as release asset."
    "Complete 29 remaining priority wiki pages|priority-high|Create Feature-Flags, Development-Setup, Troubleshooting, Contributing-Guide, and 25 other wiki pages. Currently 6/35 pages complete (17%)."
    "Add status badges to README.md|priority-medium|Add badges for build status, code coverage, npm downloads, Docker pulls. Use shields.io format."
    "Set up CI/CD monitoring with GitHub Actions|priority-medium|Create workflows for test.yml, build.yml, deploy.yml with automated testing and deployment to staging/production."
    "Increase test coverage to 80%+|priority-medium|Add tests for API Gateway, Blueprint Service, IAC Generator. Currently at approximately 75% coverage."
    "Create introductory video demo and tutorials|priority-low|Record platform overview (10 min), blueprint designer tutorial (15 min), AI recommendations deep dive (20 min)."
    "Announce on Reddit, LinkedIn, Twitter, HackerNews|priority-low|Share on r/devops, r/kubernetes, r/aws, LinkedIn, Twitter, and post to HackerNews for community visibility."
)

# Add each task
TASK_COUNT=0
for task_line in "${TASKS[@]}"; do
    IFS='|' read -r TITLE PRIORITY BODY <<< "$task_line"
    
    ((TASK_COUNT++))
    echo -e "${YELLOW}[$TASK_COUNT/8] Adding: $TITLE${NC}"
    
    # Create issue first (without milestone)
    ISSUE_URL=$(gh issue create \
        --repo "$REPO" \
        --title "$TITLE" \
        --body "$BODY" \
        --label "$PRIORITY" 2>&1 | grep -o 'https://.*')
    
    if [ -n "$ISSUE_URL" ]; then
        # Extract issue number from URL
        ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -oP '\d+$')
        
        # Add to project
        gh project item-add "$PROJECT_NUMBER" \
            --owner Raghavendra198902 \
            --url "$ISSUE_URL" 2>/dev/null || true
        
        echo -e "${GREEN}  ✓ Created issue #$ISSUE_NUMBER and added to project${NC}"
    else
        echo -e "${YELLOW}  ⚠ Failed to create issue, may need to create labels first${NC}"
    fi
    
    sleep 1  # Rate limiting
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Project board setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Project URL:${NC} https://github.com/users/Raghavendra198902/projects/$PROJECT_NUMBER"
echo -e "${BLUE}Issues URL:${NC} https://github.com/$REPO/issues"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit the project board to organize tasks"
echo "2. Create custom views (Board, Table, Roadmap)"
echo "3. Configure automation rules"
echo "4. Start working on high-priority tasks!"
echo ""
