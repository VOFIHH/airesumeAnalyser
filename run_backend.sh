#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting AI Resume Analyser Backend (FastAPI + SBERT)..."
echo "=========================================================="

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r backend/requirements.txt
fi

export PYTHONPATH="$DIR/backend"
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

