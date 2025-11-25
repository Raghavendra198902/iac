#!/bin/bash
# CMDB Agent Installation Script for IaC Deployment
# Supports: Ubuntu, Debian, RHEL, CentOS, Amazon Linux

set -e

# Parameters from Terraform template
CMDB_SERVER_URL="${cmdb_server_url}"
CMDB_API_KEY="${cmdb_api_key}"
AGENT_VERSION="${agent_version}"
AUTO_UPDATE="${auto_update}"
ENVIRONMENT="${environment}"
COLLECTION_INTERVAL="${collection_interval}"

# Logging
exec 1> >(tee -a /var/log/cmdb-agent-install.log)
exec 2>&1

echo "========================================"
echo "CMDB Agent Installation"
echo "Version: $AGENT_VERSION"
echo "Environment: $ENVIRONMENT"
echo "========================================"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "Cannot detect OS version"
    exit 1
fi

echo "Detected OS: $OS $VERSION"

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    
    case $OS in
        ubuntu|debian)
            export DEBIAN_FRONTEND=noninteractive
            apt-get update
            apt-get install -y curl wget gnupg2 ca-certificates lsb-release
            
            # Install Node.js 18.x
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
            ;;
            
        rhel|centos|fedora|amzn)
            yum install -y curl wget
            
            # Install Node.js 18.x
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            yum install -y nodejs
            ;;
            
        *)
            echo "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
}

# Download and install agent
install_agent() {
    echo "Downloading CMDB agent..."
    
    # Determine package type
    case $OS in
        ubuntu|debian)
            PACKAGE_TYPE="deb"
            PACKAGE_URL="$CMDB_SERVER_URL/api/updates/download/linux-x64-$AGENT_VERSION"
            PACKAGE_FILE="/tmp/cmdb-agent_${AGENT_VERSION}_amd64.deb"
            ;;
            
        rhel|centos|fedora|amzn)
            PACKAGE_TYPE="rpm"
            PACKAGE_URL="$CMDB_SERVER_URL/api/updates/download/linux-x64-$AGENT_VERSION"
            PACKAGE_FILE="/tmp/cmdb-agent-${AGENT_VERSION}-1.x86_64.rpm"
            ;;
    esac
    
    # Download package
    curl -H "Authorization: Bearer $CMDB_API_KEY" \
         -o "$PACKAGE_FILE" \
         "$PACKAGE_URL"
    
    # Install package
    echo "Installing CMDB agent..."
    case $PACKAGE_TYPE in
        deb)
            dpkg -i "$PACKAGE_FILE" || apt-get -f install -y
            ;;
        rpm)
            rpm -ivh "$PACKAGE_FILE"
            ;;
    esac
    
    # Clean up
    rm -f "$PACKAGE_FILE"
}

