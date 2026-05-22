#!/bin/bash

trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 스크립트 위치 기준으로 경로 설정
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting frontend..."
cd "$DIR/frontend"
npm install --silent
npm run dev &

echo ""
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"

wait
