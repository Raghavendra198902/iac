#!/bin/bash

# Upload Wiki Pages Script
# This script helps you upload wiki pages to GitHub

echo "=================================================="
echo "  IAC Dharma - Wiki Upload Helper"
echo "=================================================="
echo ""

WIKI_DIR="docs/wiki"
WIKI_PAGES=(
    "Home.md"
    "Installation-Guide.md"
    "Quick-Start.md"
    "Architecture-Overview.md"
    "API-Reference.md"
)

echo "Wiki pages ready to upload:"
echo ""
for page in "${WIKI_PAGES[@]}"; do
    if [ -f "$WIKI_DIR/$page" ]; then
        size=$(wc -l < "$WIKI_DIR/$page")
        echo "  ✓ $page ($size lines)"
    else
        echo "  ✗ $page (missing)"
    fi
done
echo ""

echo "=================================================="
echo "  Upload Instructions"
echo "=================================================="
echo ""
echo "Since this is the first wiki page, GitHub requires manual creation:"
echo ""
echo "STEP 1: Create First Wiki Page"
echo "  1. Go to: https://github.com/Raghavendra198902/iac/wiki"
echo "  2. Click 'Create the first page' button"
echo "  3. Leave title as 'Home'"
echo "  4. Copy content from: $WIKI_DIR/Home.md"
echo "  5. Click 'Save Page'"
echo ""
echo "STEP 2: Clone Wiki Repository"
echo "  After creating the first page, run:"
echo "  cd /home/rrd"
echo "  git clone https://github.com/Raghavendra198902/iac.wiki.git"
echo ""
echo "STEP 3: Copy Wiki Files"
echo "  cd iac.wiki"
echo "  cp ../iac/$WIKI_DIR/*.md ."
echo ""
echo "STEP 4: Push to GitHub"
echo "  git add ."
echo "  git commit -m 'docs: Add comprehensive wiki documentation'"
echo "  git push origin master"
echo ""
echo "=================================================="
echo ""
echo "Quick Copy Commands (after Step 1):"
echo ""
echo "cd /home/rrd && \\"
echo "git clone https://github.com/Raghavendra198902/iac.wiki.git && \\"
echo "cd iac.wiki && \\"
echo "cp ../iac/$WIKI_DIR/*.md . && \\"
echo "git add . && \\"
echo "git commit -m 'docs: Add comprehensive wiki documentation' && \\"
echo "git push origin master"
echo ""
echo "=================================================="
echo ""

# Offer to open the content for easy copying
echo "Would you like to view the Home.md content now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "=================================================="
    echo "  Home.md Content (Copy this to GitHub)"
    echo "=================================================="
    echo ""
    cat "$WIKI_DIR/Home.md"
    echo ""
    echo "=================================================="
fi

echo ""
echo "Done! Follow the steps above to upload your wiki pages."
