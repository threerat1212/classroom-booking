#!/bin/sh
# Start script for Render deployment
# Auto-migration is now handled by the Go binary on startup

set -e

echo "Starting API server..."
exec /app/api
