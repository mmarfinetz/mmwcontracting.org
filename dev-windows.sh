#!/bin/bash
# Development server for Windows 95 themed site

echo "Starting Windows 95 themed site development server..."

# Copy static assets to a temp directory
mkdir -p .dev-temp
cp index.html .dev-temp/
cp -r css .dev-temp/
cp -r js .dev-temp/
cp -r img .dev-temp/
cp -r assets .dev-temp/ 2>/dev/null || true

# Start a simple Python HTTP server
cd .dev-temp
echo "Server running at http://localhost:8000"
python3 -m http.server 8000