#!/bin/bash

# E-Voting System Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Starting E-Voting System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_warning "Please update .env file with your production values before continuing."
    read -p "Press Enter to continue after updating .env file..."
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old Docker images..."
    docker-compose down --rmi all
fi

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_status "✅ MongoDB is healthy"
else
    print_error "❌ MongoDB is not healthy"
    exit 1
fi

# Check Backend
if curl -f http://localhost:4000/api/ping > /dev/null 2>&1; then
    print_status "✅ Backend is healthy"
else
    print_error "❌ Backend is not healthy"
    exit 1
fi

# Check Frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend is not healthy"
    exit 1
fi

# Display service information
echo
print_status "🎉 Deployment completed successfully!"
echo
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:4000"
echo "   MongoDB: localhost:27017"
echo
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update services: docker-compose up -d --build"
echo
echo "📊 Service Status:"
docker-compose ps
echo
print_status "Deployment script completed successfully!"





