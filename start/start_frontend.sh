#!/bin/bash
set -e

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$PROJECT_ROOT/client"

printf "${BLUE}Starting Frontend Application...${NC}\n"
cd "$CLIENT_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

printf "${GREEN}Running 'npm run dev'...${NC}\n"
npm run dev
