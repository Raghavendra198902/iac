# CMDB Agent Setup Script for Windows
# PowerShell script to set up and run the CMDB Client Agent

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CMDB Client Agent Setup (Windows)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
    } else {
        throw "Docker not found"
    }
} catch {
    Write-Host "✗ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker Compose is available: $composeVersion" -ForegroundColor Green
    } else {
        throw "Docker Compose not found"
    }
} catch {
    Write-Host "✗ Docker Compose is not available" -ForegroundColor Red
    Write-Host "Please ensure Docker Compose is installed (included with Docker Desktop)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Configuration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env file created" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Please edit .env file and configure:" -ForegroundColor Yellow
        Write-Host "  - CMDB_API_URL: Your CMDB API endpoint" -ForegroundColor White
        Write-Host "  - CMDB_API_KEY: Your API authentication key" -ForegroundColor White
        Write-Host "  - Other settings as needed" -ForegroundColor White
        Write-Host ""
        
        $continue = Read-Host "Have you configured the .env file? (y/n)"
        if ($continue -ne "y") {
            Write-Host "Please configure .env file and run this script again" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "✗ .env.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Create logs directory if it doesn't exist
if (-Not (Test-Path "logs")) {
    Write-Host "Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "✓ Logs directory created" -ForegroundColor Green
} else {
    Write-Host "✓ Logs directory exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Building and Starting Agent" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker compose build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to build Docker image" -ForegroundColor Red
    exit 1
}

# Start the container
Write-Host "Starting CMDB Agent container..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ CMDB Agent started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start CMDB Agent" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Agent Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Wait a moment for the container to start
Start-Sleep -Seconds 2

# Check container status
Write-Host "Checking container status..." -ForegroundColor Yellow
docker compose ps

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:           docker compose logs -f" -ForegroundColor White
Write-Host "  Stop agent:          docker compose stop" -ForegroundColor White
Write-Host "  Start agent:         docker compose start" -ForegroundColor White
Write-Host "  Restart agent:       docker compose restart" -ForegroundColor White
Write-Host "  Stop and remove:     docker compose down" -ForegroundColor White
Write-Host "  View status:         docker compose ps" -ForegroundColor White
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Health:              http://localhost:3001/health" -ForegroundColor White
Write-Host "  Status:              http://localhost:3001/status" -ForegroundColor White
Write-Host "  Manual Sync:         http://localhost:3001/sync" -ForegroundColor White
Write-Host "  Manual Discovery:    http://localhost:3001/discover" -ForegroundColor White
Write-Host ""
Write-Host "The agent is now running and will:" -ForegroundColor Cyan
Write-Host "  • Register itself in the CMDB" -ForegroundColor White
Write-Host "  • Collect system metrics every 60 seconds" -ForegroundColor White
Write-Host "  • Perform health checks every 30 seconds" -ForegroundColor White
Write-Host "  • Discover resources every 5 minutes" -ForegroundColor White
Write-Host ""
