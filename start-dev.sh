#!/bin/bash

# Start the Backend
echo "Starting Backend on port 5002..."
cd backend && npm run dev &

# Start the Frontend
echo "Starting Frontend..."
npm start
