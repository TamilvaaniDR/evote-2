# E-Voting System Deployment Script for Windows
# This script automates the deployment process

param(
    [switch]$Force,
    [switch]$SkipBuild
)

Write-Host "🚀 Starting E-Voting System Deployment..." -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  Please update .env file with your production values before continuing." -ForegroundColor Yellow
    if (-not $Force) {
        Read-Host "Press Enter to continue after updating .env file"
    }
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images if requested
if (-not $SkipBuild) {
    $removeImages = Read-Host "Do you want to remove old Docker images? (y/N)"
    if ($removeImages -eq "y" -or $removeImages -eq "Y") {
        Write-Host "🗑️  Removing old Docker images..." -ForegroundColor Yellow
        docker-compose down --rmi all
    }
}

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Green
docker-compose up -d --build

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Green

# Check MongoDB
try {
    docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" | Out-Null
    Write-Host "✅ MongoDB is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB is not healthy" -ForegroundColor Red
    exit 1
}

# Check Backend
try {
    Invoke-WebRequest -Uri "http://localhost:4000/api/ping" -UseBasicParsing | Out-Null
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not healthy" -ForegroundColor Red
    exit 1
}

# Check Frontend
try {
    Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing | Out-Null
    Write-Host "✅ Frontend is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not healthy" -ForegroundColor Red
    exit 1
}

# Display service information
Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "   MongoDB: localhost:27017" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose down" -ForegroundColor White
Write-Host "   Restart services: docker-compose restart" -ForegroundColor White
Write-Host "   Update services: docker-compose up -d --build" -ForegroundColor White
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""
Write-Host "✅ Deployment script completed successfully!" -ForegroundColor Green





