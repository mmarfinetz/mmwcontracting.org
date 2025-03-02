#!/bin/bash

# Exit on error
set -e

echo "=== Starting MMW Contracting Environment Fix ==="

# 1. Clean all build artifacts
echo "Cleaning build artifacts..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf js/calculator.js js/calculator.js.map js/calculator.css js/calculator.css.map

# 2. Build the standalone calculator
echo "Building standalone calculator..."
node build-calculator.js

# 3. Create proper Next.js config for the development server
echo "Creating Next.js development configuration..."
cat > next.config.dev.js << 'ENDCONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration
  reactStrictMode: true,
  swcMinify: false,
  env: {
    BUILD_ID: new Date().getTime().toString(),
    IS_NEXT_APP: 'true',
    STANDALONE_CALCULATOR: 'false',
  },
}

module.exports = nextConfig
ENDCONFIG

echo "=== Environment Fixed Successfully ==="
echo "To run the Next.js development server with fixed configuration, use:"
echo "./dev-fixed.sh"

# Create the fixed development script
cat > dev-fixed.sh << 'ENDSCRIPT'
#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=development
# Use the dev config by setting environment variables instead of using --config
export NEXT_PUBLIC_IS_NEXT_APP=true
export NEXT_PUBLIC_STANDALONE_CALCULATOR=false
npx next dev -p 3002
ENDSCRIPT

chmod +x dev-fixed.sh

echo "=== To build the complete site, run: ==="
echo "npm run build-all"