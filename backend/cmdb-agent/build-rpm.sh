#!/bin/bash
# Build RHEL/CentOS/Fedora RPM package for CMDB Agent

set -e

VERSION=${1:-"1.0.0"}
RELEASE="1"
PKG_NAME="cmdb-agent"

echo "Building RPM package v$VERSION..."

# Create RPM build structure
mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

# Build application
npm run build

# Create source tarball
tar -czf ~/rpmbuild/SOURCES/${PKG_NAME}-${VERSION}.tar.gz \
  dist/cmdb-agent-linux \
  package.json \
  README.md

# Create spec file
cat > ~/rpmbuild/SPECS/${PKG_NAME}.spec << EOF
Name:           ${PKG_NAME}
Version:        ${VERSION}
Release:        ${RELEASE}%{?dist}
Summary:        CMDB Agent for infrastructure monitoring

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

cat > %{buildroot}/etc/systemd/system/cmdb-agent.service << 'SERVICEEOF'
[Unit]
Description=CMDB Agent - Infrastructure Monitoring
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
EnvironmentFile=-/etc/cmdb-agent/environment
WorkingDirectory=/usr/local/bin
ExecStart=/usr/local/bin/cmdb-agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICEEOF

%post
systemctl daemon-reload
systemctl enable cmdb-agent
echo "CMDB Agent installed. Configure /etc/cmdb-agent/environment and start with: systemctl start cmdb-agent"

%preun
if [ \$1 -eq 0 ]; then
    systemctl stop cmdb-agent || true
    systemctl disable cmdb-agent || true
fi

%files
/usr/local/bin/cmdb-agent
/etc/systemd/system/cmdb-agent.service
%dir /etc/cmdb-agent

%changelog
* $(date +"%a %b %d %Y") IAC Dharma <support@iacdharma.com> - ${VERSION}-${RELEASE}
- Version ${VERSION} release
EOF

# Build RPM
rpmbuild -ba ~/rpmbuild/SPECS/${PKG_NAME}.spec

echo "✓ RPM package created in ~/rpmbuild/RPMS/x86_64/"
