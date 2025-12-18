#!/bin/bash
set -e

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Startup LaunchPad - Unified System      ${NC}"
echo -e "${BLUE}===========================================${NC}"

# Get the directory where the script is located (start/) and go up one level to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

# Function to kill processes on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"
    # Kill process group to ensure children die
    kill -- -$$ 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# 1. Backend Setup & Run
echo -e "\n${GREEN}[1/2] Starting Backend...${NC}"
cd "$SERVER_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Starting Backend Server..."
npm start &
BACKEND_PID=$!

# 2. Frontend Setup & Run
echo -e "\n${GREEN}[2/2] Starting Frontend...${NC}"
cd "$CLIENT_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting Frontend Dev Server..."
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}App is running!${NC}"
echo -e "Backend: http://localhost:5000"
echo -e "Frontend: (Check output above for port)"
echo -e "${BLUE}Press Ctrl+C to stop both servers.${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
