#!/bin/bash
# Modified build script to use original Windows 95 theme with Marfinetz Plumbing branding

# Clean up previous builds
rm -rf .next out public

# Ensure the public directory exists
mkdir -p public

# Copy essential static assets INCLUDING the original index.html
cp -r img public/ 2>/dev/null || true
cp -r css public/ 2>/dev/null || true
cp -r js public/ 2>/dev/null || true
cp index.html public/ 2>/dev/null || true

# Run the Next.js build for the calculator and other Next.js features
npm run build

# Copy the Next.js output to the public directory, but DON'T overwrite index.html
mkdir -p public/calculator
cp -r out/calculator/* public/calculator/ 2>/dev/null || true

# Copy contact page and other Next.js pages
mkdir -p public/contact
cp -r out/contact/* public/contact/ 2>/dev/null || true

# Copy dashboard if it exists
mkdir -p public/dashboard
cp -r out/dashboard/* public/dashboard/ 2>/dev/null || true

# Copy any other Next.js generated directories (service-areas, services, etc.)
for dir in out/*/; do
  if [ -d "$dir" ] && [ "$(basename "$dir")" != "_next" ] && [ "$(basename "$dir")" != "api" ] && [ "$(basename "$dir")" != "calculator" ] && [ "$(basename "$dir")" != "contact" ] && [ "$(basename "$dir")" != "dashboard" ]; then
    dirname=$(basename "$dir")
    mkdir -p "public/$dirname"
    cp -r "$dir"* "public/$dirname/" 2>/dev/null || true
  fi
done

# Copy any remaining assets that might be needed
cp -r assets/* public/ 2>/dev/null || true

# Make sure we're using the original Windows 95 theme index.html
echo "Using original Windows 95 theme index.html with Marfinetz Plumbing branding"

echo "Files in public directory:"
ls -la public/
echo "Build completed successfully with Windows 95 theme interface!"
