#!/bin/sh
# Start script for Render deployment
# Runs migrations then starts the API server

set -e

echo "Running database migrations..."
migrate -path /app/migrations -database "$DATABASE_URL" up || echo "Migration skipped or already applied"

echo "Starting API server..."
exec /app/api
