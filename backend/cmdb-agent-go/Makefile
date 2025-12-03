.PHONY: all build test clean install

VERSION ?= 1.0.0
LDFLAGS := -X main.version=$(VERSION) -X main.buildTime=$(shell date -u '+%Y-%m-%d_%H:%M:%S') -X main.gitCommit=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown") -s -w

all: build

build:
	@echo "Building CMDB Agent..."
	@go build -ldflags="$(LDFLAGS)" -o dist/cmdb-agent ./cmd/cmdb-agent
	@go build -ldflags="$(LDFLAGS)" -o dist/cmdb-agent-cli ./cmd/cmdb-agent-cli
	@echo "Build complete!"

build-all:
	@echo "Building for all platforms..."
	@./build.sh $(VERSION)

test:
	@echo "Running tests..."
	@go test -v ./...

test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html

clean:
	@echo "Cleaning..."
	@rm -rf dist/
	@rm -f coverage.out coverage.html

install: build
	@echo "Installing..."
	@sudo cp dist/cmdb-agent /usr/local/bin/
	@sudo cp dist/cmdb-agent-cli /usr/local/bin/
	@sudo mkdir -p /etc/cmdb-agent
	@sudo cp config.example.yaml /etc/cmdb-agent/config.yaml
	@sudo mkdir -p /var/lib/cmdb-agent
	@sudo cp systemd/cmdb-agent.service /etc/systemd/system/
	@sudo systemctl daemon-reload
	@echo "Installation complete!"

uninstall:
	@echo "Uninstalling..."
	@sudo systemctl stop cmdb-agent.service || true
	@sudo systemctl disable cmdb-agent.service || true
	@sudo rm -f /usr/local/bin/cmdb-agent
	@sudo rm -f /usr/local/bin/cmdb-agent-cli
	@sudo rm -f /etc/systemd/system/cmdb-agent.service
	@sudo systemctl daemon-reload
	@echo "Uninstall complete!"

deb:
	@echo "Building DEB package..."
	@./build-deb.sh $(VERSION) amd64

rpm:
	@echo "Building RPM package..."
	@./build-rpm.sh $(VERSION) x86_64

deps:
	@echo "Downloading dependencies..."
	@go mod download

fmt:
	@echo "Formatting code..."
	@go fmt ./...

lint:
	@echo "Running linter..."
	@golangci-lint run ./...

run:
	@go run ./cmd/cmdb-agent --config=config.example.yaml
