# Building Platform-Specific Packages

Complete guide to building installable packages for all platforms with auto-update support.

## 📦 Package Formats

| Platform | Package Format | Tool | Auto-Update |
|----------|---------------|------|-------------|
| **Windows** | `.msi` | WiX Toolset | ✅ Yes |
| **macOS** | `.pkg` / `.dmg` | pkgbuild | ✅ Yes |
| **Linux (Debian)** | `.deb` | dpkg-deb | ✅ Yes |
| **Linux (RHEL)** | `.rpm` | rpmbuild | ✅ Yes |
| **Android** | `.apk` | Android SDK | ✅ Yes |
| **iOS** | `.ipa` | Xcode | ✅ Yes (via MDM) |

## 🪟 Windows MSI Package

### Prerequisites
```powershell
# Install WiX Toolset
choco install wixtoolset

# Or download from
# https://wixtoolset.org/releases/
```

### Build MSI
```powershell
# Build with PowerShell script
.\build-msi.ps1 -Version "1.0.0"

# Or manual build
cd backend/cmdb-agent

# Build application
npm run build
npm run build:exe

# Compile WiX
candle.exe -out dist\installer.wixobj -arch x64 installer.wxs

# Link MSI
light.exe -out dist\CMDBAgent-1.0.0-x64.msi -ext WixUIExtension dist\installer.wixobj
```

### Install MSI
```powershell
# Interactive install
msiexec /i CMDBAgent-1.0.0-x64.msi

# Silent install
msiexec /i CMDBAgent-1.0.0-x64.msi /qn

# Silent install with configuration
msiexec /i CMDBAgent-1.0.0-x64.msi /qn ^
  CMDB_SERVER_URL="http://your-server:3001" ^
  CMDB_API_KEY="your-api-key" ^
  COLLECTION_INTERVAL="300000"
```

### MSI Features
- ✅ GUI installer with configuration wizard
- ✅ Silent installation support
- ✅ Windows Service installation
- ✅ Registry configuration
- ✅ Environment variables setup
- ✅ Add to PATH
- ✅ Start Menu shortcuts
- ✅ Automatic upgrades
- ✅ Clean uninstall

## 🍎 macOS PKG Package

### Prerequisites
```bash
# macOS command line tools (included)
xcode-select --install
```

### Build PKG
```bash
#!/bin/bash
# build-macos-pkg.sh

VERSION="1.0.0"
APP_NAME="CMDB Agent"
IDENTIFIER="com.iacdharma.cmdb-agent"

# Build application
npm run build
npm run build:macos

# Create package structure
mkdir -p pkg_root/usr/local/bin
mkdir -p pkg_root/Library/LaunchDaemons
mkdir -p pkg_root/Applications

# Copy files
cp dist/cmdb-agent-macos pkg_root/usr/local/bin/cmdb-agent
cp com.iacdharma.cmdb-agent.plist pkg_root/Library/LaunchDaemons/

# Build package
pkgbuild \
  --root pkg_root \
  --identifier "$IDENTIFIER" \
  --version "$VERSION" \
  --install-location / \
  --scripts scripts/macos \
  "dist/CMDBAgent-$VERSION.pkg"

# Create DMG (optional)
hdiutil create -volname "$APP_NAME" \
  -srcfolder "dist/CMDBAgent-$VERSION.pkg" \
  -ov -format UDZO \
  "dist/CMDBAgent-$VERSION.dmg"
```

### Install PKG
```bash
# Interactive install
sudo installer -pkg CMDBAgent-1.0.0.pkg -target /

# Or double-click the .pkg file
```

## 🐧 Linux DEB Package (Debian/Ubuntu)

### Build DEB
```bash
#!/bin/bash
# build-deb.sh

VERSION="1.0.0"
ARCH="amd64"
PKG_NAME="cmdb-agent"

# Create directory structure
mkdir -p "$PKG_NAME/DEBIAN"
mkdir -p "$PKG_NAME/usr/local/bin"
mkdir -p "$PKG_NAME/etc/systemd/system"
mkdir -p "$PKG_NAME/etc/cmdb-agent"

# Build application
npm run build
npm run build:linux

# Copy files
cp dist/cmdb-agent-linux "$PKG_NAME/usr/local/bin/cmdb-agent"
cp cmdb-agent.service "$PKG_NAME/etc/systemd/system/"
cp config.example.json "$PKG_NAME/etc/cmdb-agent/"

# Set permissions
chmod 755 "$PKG_NAME/usr/local/bin/cmdb-agent"

# Create control file
cat > "$PKG_NAME/DEBIAN/control" << EOF
Package: $PKG_NAME
Version: $VERSION
Section: admin
Priority: optional
Architecture: $ARCH
Depends: nodejs (>= 18.0.0)
Maintainer: IAC Dharma <support@iacdharma.com>
Description: CMDB Agent for system monitoring
 Monitors system resources and reports to CMDB server.
 Supports auto-update and configuration management.
EOF

# Create postinst script
cat > "$PKG_NAME/DEBIAN/postinst" << 'EOF'
#!/bin/bash
set -e

# Enable and start service
systemctl daemon-reload
systemctl enable cmdb-agent
systemctl start cmdb-agent

echo "CMDB Agent installed successfully"
EOF

chmod 755 "$PKG_NAME/DEBIAN/postinst"

# Create prerm script
cat > "$PKG_NAME/DEBIAN/prerm" << 'EOF'
#!/bin/bash
set -e

# Stop and disable service
systemctl stop cmdb-agent
systemctl disable cmdb-agent

EOF

chmod 755 "$PKG_NAME/DEBIAN/prerm"

# Build package
dpkg-deb --build "$PKG_NAME"
mv "$PKG_NAME.deb" "dist/cmdb-agent_${VERSION}_${ARCH}.deb"
```

