#!/bin/bash
set -e

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"

printf "${BLUE}Starting Backend Server...${NC}\n"
cd "$SERVER_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Run db init to be safe? Maybe optional.
# npm run db:init 

printf "${GREEN}Running 'npm run dev'...${NC}\n"
npm run dev
