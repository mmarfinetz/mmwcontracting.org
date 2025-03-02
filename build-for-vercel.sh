#!/bin/bash

# Clean up previous builds
rm -rf .next out public

# Ensure the public directory exists
mkdir -p public

# First copy the static website files
cp -r index.html public/
cp -r css public/
cp -r js public/
cp -r img public/
cp -r contact-form.html public/ 2>/dev/null || true

# Add a placeholder for calculator that will be replaced by Next.js output
mkdir -p public/calculator

# Run the Next.js build
npm run build

# Copy Next.js output for the calculator only (not the index)
cp -r out/calculator public/ 2>/dev/null || true

# Copy any remaining assets that might be needed
cp -r assets/* public/ 2>/dev/null || true

# Make sure index.html is not overwritten
if [ -f out/index.html ]; then
  echo "Making sure index.html is the static version"
  cp index.html public/
fi

echo "Files in public directory:"
ls -la public/

echo "Build completed successfully!" 