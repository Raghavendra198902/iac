#!/bin/bash

################################################################################
# CMDB Agent Deployment Script
# Copyright © 2024-2025 Raghavendra Deshpande. All Rights Reserved.
#
# Automated deployment script for IAC Dharma CMDB Agent
# Supports: Linux, Windows (via WSL), macOS
# 
# Features:
# - Platform detection and validation
# - Dependency installation
# - Agent compilation and packaging
# - Service configuration
# - Auto-update setup
# - Security policy deployment
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
AGENT_DIR="${PROJECT_ROOT}/backend/cmdb-agent"
BUILD_DIR="${AGENT_DIR}/dist"
INSTALL_DIR="/opt/iac-dharma/cmdb-agent"
SERVICE_NAME="cmdb-agent"
LOG_FILE="/tmp/cmdb-agent-deploy.log"

# Version information
AGENT_VERSION="1.0.0"
DEPLOYMENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

################################################################################
# Logging Functions
################################################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1" | tee -a "${LOG_FILE}"
}

################################################################################
# Platform Detection
################################################################################

detect_platform() {
    log_step "Detecting platform..."
    
    OS_TYPE=$(uname -s)
    OS_ARCH=$(uname -m)
    
    case "${OS_TYPE}" in
        Linux*)
            PLATFORM="linux"
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                DISTRO="${ID}"
                DISTRO_VERSION="${VERSION_ID}"
                log_info "Detected: ${PRETTY_NAME}"
            else
                DISTRO="unknown"
                DISTRO_VERSION="unknown"
            fi
            ;;
        Darwin*)
            PLATFORM="macos"
            DISTRO="macos"
            DISTRO_VERSION=$(sw_vers -productVersion)
            log_info "Detected: macOS ${DISTRO_VERSION}"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            PLATFORM="windows"
            DISTRO="windows"
            DISTRO_VERSION=$(cmd.exe /c ver 2>/dev/null | grep -oP '\d+\.\d+\.\d+')
            log_info "Detected: Windows ${DISTRO_VERSION} (via ${OS_TYPE})"
            ;;
        *)
            log_error "Unsupported platform: ${OS_TYPE}"
            exit 1
            ;;
    esac
    
    log_info "Platform: ${PLATFORM}, Architecture: ${OS_ARCH}"
}

################################################################################
# Dependency Checks
################################################################################

check_dependencies() {
    log_step "Checking dependencies..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    else
        NODE_VERSION=$(node --version)
        log_info "Node.js: ${NODE_VERSION}"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        NPM_VERSION=$(npm --version)
        log_info "npm: ${NPM_VERSION}"
    fi
    
    # Check TypeScript (install if missing)
    if ! command -v tsc &> /dev/null; then
        log_warn "TypeScript not found, will install globally"
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again"
        exit 1
    fi
    
    log_info "All required dependencies found"
}

################################################################################
# Install TypeScript Dependencies
################################################################################

install_typescript() {
    log_step "Installing TypeScript globally..."
    
    if ! command -v tsc &> /dev/null; then
        npm install -g typescript ts-node
        log_info "TypeScript installed successfully"
    else
        log_info "TypeScript already installed: $(tsc --version)"
    fi
}

################################################################################
# Build Agent
################################################################################

build_agent() {
    log_step "Building CMDB Agent..."
    
    cd "${AGENT_DIR}"
    
    # Install dependencies
    log_info "Installing npm dependencies..."
    npm install
    
    # Compile TypeScript
    log_info "Compiling TypeScript..."
    npm run build || {
        log_error "Build failed"
        exit 1
    }
    
    log_info "Agent built successfully"
    
    cd "${PROJECT_ROOT}"
}

################################################################################
# Package Agent
################################################################################

package_agent() {
    log_step "Packaging agent for ${PLATFORM}..."
    
    local PACKAGE_DIR="${PROJECT_ROOT}/packages"
    mkdir -p "${PACKAGE_DIR}"
    
    case "${PLATFORM}" in
        linux)
            package_linux
            ;;
        windows)
            package_windows
            ;;
        macos)
            package_macos
            ;;
    esac
    
    log_info "Agent packaged successfully"
}

