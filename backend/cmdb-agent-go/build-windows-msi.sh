#!/bin/bash
set -e

# Build Windows MSI installer for CMDB Agent
# Requires: wixl (from msitools package)
# Install: sudo apt-get install msitools

VERSION=${1:-1.0.0}
ARCH=${2:-x64}

echo "Building Windows MSI installer v${VERSION} for ${ARCH}..."

# Check if wixl is installed
if ! command -v wixl &> /dev/null; then
    echo "Error: wixl not found. Install msitools:"
    echo "  sudo apt-get install msitools"
    exit 1
fi

# Build Windows binaries if not exist
if [ ! -f "dist/cmdb-agent-windows-amd64.exe" ]; then
    echo "Building Windows binaries..."
    make build-windows
fi

# Create temporary directory structure
TEMP_DIR="dist/msi-build"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy files
cp dist/cmdb-agent-windows-amd64.exe "$TEMP_DIR/cmdb-agent.exe"
cp dist/cmdb-agent-cli-windows-amd64.exe "$TEMP_DIR/cmdb-agent-cli.exe"
cp config.example.yaml "$TEMP_DIR/config.yaml"
cp install-windows.ps1 "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"

# Create WiX source file
cat > "$TEMP_DIR/cmdb-agent.wxs" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" 
           Name="CMDB Agent" 
           Language="1033" 
           Version="1.0.0" 
           Manufacturer="Infrastructure as Code Platform" 
           UpgradeCode="12345678-1234-1234-1234-123456789ABC">
    
    <Package InstallerVersion="200" 
             Compressed="yes" 
             InstallScope="perMachine" 
             Description="CMDB Agent for Windows - Unified configuration item collection and policy enforcement"
             Comments="Visit https://github.com/Raghavendra198902/iac for more information" />

    <MajorUpgrade DowngradeErrorMessage="A newer version of CMDB Agent is already installed." />
    <MediaTemplate EmbedCab="yes" />

    <Feature Id="ProductFeature" Title="CMDB Agent" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
      <ComponentRef Id="EnvironmentPath" />
    </Feature>

    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFiles64Folder">
        <Directory Id="INSTALLFOLDER" Name="CMDB Agent">
          <Component Id="MainExecutable" Guid="12345678-1234-1234-1234-123456789ABD">
            <File Id="AgentExe" 
                  Source="cmdb-agent.exe" 
                  KeyPath="yes" 
                  Checksum="yes">
              <Shortcut Id="StartMenuShortcut"
                        Directory="ProgramMenuDir"
                        Name="CMDB Agent"
                        WorkingDirectory="INSTALLFOLDER"
                        Icon="AgentIcon.exe"
                        IconIndex="0"
                        Advertise="yes" />
            </File>
          </Component>

          <Component Id="CLIExecutable" Guid="12345678-1234-1234-1234-123456789ABE">
            <File Id="CLIExe" Source="cmdb-agent-cli.exe" KeyPath="yes" Checksum="yes" />
          </Component>

          <Component Id="ConfigFile" Guid="12345678-1234-1234-1234-123456789ABF">
            <File Id="ConfigYaml" Source="config.yaml" KeyPath="yes" />
          </Component>

          <Component Id="InstallScript" Guid="12345678-1234-1234-1234-123456789AC0">
            <File Id="InstallPS1" Source="install-windows.ps1" KeyPath="yes" />
          </Component>

          <Component Id="Documentation" Guid="12345678-1234-1234-1234-123456789AC1">
            <File Id="ReadmeMd" Source="README.md" KeyPath="yes" />
          </Component>
        </Directory>
      </Directory>

      <Directory Id="ProgramMenuFolder">
        <Directory Id="ProgramMenuDir" Name="CMDB Agent">
          <Component Id="ProgramMenuFolder" Guid="12345678-1234-1234-1234-123456789AC2">
            <RemoveFolder Id="ProgramMenuDir" On="uninstall" />
            <RegistryValue Root="HKCU" 
                          Key="Software\CMDBAgent" 
                          Name="installed" 
                          Type="integer" 
                          Value="1" 
                          KeyPath="yes" />
          </Component>
        </Directory>
      </Directory>
    </Directory>

    <!-- Add to PATH -->
    <Component Id="EnvironmentPath" Guid="12345678-1234-1234-1234-123456789AC3" Directory="INSTALLFOLDER">
      <Environment Id="PATH" 
                   Name="PATH" 
                   Value="[INSTALLFOLDER]" 
                   Permanent="no" 
                   Part="last" 
                   Action="set" 
                   System="yes" />
      <RegistryValue Root="HKLM" 
                     Key="Software\CMDBAgent" 
                     Name="InstallPath" 
                     Type="string" 
                     Value="[INSTALLFOLDER]" 
                     KeyPath="yes" />
    </Component>

    <ComponentGroup Id="ProductComponents">
      <ComponentRef Id="MainExecutable" />
      <ComponentRef Id="CLIExecutable" />
      <ComponentRef Id="ConfigFile" />
      <ComponentRef Id="InstallScript" />
      <ComponentRef Id="Documentation" />
      <ComponentRef Id="ProgramMenuFolder" />
    </ComponentGroup>

    <Icon Id="AgentIcon.exe" SourceFile="cmdb-agent.exe" />
    <Property Id="ARPPRODUCTICON" Value="AgentIcon.exe" />
    
    <!-- UI -->
    <UIRef Id="WixUI_InstallDir" />
    <Property Id="WIXUI_INSTALLDIR" Value="INSTALLFOLDER" />
    
    <!-- License -->
    <WixVariable Id="WixUILicenseRtf" Value="license.rtf" />
  </Product>
</Wix>
EOF

# Update version in WiX file
sed -i "s/Version=\"1.0.0\"/Version=\"${VERSION}\"/" "$TEMP_DIR/cmdb-agent.wxs"

# Create simple license file
cat > "$TEMP_DIR/license.rtf" << 'EOF'
{\rtf1\ansi\deff0
{\fonttbl{\f0 Times New Roman;}}
\f0\fs24
CMDB Agent License Agreement

Copyright (c) 2025 Infrastructure as Code Platform

Permission is hereby granted to use this software for configuration management and monitoring purposes.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
}
EOF

# Build MSI using wixl
echo "Compiling MSI package..."
cd "$TEMP_DIR"
wixl -v -o "../cmdb-agent-${VERSION}-${ARCH}.msi" cmdb-agent.wxs

cd ../../
echo ""
echo "✅ MSI package created successfully!"
echo "📦 Output: dist/cmdb-agent-${VERSION}-${ARCH}.msi"
ls -lh "dist/cmdb-agent-${VERSION}-${ARCH}.msi"
echo ""
echo "Installation:"
echo "  msiexec /i cmdb-agent-${VERSION}-${ARCH}.msi"
echo ""
echo "Silent installation:"
echo "  msiexec /i cmdb-agent-${VERSION}-${ARCH}.msi /qn"
