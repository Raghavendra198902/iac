#!/bin/bash
set -e

VERSION=${1:-1.0.0}
ARCH=${2:-x86_64}

echo "Building RPM package for cmdb-agent v${VERSION}"

# Build binary
./build.sh ${VERSION}

# Create RPM build structure
RPM_ROOT="dist/rpm"
mkdir -p ${RPM_ROOT}/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

# Create spec file
cat > ${RPM_ROOT}/SPECS/cmdb-agent.spec <<EOF
Name:           cmdb-agent
Version:        ${VERSION}
Release:        1%{?dist}
Summary:        Unified CMDB Agent

License:        MIT
URL:            https://github.com/iac/cmdb-agent
Source0:        %{name}-%{version}.tar.gz

BuildArch:      ${ARCH}
Requires:       systemd

%description
Lightweight, cross-platform endpoint agent for collecting
configuration items, telemetry, and enforcing policies.

%prep
%setup -q

%install
mkdir -p %{buildroot}/usr/local/bin
mkdir -p %{buildroot}/etc/cmdb-agent
mkdir -p %{buildroot}/var/lib/cmdb-agent
mkdir -p %{buildroot}/usr/lib/systemd/system

install -m 0755 cmdb-agent %{buildroot}/usr/local/bin/
install -m 0755 cmdb-agent-cli %{buildroot}/usr/local/bin/
install -m 0644 config.yaml %{buildroot}/etc/cmdb-agent/
install -m 0644 cmdb-agent.service %{buildroot}/usr/lib/systemd/system/

%post
systemctl daemon-reload
systemctl enable cmdb-agent.service
systemctl start cmdb-agent.service

%preun
systemctl stop cmdb-agent.service || true
systemctl disable cmdb-agent.service || true

%files
/usr/local/bin/cmdb-agent
/usr/local/bin/cmdb-agent-cli
%config(noreplace) /etc/cmdb-agent/config.yaml
/usr/lib/systemd/system/cmdb-agent.service
%dir /var/lib/cmdb-agent

%changelog
* $(date '+%a %b %d %Y') CMDB Team <cmdb@example.com> - ${VERSION}-1
- Initial release

EOF

# Create source tarball
TARBALL_DIR="${RPM_ROOT}/SOURCES/cmdb-agent-${VERSION}"
mkdir -p ${TARBALL_DIR}
cp dist/cmdb-agent-linux-amd64 ${TARBALL_DIR}/cmdb-agent
cp dist/cmdb-agent-cli-linux-amd64 ${TARBALL_DIR}/cmdb-agent-cli
cp config.example.yaml ${TARBALL_DIR}/config.yaml
cp systemd/cmdb-agent.service ${TARBALL_DIR}/

cd ${RPM_ROOT}/SOURCES
tar czf cmdb-agent-${VERSION}.tar.gz cmdb-agent-${VERSION}/
cd -

# Build RPM
rpmbuild --define "_topdir $(pwd)/${RPM_ROOT}" -bb ${RPM_ROOT}/SPECS/cmdb-agent.spec

# Copy RPM to dist
cp ${RPM_ROOT}/RPMS/${ARCH}/cmdb-agent-${VERSION}-1.*.rpm dist/

echo "RPM package created: dist/cmdb-agent-${VERSION}-1.*.rpm"
