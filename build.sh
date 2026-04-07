#!/bin/bash
set -e
echo "Building Next.js app in apps/web..."
cd apps/web
npm install
npm run build
echo "Build complete."
