#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================================="
echo "   AI-POWERED RESUME ANALYSIS & INTERVIEW PREPARATION SYSTEM"
echo "   Bharati Vidyapeeth's College of Engineering, New Delhi (GGSIPU)"
echo "   Team: Vansh, Anuj Nautiyal, Faraz Khan | Guide: Mr. Mohit Dayal"
echo "=========================================================================="

cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend
export PYTHONPATH="$DIR/backend"
echo "🚀 Launching FastAPI backend on http://127.0.0.1:8000 ..."
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "✨ Launching React/Vite frontend on http://localhost:5173 ..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System running! Open your browser to: http://localhost:5173"
echo "📖 Swagger API Docs available at:     http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to terminate both servers."
echo ""

wait

