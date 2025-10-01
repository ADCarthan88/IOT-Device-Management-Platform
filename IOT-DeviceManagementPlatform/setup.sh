#!/bin/bash

# IoT Device Management Platform - Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 IoT Device Management Platform - Setup Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker and Docker Compose detected"

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Root dependencies
    if [ -f "package.json" ]; then
        echo "Installing root dependencies..."
        npm install
    fi
    
    # Backend dependencies
    if [ -d "backend" ]; then
        echo "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        echo "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    echo "✅ All dependencies installed"
}

# Function to setup environment files
setup_environment() {
    echo "⚙️  Setting up environment configuration..."
    
    # Backend environment
    if [ -f "backend/.env.example" ] && [ ! -f "backend/.env" ]; then
        echo "Creating backend .env file..."
        cp backend/.env.example backend/.env
        echo "✅ Backend .env created from example"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        echo "Creating frontend .env file..."
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
EOF
        echo "✅ Frontend .env created"
    fi
}

# Function to start Docker services
start_docker_services() {
    echo "🐳 Starting Docker services..."
    
    # Start database and cache services
    docker-compose up -d postgres redis
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    echo "🔍 Checking PostgreSQL connection..."
    timeout 30 bash -c 'until docker-compose exec postgres pg_isready -U iot_user -d iot_platform; do sleep 1; done'
    
    # Check if Redis is ready
    echo "🔍 Checking Redis connection..."
    timeout 30 bash -c 'until docker-compose exec redis redis-cli ping; do sleep 1; done'
    
    echo "✅ Database services are ready"
}

# Function to build and start application services
start_application() {
    echo "🏗️  Building and starting application services..."
    
    # Build and start backend
    docker-compose up -d backend
    
    echo "⏳ Waiting for backend to be ready..."
    timeout 60 bash -c 'until curl -f http://localhost:8000/health > /dev/null 2>&1; do sleep 2; done'
    
    echo "✅ Backend service is ready"
    echo "📚 API Documentation: http://localhost:8000/api-docs"
    echo "🏥 Health Check: http://localhost:8000/health"
    echo "📊 Metrics: http://localhost:8000/metrics"
    
    # Note: Frontend will be started separately in development mode
    echo "💡 To start the frontend in development mode:"
    echo "   cd frontend && npm start"
    echo "   Frontend will be available at: http://localhost:3000"
}

# Function to display final instructions
show_final_instructions() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "📋 Available Services:"
    echo "  • Backend API: http://localhost:8000"
    echo "  • API Documentation: http://localhost:8000/api-docs"
    echo "  • Health Check: http://localhost:8000/health"
    echo "  • Metrics: http://localhost:8000/metrics"
    echo "  • PostgreSQL: localhost:5432 (user: iot_user, db: iot_platform)"
    echo "  • Redis: localhost:6379"
    echo ""
    echo "🚀 Quick Start Commands:"
    echo "  # Start all services with Docker"
    echo "  docker-compose up -d"
    echo ""
    echo "  # Start frontend development server"
    echo "  cd frontend && npm start"
    echo ""
    echo "  # View logs"
    echo "  docker-compose logs -f backend"
    echo ""
    echo "  # Stop all services"
    echo "  docker-compose down"
    echo ""
    echo "📖 For detailed documentation, see:"
    echo "  • README.md - Overview and quick start"
    echo "  • DEVELOPMENT.md - Development guide"
    echo "  • API Documentation - http://localhost:8000/api-docs"
    echo ""
}

# Main execution
main() {
    echo "Starting setup process..."
    echo ""
    
    # Check prerequisites
    echo "1️⃣  Checking prerequisites..."
    
    # Install dependencies
    echo "2️⃣  Installing dependencies..."
    install_dependencies
    echo ""
    
    # Setup environment
    echo "3️⃣  Setting up environment..."
    setup_environment
    echo ""
    
    # Start Docker services
    echo "4️⃣  Starting Docker services..."
    start_docker_services
    echo ""
    
    # Start application
    echo "5️⃣  Starting application..."
    start_application
    echo ""
    
    # Show final instructions
    show_final_instructions
}

# Handle script arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "start")
        echo "🚀 Starting all services..."
        docker-compose up -d
        echo "✅ All services started"
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        echo "✅ All services stopped"
        ;;
    "logs")
        docker-compose logs -f "${2:-backend}"
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
    "help"|"-h"|"--help")
        echo "IoT Device Management Platform - Setup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup (default)  - Full setup including dependencies and services"
        echo "  start           - Start all Docker services"
        echo "  stop            - Stop all Docker services"
        echo "  logs [service]  - Show logs for a service (default: backend)"
        echo "  clean           - Stop services and clean up Docker resources"
        echo "  help            - Show this help message"
        echo ""
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac