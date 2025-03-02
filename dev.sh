#!/bin/bash

# Clean up build artifacts
echo "Cleaning up previous build artifacts..."
rm -rf .next out node_modules/.cache

# Set up environment to prevent conflicts
export STANDALONE_CALCULATOR=false
export NEXT_IS_DEV=true

# Build standalone calculator first
echo "Building standalone calculator..."
node build-calculator.js

# Start Next.js development server
echo "Starting Next.js development server..."
next dev