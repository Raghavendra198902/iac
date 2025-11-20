#!/bin/bash
# Build NSIS installer using Docker

set -e

echo "======================================"
echo "CMDB Agent Installer Builder"
echo "======================================"
echo ""

# Check if executables exist
if [ ! -f "dist/cmdb-agent-win.exe" ]; then
    echo "Building Windows executable..."
    docker run --rm -v $(pwd):/app -w /app node:20 bash -c "npm install && npm run build && npx pkg . --targets node18-win-x64 --out-path dist"
fi

# Create LICENSE file if it doesn't exist
if [ ! -f "LICENSE" ]; then
    echo "Creating LICENSE file..."
    cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 IAC Dharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
fi

echo ""
echo "Building NSIS installer using Docker..."
echo ""

# Build installer using NSIS in Docker
docker run --rm -v $(pwd):/app -w /app cdrx/nsis makensis installer.nsi

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "Build completed successfully!"
    echo "Installer created at: dist/cmdb-agent-setup-1.0.0.exe"
    echo "======================================"
    ls -lh dist/cmdb-agent-setup-*.exe
else
    echo ""
    echo "======================================"
    echo "Build failed! Check errors above."
    echo "======================================"
    exit 1
fi
