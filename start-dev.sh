#!/bin/bash

echo "🚀 Starting Fuse19 Full-Stack Development Environment"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is available
echo "📊 Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB found"
elif docker info &> /dev/null; then
    echo "✅ Docker found - will use MongoDB container"
    echo "🐳 Starting MongoDB container..."
    docker run -d --name fuse19-mongodb -p 27017:27017 mongo:6.0 || echo "MongoDB container may already be running"
else
    echo "⚠️  MongoDB not found and Docker not available"
    echo "Please install MongoDB or Docker to continue"
    exit 1
fi

# Start backend server
echo "🔧 Starting Node.js Backend Server..."
cd "$(dirname "$0")"

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
echo "🚀 Starting backend server on port 5000..."
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start Angular demo app
echo "🌐 Starting Angular Demo Application..."
cd demo

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting Angular demo app on port 4200..."
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Store PIDs for cleanup
echo $BACKEND_PID > ../backend.pid
echo $FRONTEND_PID > ../frontend.pid

echo ""
echo "🎉 Development environment started!"
echo "============================================="
echo "📱 Frontend (Angular): http://localhost:4200"
echo "🔧 Backend (Node.js):  http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/api"
echo ""
echo "To stop the servers, run: ./stop-dev.sh"
echo "Or manually kill processes:"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "🔄 Watching for changes... Both servers will auto-reload"

# Wait for user to stop
wait
