#!/bin/bash
set -e

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}===========================================${NC}"
printf "${BLUE}   🚀 Startup LaunchPad - Master Control   ${NC}\n"
echo -e "${BLUE}===========================================${NC}"
echo ""
echo -e "Please select an option:"
printf "${CYAN}1)${NC} Start Full Stack (Backend + Frontend)\n"
printf "${CYAN}2)${NC} Start Backend Only\n"
printf "${CYAN}3)${NC} Start Frontend Only\n"
printf "${CYAN}4)${NC} Connect to Database Terminal\n"
printf "${CYAN}5)${NC} Exit\n"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo -e "\n${GREEN}Starting Full Stack Environment...${NC}"
        # Run backend in background, then frontend
        # Trap to kill both
        cleanup() {
            echo -e "\n${BLUE}Shutting down services...${NC}"
            kill -- -$$ 2>/dev/null
            exit
        }
        trap cleanup SIGINT SIGTERM

        # We call the scripts directly? 
        # Better to run their commands here to manage PIDs easily in one shell session,
        # OR use the separate scripts in background.
        
        "$SCRIPT_DIR/start_backend.sh" &
        BACKEND_PID=$!
        
        # Give backend a moment to initialize?
        sleep 2
        
        "$SCRIPT_DIR/start_frontend.sh" &
        FRONTEND_PID=$!
        
        wait $BACKEND_PID $FRONTEND_PID
        ;;
    2)
        "$SCRIPT_DIR/start_backend.sh"
        ;;
    3)
        "$SCRIPT_DIR/start_frontend.sh"
        ;;
    4)
        "$SCRIPT_DIR/connect_db.sh"
        ;;
    5)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac
