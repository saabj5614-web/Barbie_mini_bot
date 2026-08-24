#!/bin/bash
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export NODE_OPTIONS="--max-old-space-size=450"

echo "Installing (legacy peer deps)..."
npm install --legacy-peer-deps --omit=dev 2>&1 || true

echo "Starting bot..."
node index.js
