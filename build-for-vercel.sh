#!/bin/bash
# Modified build script for SEO-optimized version

# Clean up previous builds
rm -rf .next out public

# Ensure the public directory exists
mkdir -p public

# Copy essential static assets but NOT the old index.html
cp -r img public/ 2>/dev/null || true
mkdir -p public/css
mkdir -p public/js

# Run the Next.js build
npm run build

# Copy the Next.js output to the public directory
cp -r out/* public/

# Copy any remaining assets that might be needed
cp -r assets/* public/ 2>/dev/null || true

# Make sure we're using the Next.js version of index.html
if [ -f out/index.html ]; then
  echo "Using Next.js SEO-optimized index.html"
  cp out/index.html public/
fi

echo "Files in public directory:"
ls -la public/
echo "Build completed successfully with SEO-optimized interface!"
