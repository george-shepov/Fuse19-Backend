#!/bin/bash

echo "🛑 Stopping Fuse19 Development Environment"
echo "==========================================="

cd "$(dirname "$0")"

# Read PIDs if they exist
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    echo "🔧 Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend stopped" || echo "⚠️  Backend may have already stopped"
    rm backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "🌐 Stopping frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend stopped" || echo "⚠️  Frontend may have already stopped"
    rm frontend.pid
fi

# Also kill any remaining Node processes on the expected ports
echo "🧹 Cleaning up any remaining processes..."
lsof -ti:4200 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "✅ Development environment stopped"
echo ""
echo "💡 To restart, run: ./start-dev.sh"