package_linux() {
    local PACKAGE_NAME="cmdb-agent-${AGENT_VERSION}-${OS_ARCH}.tar.gz"
    local PACKAGE_PATH="${PROJECT_ROOT}/packages/${PACKAGE_NAME}"
    
    log_info "Creating Linux package: ${PACKAGE_NAME}"
    
    # Create temporary package directory
    local TEMP_DIR=$(mktemp -d)
    local PKG_ROOT="${TEMP_DIR}/cmdb-agent"
    
    mkdir -p "${PKG_ROOT}/bin"
    mkdir -p "${PKG_ROOT}/config"
    mkdir -p "${PKG_ROOT}/systemd"
    
    # Copy binaries
    cp -r "${BUILD_DIR}"/* "${PKG_ROOT}/bin/"
    cp -r "${AGENT_DIR}/node_modules" "${PKG_ROOT}/"
    
    # Copy configuration
    cat > "${PKG_ROOT}/config/agent.conf" <<EOF
# CMDB Agent Configuration
CMDB_API_URL=http://localhost:3000
AGENT_ENVIRONMENT=production
SCAN_INTERVAL_MINUTES=5
AUTO_DISCOVERY_ENABLED=true
AUTO_UPDATE=true
AGENT_VERSION=${AGENT_VERSION}
EOF
    
    # Create systemd service file
    cat > "${PKG_ROOT}/systemd/cmdb-agent.service" <<EOF
[Unit]
Description=IAC Dharma CMDB Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/iac-dharma/cmdb-agent
EnvironmentFile=/opt/iac-dharma/cmdb-agent/config/agent.conf
ExecStart=/usr/bin/node /opt/iac-dharma/cmdb-agent/bin/index.js --service
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Create install script
    cat > "${PKG_ROOT}/install.sh" <<'EOF'
#!/bin/bash
set -e

echo "Installing IAC Dharma CMDB Agent..."

# Create installation directory
sudo mkdir -p /opt/iac-dharma/cmdb-agent
sudo cp -r bin config node_modules /opt/iac-dharma/cmdb-agent/

# Install systemd service
sudo cp systemd/cmdb-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cmdb-agent
sudo systemctl start cmdb-agent

echo "CMDB Agent installed successfully"
echo "Status: sudo systemctl status cmdb-agent"
EOF
    
    chmod +x "${PKG_ROOT}/install.sh"
    
    # Create tarball
    cd "${TEMP_DIR}"
    tar -czf "${PACKAGE_PATH}" cmdb-agent/
    
    # Cleanup
    rm -rf "${TEMP_DIR}"
    
    log_info "Linux package created: ${PACKAGE_PATH}"
}

package_windows() {
    log_info "Creating Windows package..."
    log_warn "Windows MSI packaging requires WiX Toolset"
    log_warn "Manual packaging recommended for Windows deployment"
    
    # Create basic zip package
    local PACKAGE_NAME="cmdb-agent-${AGENT_VERSION}-windows-${OS_ARCH}.zip"
    local PACKAGE_PATH="${PROJECT_ROOT}/packages/${PACKAGE_NAME}"
    
    cd "${BUILD_DIR}"
    zip -r "${PACKAGE_PATH}" . -x "*.map"
    
    log_info "Windows package created: ${PACKAGE_PATH}"
}

package_macos() {
    log_info "Creating macOS package..."
    
    local PACKAGE_NAME="cmdb-agent-${AGENT_VERSION}-macos-${OS_ARCH}.pkg"
    local PACKAGE_PATH="${PROJECT_ROOT}/packages/${PACKAGE_NAME}"
    
    log_warn "macOS PKG packaging requires pkgbuild/productbuild"
    log_warn "Creating tarball instead"
    
    local TARBALL_NAME="cmdb-agent-${AGENT_VERSION}-macos-${OS_ARCH}.tar.gz"
    local TARBALL_PATH="${PROJECT_ROOT}/packages/${TARBALL_NAME}"
    
    cd "${BUILD_DIR}"
    tar -czf "${TARBALL_PATH}" .
    
    log_info "macOS package created: ${TARBALL_PATH}"
}

################################################################################
# Install Agent Locally
################################################################################

install_agent() {
    log_step "Installing agent locally..."
    
    # Check if running as root/sudo for system-wide install
    if [ "$EUID" -ne 0 ]; then
        log_warn "Not running as root. Will install to user directory."
        INSTALL_DIR="${HOME}/.local/share/iac-dharma/cmdb-agent"
    fi
    
    # Create installation directory
    sudo mkdir -p "${INSTALL_DIR}" 2>/dev/null || mkdir -p "${INSTALL_DIR}"
    
    # Copy files
    log_info "Copying agent files to ${INSTALL_DIR}..."
    sudo cp -r "${BUILD_DIR}"/* "${INSTALL_DIR}/" 2>/dev/null || cp -r "${BUILD_DIR}"/* "${INSTALL_DIR}/"
    sudo cp -r "${AGENT_DIR}/node_modules" "${INSTALL_DIR}/" 2>/dev/null || cp -r "${AGENT_DIR}/node_modules" "${INSTALL_DIR}/"
    
    # Create configuration
    create_config
    
    # Install service
    install_service
    
    log_info "Agent installed successfully to ${INSTALL_DIR}"
}

create_config() {
    log_info "Creating configuration file..."
    
    local CONFIG_FILE="${INSTALL_DIR}/config.json"
    
    cat > "${CONFIG_FILE}" <<EOF
{
  "version": "${AGENT_VERSION}",
  "agentName": "$(hostname)",
  "organizationId": "default",
  "apiServerUrl": "http://localhost:3000",
  "autoUpdate": true,
  "updateCheckIntervalHours": 24,
  "monitoring": {
    "processes": true,
    "registry": true,
    "usb": true,
    "network": true,
    "filesystem": true
  },
  "telemetry": {
    "batchSize": 100,
    "flushIntervalSeconds": 60
  }
}
EOF
    
    log_info "Configuration created: ${CONFIG_FILE}"
}

install_service() {
    log_step "Installing system service..."
    
    case "${PLATFORM}" in
        linux)
            install_systemd_service
            ;;
        macos)
            install_launchd_service
            ;;
        windows)
            install_windows_service
            ;;
    esac
}

install_systemd_service() {
    if [ "$EUID" -ne 0 ]; then
        log_warn "Root privileges required for systemd service installation"
        log_warn "Skipping service installation. Run with sudo to install service."
        return
    fi
    
    log_info "Installing systemd service..."
    
    cat > /etc/systemd/system/cmdb-agent.service <<EOF
[Unit]
Description=IAC Dharma CMDB Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
Environment="AGENT_INSTALL_PATH=${INSTALL_DIR}"
Environment="AGENT_VERSION=${AGENT_VERSION}"
ExecStart=/usr/bin/node ${INSTALL_DIR}/index.js --service
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable cmdb-agent
    
    log_info "Systemd service installed"
    log_info "Start with: sudo systemctl start cmdb-agent"
}

install_launchd_service() {
    if [ "$EUID" -ne 0 ]; then
        log_warn "Root privileges required for launchd service installation"
        return
    fi
    
    log_info "Installing launchd service..."
    
    cat > /Library/LaunchDaemons/com.iacdharma.cmdb-agent.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.iacdharma.cmdb-agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${INSTALL_DIR}/index.js</string>
        <string>--service</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/cmdb-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/cmdb-agent-error.log</string>
</dict>
</plist>
EOF
    
    launchctl load /Library/LaunchDaemons/com.iacdharma.cmdb-agent.plist
    
    log_info "Launchd service installed"
}

install_windows_service() {
    log_warn "Windows service installation requires node-windows package"
    log_warn "Please use the Windows installer or install manually"
}

################################################################################
# Deploy Default Policies
################################################################################

deploy_policies() {
    log_step "Deploying default security policies..."
    
    local POLICY_DIR="${INSTALL_DIR}/policies"
    mkdir -p "${POLICY_DIR}"
    
    # Policies are embedded in the agent code (DefaultPolicies.ts)
    # This creates a backup/reference file
    
    cat > "${POLICY_DIR}/default-policies.json" <<'EOF'
{
  "policies": [
    {
      "id": "block-suspicious-processes",
      "name": "Block Suspicious Processes",
      "description": "Blocks processes with suspicious command-line patterns",
      "enabled": true,
      "severity": "high",
      "category": "process",
      "conditions": [
        {
          "field": "process.commandLine",
          "operator": "matches_regex",
          "value": "(iex\\s+\\(|downloadstring|frombase64|-encodedcommand)"
        }
      ],
      "conditionLogic": "OR",
      "actions": [
        { "type": "kill_process" },
        { "type": "alert" },
        { "type": "log" }
      ],
      "cooldownSeconds": 60
    },
    {
      "id": "block-unauthorized-usb",
      "name": "Block Unauthorized USB Devices",
      "description": "Blocks USB devices not in whitelist",
      "enabled": true,
      "severity": "medium",
      "category": "usb",
      "conditions": [
        {
          "field": "device.vendorId",
          "operator": "not_in_list",
          "value": ["0x046d", "0x045e"]
        }
      ],
      "conditionLogic": "AND",
      "actions": [
        { "type": "block_usb" },
        { "type": "alert" },
        { "type": "log" }
      ],
      "cooldownSeconds": 300
    }
  ]
}
EOF
    
    log_info "Default policies deployed to ${POLICY_DIR}"
}

################################################################################
# Test Installation
################################################################################

test_installation() {
    log_step "Testing installation..."
    
    # Test agent executable
    if [ -f "${INSTALL_DIR}/index.js" ]; then
        log_info "✓ Agent executable found"
    else
        log_error "✗ Agent executable not found"
        return 1
    fi
    
    # Test configuration
    if [ -f "${INSTALL_DIR}/config.json" ]; then
        log_info "✓ Configuration file found"
    else
        log_warn "✗ Configuration file not found"
    fi
    
    # Test dependencies
    if [ -d "${INSTALL_DIR}/node_modules" ]; then
        log_info "✓ Node modules found"
    else
        log_error "✗ Node modules not found"
        return 1
    fi
    
    log_info "Installation test passed"
}

################################################################################
# Cleanup
################################################################################

cleanup() {
    log_step "Cleaning up temporary files..."
    
    # Remove build artifacts if requested
    if [ "${CLEAN_BUILD:-false}" = "true" ]; then
        rm -rf "${BUILD_DIR}"
        log_info "Build directory cleaned"
    fi
}

################################################################################
# Main Deployment Flow
################################################################################

print_banner() {
    cat <<'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          IAC Dharma CMDB Agent Deployment Script              ║
║                                                                ║
║   Copyright © 2024-2025 Raghavendra Deshpande                 ║
║   All Rights Reserved                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
    echo
}

print_summary() {
    echo
    log_info "════════════════════════════════════════════════════════"
    log_info "  Deployment Summary"
    log_info "════════════════════════════════════════════════════════"
    log_info "Platform:        ${PLATFORM} (${OS_ARCH})"
    log_info "Agent Version:   ${AGENT_VERSION}"
    log_info "Install Path:    ${INSTALL_DIR}"
    log_info "Deployment Date: ${DEPLOYMENT_DATE}"
    log_info "Log File:        ${LOG_FILE}"
    log_info "════════════════════════════════════════════════════════"
    echo
    
    if [ "${PLATFORM}" = "linux" ] && [ "$EUID" -eq 0 ]; then
        log_info "Start agent: sudo systemctl start cmdb-agent"
        log_info "Check status: sudo systemctl status cmdb-agent"
        log_info "View logs: journalctl -u cmdb-agent -f"
    else
        log_info "Start agent: node ${INSTALL_DIR}/index.js"
        log_info "Check status: curl http://localhost:9000/health"
    fi
    
    echo
}

main() {
    print_banner
    
    log_info "Starting CMDB Agent deployment..."
    log_info "Timestamp: ${DEPLOYMENT_DATE}"
    
    # Pre-flight checks
    detect_platform
    check_dependencies
    
    # Build and package
    install_typescript
    build_agent
    package_agent
    
    # Install
    install_agent
    deploy_policies
    
    # Validation
    test_installation
    
    # Cleanup
    cleanup
    
    # Summary
    print_summary
    
    log_info "Deployment completed successfully!"
}

################################################################################
# Script Entry Point
################################################################################

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --install-dir)
            INSTALL_DIR="$2"
            shift 2
            ;;
        --skip-service)
            SKIP_SERVICE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo
            echo "Options:"
            echo "  --clean              Clean build directory after deployment"
            echo "  --install-dir PATH   Custom installation directory"
            echo "  --skip-service       Skip service installation"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main deployment
main
