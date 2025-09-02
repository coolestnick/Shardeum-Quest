#!/bin/bash

echo "🚀 Starting ShardeumQuest Demo..."

# Start backend in background
cd backend && node demo-server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
cd ../frontend && npm start &
FRONTEND_PID=$!

echo "✅ Backend running on http://localhost:3001 (PID: $BACKEND_PID)"
echo "✅ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo "📄 Contract Address: 0xf3272fc24AFCfFB4Bc8f2cE88ea64D8E5FAE6322"
echo ""
echo "🎮 Open http://localhost:3000 to use ShardeumQuest!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait