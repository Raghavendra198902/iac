#!/bin/bash
set -e

VERSION=${1:-1.0.0}
BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "Building CMDB Agent v${VERSION}"

# Build flags
LDFLAGS="-X main.version=${VERSION} -X main.buildTime=${BUILD_TIME} -X main.gitCommit=${GIT_COMMIT} -s -w"

# Build for multiple platforms
PLATFORMS=(
    "linux/amd64"
    "linux/arm64"
    "darwin/amd64"
    "darwin/arm64"
    "windows/amd64"
)

mkdir -p dist

for PLATFORM in "${PLATFORMS[@]}"; do
    OS=$(echo $PLATFORM | cut -d'/' -f1)
    ARCH=$(echo $PLATFORM | cut -d'/' -f2)
    
    OUTPUT="dist/cmdb-agent-${OS}-${ARCH}"
    if [ "$OS" = "windows" ]; then
        OUTPUT="${OUTPUT}.exe"
    fi

    echo "Building for ${OS}/${ARCH}..."
    GOOS=$OS GOARCH=$ARCH go build -ldflags="${LDFLAGS}" -o $OUTPUT ./cmd/cmdb-agent

    # Build CLI
    CLI_OUTPUT="dist/cmdb-agent-cli-${OS}-${ARCH}"
    if [ "$OS" = "windows" ]; then
        CLI_OUTPUT="${CLI_OUTPUT}.exe"
    fi
    GOOS=$OS GOARCH=$ARCH go build -ldflags="${LDFLAGS}" -o $CLI_OUTPUT ./cmd/cmdb-agent-cli
done

echo "Build complete! Binaries in dist/"
ls -lh dist/
