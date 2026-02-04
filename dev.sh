#!/bin/bash
# Start the Next.js app from apps/web
cd apps/web
exec npx next dev -p 5000 -H 0.0.0.0
