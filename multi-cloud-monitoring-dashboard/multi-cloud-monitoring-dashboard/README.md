# multi-cloud-monitoring-dashboard/multi-cloud-monitoring-dashboard/README.md


# Multi-Cloud Monitoring Dashboard

A full-stack TypeScript application to visualize metrics across AWS, Azure, and GCP. The backend is an Express API with auth and alerting; the frontend is a React + Vite dashboard. Cloud adapters are stubbed for local development and easy CI; you can plug in real SDKs by swapping the adapter implementations.

## Features
- Health check endpoint
- Auth (demo token) with protected routes
- Providers list and metrics timeseries (mocked)
- Alerts CRUD with payload validation
- Type-safe across backend and frontend
- Dockerfiles and GitHub Actions CI

## Tech stack
- Backend: Node 20, Express, TypeScript, Zod, Winston
- Frontend: React 18, Vite, TypeScript
- Infra: Dockerfiles, basic Terraform scaffolding (optional)
- CI: GitHub Actions (build backend and frontend)

## Monorepo layout
```
.
├─ backend/
│  ├─ src/
│  ├─ package.json
│  └─ tsconfig.json
├─ frontend/
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ tsconfig.json
├─ docker/
├─ infra/
└─ .github/workflows/ci.yml
```

## Quick start (Local Dev)
Prereqs: Node 20, npm

1) Backend
```powershell
cd backend
npm install
# optional: copy env
# New-Item -ItemType File -Path ..\.env -Value "DEMO_TOKEN=demo-token`nCORS_ORIGIN=*`nPORT=4000"
npm run dev
```

2) Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```

3) Open
- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/health

## API
Auth
- POST /api/auth/login { username, password } → { token, user }
- POST /api/auth/logout → 204
- GET /api/auth/me → { user } (requires Bearer token)

Clouds (requires Bearer token)
- GET /api/clouds/providers → [{ id, name }]
- GET /api/clouds/:provider/metrics?resource=demo&range=1h → timeseries

Alerts (requires Bearer token)
- GET /api/alerts → { data: Alert[] }
- POST /api/alerts → { data: Alert }
- PUT /api/alerts/:id → { data: Alert }
- DELETE /api/alerts/:id → 204

## Configuration
Backend env (backend/src/config/env.ts uses process.env):
- NODE_ENV (default: development)
- PORT (default: 4000)
- DEMO_TOKEN (default: demo-token)
- CORS_ORIGIN (default: *)

## Production builds
- Backend: `npm run build` (outputs to backend/dist)
- Frontend: `npm run build` (outputs to frontend/dist)

## Docker (optional)
Build images from repo root with dockerfiles in ./docker.

## CI
- `.github/workflows/ci.yml` runs on pushes and PRs to main/master
- Jobs:
   - Backend: npm ci + tsc build
   - Frontend: npm ci + vite build

## Replace mock cloud adapters
Swap implementations in `backend/src/services/cloud/*` with real SDK calls:
- AWS: @aws-sdk/client-cloudwatch (v3)
- Azure: @azure/monitor-query
- GCP: @google-cloud/monitoring

Provide credentials via env variables and avoid committing secrets.

## License
MIT

## Overview

The Multi-Cloud Monitoring Dashboard is a comprehensive solution for monitoring cloud services across multiple providers, including AWS, Azure, and GCP. This project provides a backend API for data collection and a frontend dashboard for visualization.

## Features

- Monitor cloud services from AWS, Azure, and GCP.
- Real-time metrics and alerts.
- User authentication and authorization.
- Responsive and user-friendly frontend interface.

## Project Structure

```
multi-cloud-monitoring-dashboard
├── backend                # Backend application
│   ├── src               # Source code for the backend
│   ├── package.json      # Backend dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration for the backend
├── frontend               # Frontend application
│   ├── src               # Source code for the frontend
│   ├── package.json      # Frontend dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration for the frontend
├── infra                  # Infrastructure as Code
│   └── terraform         # Terraform configurations for cloud providers
├── docker                 # Docker configurations
├── scripts                # Utility scripts for development and deployment
├── .vscode                # VS Code settings
├── .editorconfig          # Code style configuration
├── .gitignore             # Files to ignore in version control
├── .env.example           # Example environment variables
├── package.json           # Overall project dependencies and scripts
└── tsconfig.json          # TypeScript configuration for the overall project
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker (for containerization)
- Terraform (for infrastructure management)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/multi-cloud-monitoring-dashboard.git
   cd multi-cloud-monitoring-dashboard
   ```

2. Install backend dependencies:

   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```
   cd ../frontend
   npm install
   ```

### Running the Application

To run the application in development mode, use the following commands:

1. Start the backend server:

   ```
   cd backend
   npm run dev
   ```

2. Start the frontend application:

   ```
   cd ../frontend
   npm start
   ```

### Deployment

To deploy the application, you can use the provided scripts:

1. Build and run Docker containers:

   ```
   cd docker
   docker-compose up --build
   ```

2. Deploy infrastructure using Terraform:

   ```
   cd infra/terraform/aws
   terraform init
   terraform apply
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.