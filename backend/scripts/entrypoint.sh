#!/usr/bin/env bash
set -euo pipefail

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting uvicorn..."
exec uvicorn core.asgi:application \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1
