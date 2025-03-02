#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=development
# Use the dev config by setting environment variables instead of using --config
export NEXT_PUBLIC_IS_NEXT_APP=true
export NEXT_PUBLIC_STANDALONE_CALCULATOR=false
npx next dev -p 3002
