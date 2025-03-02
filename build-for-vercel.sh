#!/bin/bash

# Clean up previous builds
rm -rf .next out public

# Run the Next.js build
npm run build

# Ensure the public directory exists
mkdir -p public

# Copy static assets to public directory
cp -r assets/* public/ 2>/dev/null || true

# Copy images to public directory if they exist
cp -r img/* public/ 2>/dev/null || true
cp -r public/* public/ 2>/dev/null || true

# Copy Next.js output to public directory
cp -r out/* public/ 2>/dev/null || true

# Ensure there are files in the public directory
if [ ! "$(ls -A public 2>/dev/null)" ]; then
  echo "Warning: Public directory is empty after build"
  # Fallback - just use the out directory
  cp -r out/* public/ 2>/dev/null || true
fi

echo "Files in public directory:"
ls -la public/

echo "Build completed successfully!" 