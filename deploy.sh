#!/bin/bash

# Build script for deployment
echo "Starting deployment build..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    echo "Application is ready for deployment."
else
    echo "Build failed!"
    exit 1
fi