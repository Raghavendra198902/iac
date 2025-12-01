#!/bin/bash

################################################################################
# Install Dependencies Script
# Automated dependency installation for CMDB Agent project
################################################################################

set -e

echo "📦 Installing Project Dependencies"
echo "==================================="
echo

# Detect OS
OS_TYPE=$(uname -s)

install_node_linux() {
    echo "Installing Node.js on Linux..."
    
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        # RHEL/CentOS
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "❌ Unsupported package manager"
        exit 1
    fi
}

install_node_macos() {
    echo "Installing Node.js on macOS..."
    
    if command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ Homebrew not found. Please install from: https://brew.sh"
        exit 1
    fi
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    
    case "${OS_TYPE}" in
        Linux*)
            install_node_linux
            ;;
        Darwin*)
            install_node_macos
            ;;
        *)
            echo "❌ Unsupported OS: ${OS_TYPE}"
            exit 1
            ;;
    esac
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
else
    echo "✅ npm: $(npm --version)"
fi

# Install global dependencies
echo
echo "Installing global packages..."
npm install -g typescript ts-node

# Install project dependencies
echo
echo "Installing backend dependencies..."
cd "$(dirname "$0")/../backend/cmdb-agent"
npm install

echo
echo "Installing frontend dependencies..."
cd "$(dirname "$0")/../frontend"
npm install

echo
echo "✅ All dependencies installed successfully!"
