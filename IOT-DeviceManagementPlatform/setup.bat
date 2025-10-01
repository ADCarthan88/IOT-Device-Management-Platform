@echo off
REM IoT Device Management Platform - Windows Setup Script
REM This script sets up the complete development environment on Windows

echo.
echo 🚀 IoT Device Management Platform - Windows Setup Script
echo ===========================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Get Node.js version and check if it's 18+
for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% lss 18 (
    echo ❌ Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js detected:
node --version

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop with Compose and try again.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose detected
echo.

REM Function to install dependencies
echo 📦 Installing dependencies...

REM Root dependencies
if exist "package.json" (
    echo Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install root dependencies
        pause
        exit /b 1
    )
)

REM Backend dependencies
if exist "backend" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Frontend dependencies
if exist "frontend" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

echo ✅ All dependencies installed
echo.

REM Setup environment files
echo ⚙️  Setting up environment configuration...

REM Backend environment
if exist "backend\.env.example" (
    if not exist "backend\.env" (
        echo Creating backend .env file...
        copy "backend\.env.example" "backend\.env" >nul
        echo ✅ Backend .env created from example
    )
)

REM Frontend environment
if not exist "frontend\.env" (
    echo Creating frontend .env file...
    echo REACT_APP_API_URL=http://localhost:8000/api > "frontend\.env"
    echo REACT_APP_WS_URL=ws://localhost:8000 >> "frontend\.env"
    echo ✅ Frontend .env created
)

echo.

REM Start Docker services
echo 🐳 Starting Docker services...

REM Start database and cache services
docker-compose up -d postgres redis
if %errorlevel% neq 0 (
    echo ❌ Failed to start database services
    pause
    exit /b 1
)

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking services...
REM Wait for PostgreSQL
:wait_postgres
docker-compose exec postgres pg_isready -U iot_user -d iot_platform >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)

REM Wait for Redis
:wait_redis
docker-compose exec redis redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_redis
)

echo ✅ Database services are ready
echo.

REM Build and start application services
echo 🏗️  Building and starting application services...

docker-compose up -d backend
if %errorlevel% neq 0 (
    echo ❌ Failed to start backend service
    pause
    exit /b 1
)

echo ⏳ Waiting for backend to be ready...
:wait_backend
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_backend
)

echo ✅ Backend service is ready
echo.

REM Display final instructions
echo.
echo 🎉 Setup completed successfully!
echo ================================
echo.
echo 📋 Available Services:
echo   • Backend API: http://localhost:8000
echo   • API Documentation: http://localhost:8000/api-docs
echo   • Health Check: http://localhost:8000/health
echo   • Metrics: http://localhost:8000/metrics
echo   • PostgreSQL: localhost:5432 (user: iot_user, db: iot_platform)
echo   • Redis: localhost:6379
echo.
echo 🚀 Quick Start Commands:
echo   # Start all services with Docker
echo   docker-compose up -d
echo.
echo   # Start frontend development server
echo   cd frontend ^&^& npm start
echo.
echo   # View logs
echo   docker-compose logs -f backend
echo.
echo   # Stop all services
echo   docker-compose down
echo.
echo 📖 For detailed documentation, see:
echo   • README.md - Overview and quick start
echo   • DEVELOPMENT.md - Development guide
echo   • API Documentation - http://localhost:8000/api-docs
echo.
echo 💡 To start the frontend in development mode:
echo    cd frontend
echo    npm start
echo    Frontend will be available at: http://localhost:3000
echo.

pause