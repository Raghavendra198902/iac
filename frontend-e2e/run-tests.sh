#!/bin/bash

# Test Runner Script for IAC Platform Frontend E2E
# This script runs comprehensive tests including unit, security, and integration tests

set -e

echo "=================================="
echo "IAC Platform - Test Suite Runner"
echo "=================================="
echo ""

cd /home/rrd/iac/frontend-e2e

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ERROR: node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Install missing dependencies
echo "📦 Installing missing test dependencies..."
if command -v npm &> /dev/null; then
    npm install --save-dev @testing-library/dom 2>&1 | tail -5
else
    echo "WARNING: npm not found in PATH. Skipping dependency installation."
fi

echo ""
echo "🧪 Running Test Suites..."
echo ""

# Fix permissions
chmod -R u+w node_modules 2>/dev/null || true

# Run tests with coverage
echo "Running tests with coverage..."
if [ -x "./node_modules/.bin/vitest" ]; then
    ./node_modules/.bin/vitest run --coverage --reporter=verbose 2>&1 | tee test-results.log
    TEST_EXIT_CODE=$?
else
    echo "ERROR: Vitest not found. Please ensure dependencies are installed."
    exit 1
fi

echo ""
echo "=================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed successfully!"
else
    echo "❌ Some tests failed. Check test-results.log for details."
fi
echo "=================================="
echo ""

# Display summary
echo "📊 Test Summary:"
echo "- Unit Tests: Reports, Admin, Dashboard"
echo "- Security Tests: Authentication, Authorization, Input Validation"
echo "- Integration Tests: Positive & Negative Testing"
echo "- Coverage Report: coverage/index.html"
echo ""

exit $TEST_EXIT_CODE
