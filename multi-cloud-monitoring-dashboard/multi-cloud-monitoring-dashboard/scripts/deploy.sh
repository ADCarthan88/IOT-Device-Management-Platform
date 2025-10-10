#!/bin/bash

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Build the backend
cd backend
npm install
npm run build

# Build the frontend
cd ../frontend
npm install
npm run build

# Deploy to cloud providers (AWS, Azure, GCP)
cd ../infra/terraform/aws
terraform init
terraform apply -auto-approve

cd ../azure
terraform init
terraform apply -auto-approve

cd ../gcp
terraform init
terraform apply -auto-approve

# Start the application
cd ../../docker
docker-compose up -d

echo "Deployment completed successfully!"