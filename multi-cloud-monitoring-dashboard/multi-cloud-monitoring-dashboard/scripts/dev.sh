#!/bin/bash

# Navigate to the backend directory and install dependencies
cd backend
npm install

# Navigate to the frontend directory and install dependencies
cd ../frontend
npm install

# Start the backend server
cd ../backend
npm run dev &

# Start the frontend application
cd ../frontend
npm start &

# Wait for a few seconds to ensure both servers are up
sleep 5

# Open the application in the default web browser
xdg-open http://localhost:3000

# Keep the script running
wait