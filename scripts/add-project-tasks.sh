#!/bin/bash

# Add tasks to GitHub Project
set -e

REPO="Raghavendra198902/iac"
PROJECT_NUM="3"

echo "Adding tasks to project #$PROJECT_NUM..."

# Task 1
echo "[1/7] Creating task 1..."
URL1=$(gh issue create --repo "$REPO" \
  --title "Publish npm package to npmjs.com registry" \
  --body "Run npm login and execute ./publish.sh to publish @raghavendra198902/iac-dharma to npm registry. Package is ready (22.5KB, 10 files verified)." \
  --label "priority-high")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL1"
echo "✓ Added issue #$(echo $URL1 | grep -oP '\d+$')"

# Task 2
echo "[2/7] Creating task 2..."
URL2=$(gh issue create --repo "$REPO" \
  --title "Create v1.0.0 GitHub Release page with assets" \
  --body "Navigate to /releases/new, select v1.0.0 tag, copy RELEASE_NOTES.md content, attach docker-compose.yml as release asset." \
  --label "priority-high")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL2"
echo "✓ Added issue #$(echo $URL2 | grep -oP '\d+$')"

# Task 3
echo "[3/7] Creating task 3..."
URL3=$(gh issue create --repo "$REPO" \
  --title "Complete 29 remaining priority wiki pages" \
  --body "Create Feature-Flags, Development-Setup, Troubleshooting, Contributing-Guide, and 25 other wiki pages. Currently 6/35 pages complete (17%)." \
  --label "priority-high")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL3"
echo "✓ Added issue #$(echo $URL3 | grep -oP '\d+$')"

# Task 4
echo "[4/7] Creating task 4..."
URL4=$(gh issue create --repo "$REPO" \
  --title "Add status badges to README.md" \
  --body "Add badges for build status, code coverage, npm downloads, Docker pulls. Use shields.io format." \
  --label "priority-medium")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL4"
echo "✓ Added issue #$(echo $URL4 | grep -oP '\d+$')"

# Task 5
echo "[5/7] Creating task 5..."
URL5=$(gh issue create --repo "$REPO" \
  --title "Set up CI/CD monitoring with GitHub Actions" \
  --body "Create workflows for test.yml, build.yml, deploy.yml with automated testing and deployment to staging/production." \
  --label "priority-medium")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL5"
echo "✓ Added issue #$(echo $URL5 | grep -oP '\d+$')"

# Task 6
echo "[6/7] Creating task 6..."
URL6=$(gh issue create --repo "$REPO" \
  --title "Increase test coverage to 80%+" \
  --body "Add tests for API Gateway, Blueprint Service, IAC Generator. Currently at approximately 75% coverage." \
  --label "priority-medium")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL6"
echo "✓ Added issue #$(echo $URL6 | grep -oP '\d+$')"

# Task 7
echo "[7/7] Creating task 7..."
URL7=$(gh issue create --repo "$REPO" \
  --title "Create promotional content and announce publicly" \
  --body "Record introductory video demo, tutorials, and announce on Reddit (r/devops, r/kubernetes, r/aws), LinkedIn, Twitter, and HackerNews." \
  --label "priority-low")
gh project item-add "$PROJECT_NUM" --owner Raghavendra198902 --url "$URL7"
echo "✓ Added issue #$(echo $URL7 | grep -oP '\d+$')"

echo ""
echo "=========================================="
echo "✓ All 7 tasks added to project!"
echo "=========================================="
echo ""
echo "View project: https://github.com/users/Raghavendra198902/projects/$PROJECT_NUM"
echo "View issues: https://github.com/$REPO/issues"
