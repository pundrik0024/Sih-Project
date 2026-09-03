#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "=== Starting UniShield SOC Platform ==="

# 1. Start Backend
echo "Starting Backend API on http://localhost:8000 ..."
cd "$DIR/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
    PYTHONPATH=. ./venv/bin/python -m app.ml.train
    PYTHONPATH=. ./venv/bin/python scripts/seed.py
fi

# Run backend in background
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# 2. Start Frontend
echo "Starting Frontend Dev Server on http://localhost:5173 ..."
cd "$DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "================================================================="
echo "   UniShield SOC Platform is now LIVE!"
echo "   Frontend UI : http://localhost:5173"
echo "   Backend API : http://localhost:8000"
echo "   Swagger Docs: http://localhost:8000/api/v1/docs"
echo "================================================================="
echo "Press Ctrl+C to terminate all services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
