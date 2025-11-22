#!/bin/bash

# Quick Wiki Upload Commands
# Run this after creating the first wiki page on GitHub

echo "Uploading wiki pages to GitHub..."
echo ""

cd /home/rrd

# Clone wiki repo
echo "Step 1: Cloning wiki repository..."
git clone https://github.com/Raghavendra198902/iac.wiki.git

# Copy files
echo "Step 2: Copying wiki files..."
cd iac.wiki
cp ../iac/docs/wiki/*.md .

# Commit and push
echo "Step 3: Committing and pushing..."
git add .
git commit -m "docs: Add comprehensive wiki documentation (Installation, Quick Start, Architecture, API Reference)"
git push origin master

echo ""
echo "✅ Wiki pages uploaded successfully!"
echo ""
echo "View your wiki at: https://github.com/Raghavendra198902/iac/wiki"
