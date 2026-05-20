#!/bin/bash

# 종료 시 자식 프로세스 모두 죽이기
trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Starting backend..."
cd backend
if [ ! -d "venv" ]; then
  echo "Creating virtualenv..."
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
else
  source venv/bin/activate
fi
uvicorn app.main:app --reload --port 8000 &

echo "Starting frontend..."
cd ../frontend
npm install --silent
npm run dev &

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
