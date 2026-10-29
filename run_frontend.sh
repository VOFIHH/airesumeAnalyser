#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/frontend"

echo "=========================================================="
echo " Starting AI Resume Analyser Frontend (React + Vite)..."
echo "=========================================================="

npm run dev

