# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (optional if using Docker)
- Redis (optional if using Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ADCarthan88/IOT-Device-Management-Platform.git
   cd IOT-Device-Management-Platform
   ```

2. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

3. **Manual setup**
   ```bash
   # Install dependencies
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   
   # Set up environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Start services
   npm run dev
   ```

## Architecture Overview

### Backend (Node.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and message queuing
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket (Socket.IO)
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus metrics
- **Security**: Helmet, CORS, rate limiting

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Routing**: React Router
- **Charts**: Recharts
- **WebSocket**: Socket.IO client

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Reverse Proxy**: Nginx (production)

## Project Structure

```
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Utility functions
│   │   └── types/             # TypeScript types
│   ├── tests/                 # Backend tests
│   └── prisma/                # Database schema
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── monitoring/                # Monitoring configs
├── .github/                   # CI/CD workflows
└── docker-compose.yml         # Docker services
```

## Key Features Implemented

### ✅ Authentication & Authorization
- User registration and login
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Password reset functionality
- Email verification

### ✅ Device Management
- CRUD operations for IoT devices
- Real-time device status updates
- Device data collection and storage
- Command sending to devices
- Device filtering and pagination

### ✅ Real-time Communication
- WebSocket integration for live updates
- Device status notifications
- Real-time data streaming
- Alert notifications

### ✅ API Documentation
- Comprehensive Swagger/OpenAPI documentation
- Interactive API explorer
- Request/response examples

### ✅ Security
- JWT token authentication
- Rate limiting
- Input validation
- CORS configuration
- Security headers (Helmet)

### ✅ Monitoring & Metrics
- Prometheus metrics collection
- Health check endpoints
- Request/response logging
- Performance monitoring

### ✅ CI/CD Pipeline
- Automated testing
- Code linting and formatting
- Security auditing
- Docker image building
- Automated deployment workflows

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm test            # Run tests
npm run lint        # Lint code
npm run build       # Build production
```

### Frontend Development
```bash
cd frontend
npm start           # Start development server
npm test            # Run tests
npm run lint        # Lint code
npm run build       # Build for production
```

### Docker Development
```bash
docker-compose up -d postgres redis    # Start dependencies
docker-compose up backend frontend     # Start services
docker-compose logs -f backend         # View logs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device by ID
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/:id/data` - Get device data
- `POST /api/devices/:id/data` - Add device data
- `POST /api/devices/:id/commands` - Send command to device

### Health & Monitoring
- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check
- `GET /metrics` - Prometheus metrics

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/iot_platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

## Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm test -- --coverage # Coverage report
```

## Deployment

### Production Build
```bash
npm run build           # Build all services
docker-compose build    # Build Docker images
```

### Environment Setup
1. Set up production database (PostgreSQL)
2. Configure Redis instance
3. Update environment variables
4. Set up monitoring (Prometheus/Grafana)
5. Configure reverse proxy (Nginx)

## Performance Considerations

### Backend Optimizations
- Redis caching for frequently accessed data
- Database query optimization
- Request/response compression
- Connection pooling
- Rate limiting

### Frontend Optimizations
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies
- Progressive Web App features

## Security Best Practices

### Authentication
- Secure JWT implementation
- Password hashing with bcrypt
- Token expiration and refresh
- Rate limiting on auth endpoints

### API Security
- Input validation and sanitization
- CORS configuration
- Security headers
- SQL injection prevention
- XSS protection

### Infrastructure
- HTTPS in production
- Environment variable security
- Container security scanning
- Regular dependency updates

## Monitoring & Observability

### Metrics
- HTTP request metrics
- Database query performance
- WebSocket connection metrics
- Business metrics (devices, users, etc.)

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance monitoring

### Health Checks
- Application health endpoints
- Database connectivity checks
- External service health
- Custom health indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linting and tests
5. Submit a pull request

## Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

**Redis Connection Issues**
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
redis-cli ping
```

**Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Backend TypeScript Issues**
```bash
# Rebuild TypeScript
cd backend
npm run build
```