# Configure agent
configure_agent() {
    echo "Configuring CMDB agent..."
    
    # Create configuration directory
    mkdir -p /etc/cmdb-agent
    
    # Generate agent ID (hostname-based)
    AGENT_ID="$(hostname)-$(date +%s)"
    
    # Create configuration file
    cat > /etc/cmdb-agent/config.json << EOF
{
  "version": "$AGENT_VERSION",
  "agentId": "$AGENT_ID",
  "agentName": "$(hostname)",
  "environment": "$ENVIRONMENT",
  "organizationId": "terraform-deployed",
  "apiServerUrl": "$CMDB_SERVER_URL",
  "autoUpdate": $AUTO_UPDATE,
  "updateCheckIntervalHours": 1,
  "monitoring": {
    "processes": true,
    "registry": $([ "$OS" = "windows" ] && echo "true" || echo "false"),
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
    
    # Create environment file
    cat > /etc/cmdb-agent/environment << EOF
CMDB_SERVER_URL=$CMDB_SERVER_URL
CMDB_API_KEY=$CMDB_API_KEY
AGENT_VERSION=$AGENT_VERSION
AUTO_UPDATE=$AUTO_UPDATE
AGENT_ENVIRONMENT=$ENVIRONMENT
COLLECTION_INTERVAL=$COLLECTION_INTERVAL
UPDATE_CHECK_INTERVAL_MS=3600000
NODE_ENV=production
EOF
    
    # Secure the files
    chmod 600 /etc/cmdb-agent/config.json
    chmod 600 /etc/cmdb-agent/environment
    
    echo "Configuration created"
}

# Create systemd service
create_service() {
    echo "Creating systemd service..."
    
    cat > /etc/systemd/system/cmdb-agent.service << 'EOF'
[Unit]
Description=CMDB Agent - Infrastructure Monitoring and Configuration Management
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
EnvironmentFile=/etc/cmdb-agent/environment
WorkingDirectory=/usr/local/bin
ExecStart=/usr/local/bin/cmdb-agent
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cmdb-agent

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

# Security
NoNewPrivileges=false
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log /var/lib/cmdb-agent

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    systemctl daemon-reload
    
    echo "Service created"
}

# Start and enable service
start_service() {
    echo "Starting CMDB agent service..."
    
    systemctl enable cmdb-agent
    systemctl start cmdb-agent
    
    # Wait for service to start
    sleep 5
    
    # Check status
    if systemctl is-active --quiet cmdb-agent; then
        echo "✅ CMDB agent is running"
        systemctl status cmdb-agent --no-pager
    else
        echo "❌ CMDB agent failed to start"
        journalctl -u cmdb-agent -n 50 --no-pager
        exit 1
    fi
}

# Verify installation
verify_installation() {
    echo "Verifying installation..."
    
    # Check if agent is responding
    local max_attempts=10
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf http://localhost:3000/health > /dev/null; then
            echo "✅ Health check passed"
            curl -s http://localhost:3000/health | python3 -m json.tool || cat
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "Waiting for agent to be ready... ($attempt/$max_attempts)"
        sleep 3
    done
    
    echo "⚠️  Agent not responding to health checks"
    return 1
}

# Register with CMDB server
register_agent() {
    echo "Registering agent with CMDB server..."
    
    # Get instance metadata (cloud-specific)
    INSTANCE_ID="unknown"
    INSTANCE_TYPE="unknown"
    REGION="unknown"
    CLOUD_PROVIDER="unknown"
    
    # Try AWS metadata
    if curl -sf --connect-timeout 1 http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
        CLOUD_PROVIDER="aws"
        INSTANCE_ID=$(curl -sf http://169.254.169.254/latest/meta-data/instance-id)
        INSTANCE_TYPE=$(curl -sf http://169.254.169.254/latest/meta-data/instance-type)
        REGION=$(curl -sf http://169.254.169.254/latest/meta-data/placement/region)
    
    # Try Azure metadata
    elif curl -sf -H "Metadata:true" --connect-timeout 1 "http://169.254.169.254/metadata/instance?api-version=2021-02-01" > /dev/null 2>&1; then
        CLOUD_PROVIDER="azure"
        METADATA=$(curl -sf -H "Metadata:true" "http://169.254.169.254/metadata/instance?api-version=2021-02-01")
        INSTANCE_ID=$(echo "$METADATA" | python3 -c "import sys, json; print(json.load(sys.stdin)['compute']['vmId'])" 2>/dev/null || echo "unknown")
        INSTANCE_TYPE=$(echo "$METADATA" | python3 -c "import sys, json; print(json.load(sys.stdin)['compute']['vmSize'])" 2>/dev/null || echo "unknown")
        REGION=$(echo "$METADATA" | python3 -c "import sys, json; print(json.load(sys.stdin)['compute']['location'])" 2>/dev/null || echo "unknown")
    
    # Try GCP metadata
    elif curl -sf -H "Metadata-Flavor: Google" --connect-timeout 1 http://metadata.google.internal/computeMetadata/v1/ > /dev/null 2>&1; then
        CLOUD_PROVIDER="gcp"
        INSTANCE_ID=$(curl -sf -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/id)
        INSTANCE_TYPE=$(curl -sf -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/machine-type | cut -d'/' -f4)
        REGION=$(curl -sf -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/zone | cut -d'/' -f4)
    fi
    
    echo "Cloud Provider: $CLOUD_PROVIDER"
    echo "Instance ID: $INSTANCE_ID"
    echo "Instance Type: $INSTANCE_TYPE"
    echo "Region: $REGION"
    
    # Registration payload
    cat > /tmp/registration.json << EOF
{
  "agentId": "$(hostname)-$(date +%s)",
  "hostname": "$(hostname)",
  "environment": "$ENVIRONMENT",
  "cloudProvider": "$CLOUD_PROVIDER",
  "instanceId": "$INSTANCE_ID",
  "instanceType": "$INSTANCE_TYPE",
  "region": "$REGION",
  "os": "$OS",
  "osVersion": "$VERSION",
  "agentVersion": "$AGENT_VERSION",
  "autoUpdate": $AUTO_UPDATE,
  "deployedBy": "terraform",
  "tags": {
    "environment": "$ENVIRONMENT",
    "managed": "terraform",
    "auto_update": "$AUTO_UPDATE"
  }
}
EOF
    
    # Send registration
    if curl -sf -X POST \
        -H "Authorization: Bearer $CMDB_API_KEY" \
        -H "Content-Type: application/json" \
        -d @/tmp/registration.json \
        "$CMDB_SERVER_URL/api/agents/register" > /dev/null; then
        echo "✅ Agent registered successfully"
    else
        echo "⚠️  Agent registration failed (agent will retry automatically)"
    fi
    
    rm -f /tmp/registration.json
}

# Main installation flow
main() {
    echo "Starting CMDB agent installation..."
    
    install_dependencies
    install_agent
    configure_agent
    create_service
    start_service
    verify_installation
    register_agent
    
    echo ""
    echo "========================================"
    echo "✅ CMDB Agent Installation Complete!"
    echo "========================================"
    echo "Agent ID: $(hostname)-$(date +%s)"
    echo "Version: $AGENT_VERSION"
    echo "Status: systemctl status cmdb-agent"
    echo "Logs: journalctl -u cmdb-agent -f"
    echo "Health: curl http://localhost:3000/health"
    echo "========================================"
}

# Run installation
main