### Install DEB
```bash
# Install
sudo dpkg -i cmdb-agent_1.0.0_amd64.deb

# Configure
sudo nano /etc/cmdb-agent/config.json

# Restart
sudo systemctl restart cmdb-agent
```

## 🎩 Linux RPM Package (RHEL/CentOS/Fedora)

### Build RPM
```bash
#!/bin/bash
# build-rpm.sh

VERSION="1.0.0"
RELEASE="1"

# Create RPM build structure
mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

# Build application
npm run build
npm run build:linux

# Create tarball
tar -czf ~/rpmbuild/SOURCES/cmdb-agent-${VERSION}.tar.gz dist/

# Create spec file
cat > ~/rpmbuild/SPECS/cmdb-agent.spec << EOF
Name:           cmdb-agent
Version:        ${VERSION}
Release:        ${RELEASE}%{?dist}
Summary:        CMDB Agent for system monitoring

License:        MIT
URL:            https://github.com/iacdharma/cmdb-agent
Source0:        %{name}-%{version}.tar.gz

Requires:       nodejs >= 18.0.0
BuildArch:      x86_64

%description
Monitors system resources and reports to CMDB server.
Supports auto-update and configuration management.

%prep
%setup -q

%build
# Already built

%install
mkdir -p %{buildroot}/usr/local/bin
mkdir -p %{buildroot}/etc/systemd/system
mkdir -p %{buildroot}/etc/cmdb-agent

install -m 755 dist/cmdb-agent-linux %{buildroot}/usr/local/bin/cmdb-agent
install -m 644 cmdb-agent.service %{buildroot}/etc/systemd/system/
install -m 644 config.example.json %{buildroot}/etc/cmdb-agent/

%post
systemctl daemon-reload
systemctl enable cmdb-agent
systemctl start cmdb-agent

%preun
if [ \$1 -eq 0 ]; then
    systemctl stop cmdb-agent
    systemctl disable cmdb-agent
fi

%files
/usr/local/bin/cmdb-agent
/etc/systemd/system/cmdb-agent.service
/etc/cmdb-agent/config.example.json

%changelog
* $(date +"%a %b %d %Y") IAC Dharma <support@iacdharma.com> - ${VERSION}-${RELEASE}
- Initial release
EOF

# Build RPM
rpmbuild -ba ~/rpmbuild/SPECS/cmdb-agent.spec

# Copy to dist
cp ~/rpmbuild/RPMS/x86_64/cmdb-agent-${VERSION}-${RELEASE}.x86_64.rpm dist/
```

### Install RPM
```bash
# Install
sudo rpm -ivh cmdb-agent-1.0.0-1.x86_64.rpm

# Or with yum
sudo yum install cmdb-agent-1.0.0-1.x86_64.rpm

# Configure
sudo nano /etc/cmdb-agent/config.json

# Restart
sudo systemctl restart cmdb-agent
```

## 📱 Android APK

### Build APK
```bash
# Requires Android SDK and React Native or similar

# Build
cd mobile/android
./gradlew assembleRelease

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  my-key-alias

# Align APK
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk \
  app/build/outputs/apk/release/cmdb-agent-1.0.0.apk
```

### Install APK
```bash
# Via ADB
adb install cmdb-agent-1.0.0.apk

# Or transfer to device and install manually
```

## 🔄 Auto-Update System

### Server Setup

1. **Upload Update Package**
```bash
curl -X POST http://your-server:3001/api/updates/upload \
  -H "Authorization: Bearer your-api-key" \
  -F "package=@CMDBAgent-1.1.0-x64.msi" \
  -F "version=1.1.0" \
  -F "platform=windows" \
  -F "architecture=x64" \
  -F "releaseNotes=Bug fixes and improvements" \
  -F "mandatory=false"
```

2. **Push Update to Agents**
```bash
curl -X POST http://your-server:3001/api/updates/push \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "updateId": "windows-x64-1.1.0",
    "targetPlatform": "windows",
    "targetArchitecture": "x64",
    "force": false
  }'
```

### Agent Auto-Update

Agents automatically check for updates every hour (configurable).

**Enable auto-update:**
```bash
# Windows
set AUTO_UPDATE=true

# Linux/macOS
export AUTO_UPDATE=true
```

**Manual update check:**
```bash
# API endpoint
curl http://localhost:3001/api/agent/check-update
```

## 🌐 Web-Based Update Management

### Upload Interface
```typescript
// Frontend component for upload
<UpdateUploader
  onSuccess={(result) => {
    console.log('Update uploaded:', result);
  }}
/>
```

### Dashboard
- View all available updates
- Upload new packages
- Push updates to specific agents or groups
- Track update status per agent
- Rollback capabilities

## 🔐 Security

### Package Signing
All packages include SHA-256 checksums verified before installation.

### Distribution Security
- HTTPS-only downloads
- API key authentication
- Checksum verification
- Signature validation (platform-specific)

## 📊 Update Metrics

Track update deployment:
- Agents pending update
- Agents updated successfully
- Failed updates
- Update distribution progress

## 🎯 Next Steps

1. Build packages for your platforms
2. Set up update server
3. Configure auto-update
4. Test update flow
5. Deploy to production

---

**Support:** support@iacdharma.com  
**Documentation:** https://docs.iacdharma.com/updates
