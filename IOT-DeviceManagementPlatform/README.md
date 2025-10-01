# IOT Device Management Platform

A comprehensive, enterprise-grade IoT device management platform built with modern technologies and best practices.

## 🚀 Features

### ✅ Implemented
- **Device Management**: Complete CRUD operations for IoT devices with real-time updates
- **Authentication System**: JWT-based auth with registration, login, password reset, email verification
- **Real-time Communication**: WebSocket integration for live device status and data streaming
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation with interactive explorer
- **Security**: Rate limiting, CORS, helmet security headers, input validation
- **Monitoring**: Prometheus metrics collection, health check endpoints
- **CI/CD Pipeline**: GitHub Actions with automated testing, building, and deployment
- **Infrastructure**: Docker containerization with multi-service orchestration

### 🚧 In Development
- **Frontend Application**: React dashboard with Material-UI components
- **Dashboard Analytics**: Real-time device metrics and data visualization
- **User Management**: Complete user profile and organization management
- **Alert System**: Real-time notifications and alerting infrastructure
- **Firmware Management**: Over-the-air (OTA) firmware update system

### 📋 Planned
- **Device Grouping**: Organize devices into logical groups and hierarchies
- **Advanced Analytics**: Time-series data analysis and predictive insights
- **Mobile Application**: React Native mobile app for on-the-go management
- **Third-party Integrations**: AWS IoT, Azure IoT Hub, Google Cloud IoT
- **Advanced Security**: OAuth2, SAML, multi-factor authentication

## 🏗️ Architecture

### Backend
- **Node.js** with **TypeScript**
- **Express.js** REST API
- **PostgreSQL** database with **Prisma ORM**
- **Redis** for caching and message queuing
- **WebSocket** for real-time communication
- **JWT** authentication
- **Rate limiting** and security middleware

### Frontend
- **React** with **TypeScript**
- **Material-UI** for modern UI components
- **Redux Toolkit** for state management
- **React Query** for API data fetching
- **WebSocket** client for real-time updates

### Infrastructure
- **Docker** containerization
- **Docker Compose** for local development
- **GitHub Actions** CI/CD pipeline
- **PostgreSQL** database
- **Redis** cache and message broker

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

## 🛠️ Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ADCarthan88/IOT-Device-Management-Platform.git
cd IOT-Device-Management-Platform

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Documentation: http://localhost:5000/api-docs
```

### Manual Setup

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis (or use Docker)
docker-compose up -d postgres redis

# Run database migrations
cd backend && npm run migrate && cd ..

# Start the development servers
npm run dev
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run e2e tests
npm run test:e2e
```

## 📖 API Documentation

API documentation is available at `http://localhost:5000/api-docs` when running the backend server.

## 🚀 Deployment

The project includes GitHub Actions workflows for automated CI/CD:

- **Build & Test**: Runs on every push and pull request
- **Deploy**: Automatically deploys to production on main branch

## 🔧 Development

### Project Structure

```
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── websocket/       # WebSocket handlers
│   ├── tests/               # Backend tests
│   └── prisma/              # Database schema and migrations
├── frontend/                # React/TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── docker/                  # Docker configurations
├── .github/                 # GitHub Actions workflows
└── monitoring/              # Prometheus/Grafana configs
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Environment variable protection

## 📊 Monitoring

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Winston**: Structured logging
- **Health checks**: Application health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Adam Carthan** - *Initial work* - [ADCarthan88](https://github.com/ADCarthan88)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by enterprise IoT management solutions
- Community feedback and contributions