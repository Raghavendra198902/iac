#!/bin/bash
# Test script to verify all agent packages

echo "🧪 CMDB Agent Package Verification Test"
echo "========================================"
echo ""

DOWNLOADS_DIR="/home/rrd/iac/frontend/public/downloads"
PASS=0
FAIL=0

# Function to test package
test_package() {
    local file=$1
    local expected_size=$2
    local platform=$3
    
    echo -n "Testing $platform package... "
    
    if [ ! -f "$DOWNLOADS_DIR/$file" ]; then
        echo "❌ FAIL - File not found"
        ((FAIL++))
        return 1
    fi
    
    # Check if SHA256 file exists
    if [ ! -f "$DOWNLOADS_DIR/${file}.sha256" ]; then
        echo "⚠️  WARNING - No .sha256 file"
    fi
    
    # Get actual size
    SIZE=$(du -h "$DOWNLOADS_DIR/$file" | cut -f1)
    echo "✅ PASS - Size: $SIZE"
    ((PASS++))
    
    # Verify archive integrity
    if [[ "$file" == *.tar.gz ]]; then
        if tar -tzf "$DOWNLOADS_DIR/$file" > /dev/null 2>&1; then
            echo "  ✓ Archive integrity verified"
        else
            echo "  ✗ Archive corrupted"
            ((FAIL++))
        fi
    elif [[ "$file" == *.zip ]]; then
        if unzip -t "$DOWNLOADS_DIR/$file" > /dev/null 2>&1; then
            echo "  ✓ Archive integrity verified"
        else
            echo "  ✗ Archive corrupted"
            ((FAIL++))
        fi
    fi
}

echo "📦 Package Tests:"
echo "----------------"
test_package "cmdb-agent-windows-1.0.0.zip" "6.0M" "Windows x64"
test_package "cmdb-agent-linux-amd64-1.0.0.tar.gz" "5.9M" "Linux AMD64"
test_package "cmdb-agent-linux-arm64-1.0.0.tar.gz" "5.3M" "Linux ARM64"
test_package "cmdb-agent-macos-amd64-1.0.0.tar.gz" "5.9M" "macOS Intel"
test_package "cmdb-agent-macos-arm64-1.0.0.tar.gz" "5.5M" "macOS Apple Silicon"

echo ""
echo "📋 Package Contents Tests:"
echo "-------------------------"

# Test Windows package contents
echo -n "Windows package structure... "
if unzip -l "$DOWNLOADS_DIR/cmdb-agent-windows-1.0.0.zip" | grep -q "msi-builder/build-msi.bat"; then
    echo "✅ MSI builder included"
    ((PASS++))
else
    echo "❌ MSI builder missing"
    ((FAIL++))
fi

# Test Linux package contents
echo -n "Linux AMD64 package structure... "
if tar -tzf "$DOWNLOADS_DIR/cmdb-agent-linux-amd64-1.0.0.tar.gz" | grep -q "install.sh"; then
    echo "✅ Install script included"
    ((PASS++))
else
    echo "❌ Install script missing"
    ((FAIL++))
fi

# Test macOS package contents
echo -n "macOS package structure... "
if tar -tzf "$DOWNLOADS_DIR/cmdb-agent-macos-amd64-1.0.0.tar.gz" | grep -q "LaunchDaemons"; then
    echo "✅ LaunchDaemon included"
    ((PASS++))
else
    echo "❌ LaunchDaemon missing"
    ((FAIL++))
fi

echo ""
echo "🔍 Binary Tests:"
echo "---------------"

# Extract and test Linux binary
TEMP_DIR=$(mktemp -d)
tar -xzf "$DOWNLOADS_DIR/cmdb-agent-linux-amd64-1.0.0.tar.gz" -C "$TEMP_DIR"
EXTRACT_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d | tail -1)

if [ -x "$EXTRACT_DIR/cmdb-agent" ]; then
    echo "✅ Linux binary is executable"
    ((PASS++))
    
    # Check binary info
    file "$EXTRACT_DIR/cmdb-agent" | grep -q "ELF 64-bit"
    if [ $? -eq 0 ]; then
        echo "  ✓ Correct architecture (ELF 64-bit)"
    fi
else
    echo "❌ Linux binary not executable"
    ((FAIL++))
fi

rm -rf "$TEMP_DIR"

echo ""
echo "📊 Summary:"
echo "----------"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed!"
    exit 1
fi
