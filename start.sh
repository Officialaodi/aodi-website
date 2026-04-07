#!/bin/bash
set -e
echo "Starting Next.js app in apps/web..."
cd apps/web
exec npm start -- -p 5000 -H 0.0.0.0
