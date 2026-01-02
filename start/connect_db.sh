#!/bin/bash
set -e

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/server/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    exit 1
fi

# Helper to find psql
find_psql() {
    # 1. Prioritize Postgres.app (matches server version)
    if [ -x "/Applications/Postgres.app/Contents/Versions/latest/bin/psql" ]; then
        echo "/Applications/Postgres.app/Contents/Versions/latest/bin/psql"
        return 0
    fi
    
    # 2. Check Homebrew locations
    local paths=(
        "/opt/homebrew/bin/psql"
        "/usr/local/bin/psql"
    )

    for p in "${paths[@]}"; do
        if [ -x "$p" ]; then
            echo "$p"
            return 0
        fi
    done

    # 3. Fallback to PATH (e.g., standard brew install)
    if command -v psql &> /dev/null; then
        echo "psql"
        return 0
    fi

    # 4. Search for versioned directories in /Library/PostgreSQL/
    for d in /Library/PostgreSQL/*; do
        if [ -x "$d/bin/psql" ]; then
            echo "$d/bin/psql"
            return 0
        fi
    done

     # 5. Search for versioned directories in Homebrew
    for d in /opt/homebrew/opt/postgresql@*; do
        if [ -x "$d/bin/psql" ]; then
            echo "$d/bin/psql"
            return 0
        fi
    done

    return 1
}

PSQL_CMD=$(find_psql)

if [ -z "$PSQL_CMD" ]; then
    printf "${RED}Error: 'psql' command not found.${NC}\n"
    printf "${BLUE}Prerequisites:${NC}\n"
    echo "You need the psql client installed on your system."
    echo "macOS: 'brew install postgresql' or use Postgres.app."
    echo "Linux: 'sudo apt install postgresql-client' (Debian/Ubuntu) or 'sudo yum install postgresql' (CentOS)."
    echo ""
    echo "If using Postgres.app, verify your PATH in ~/.zshrc:"
    echo '  export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin'
    exit 1
fi

# Better parsing function
get_env_var() {
    local key=$1
    local file=$2
    # Grep key, ignore comments, trim spaces
    grep "^$key" "$file" | sed 's/#.*//' | cut -d '=' -f2- | tr -d ' "' | tr -d "'"
}

DB_HOST=$(get_env_var "DB_HOST" "$ENV_FILE")
DB_PORT=$(get_env_var "DB_PORT" "$ENV_FILE")
DB_USER=$(get_env_var "DB_USER" "$ENV_FILE")
DB_NAME=$(get_env_var "DB_NAME" "$ENV_FILE")
PGPASSWORD=$(get_env_var "DB_PASSWORD" "$ENV_FILE")

export PGPASSWORD

if [[ -z "$DB_HOST" || -z "$DB_PORT" || -z "$DB_USER" || -z "$DB_NAME" ]]; then
    printf "${RED}Error: Could not parse database credentials from .env${NC}\n"
    echo "Debug: HOST=$DB_HOST, PORT=$DB_PORT, USER=$DB_USER, NAME=$DB_NAME"
    exit 1
fi

printf "${BLUE}Found psql at: ${GREEN}%s${NC}\n" "$PSQL_CMD"
printf "${BLUE}Connecting to Database: ${GREEN}%s${BLUE} as ${GREEN}%s${NC}\n" "$DB_NAME" "$DB_USER"

printf "\n${BLUE}--- PostgreSQL Cheat Sheet ---${NC}\n"
printf "  ${GREEN}\\l${NC}        List all databases\n"
printf "  ${GREEN}\\c dbname${NC} Connect to another database\n"
printf "  ${GREEN}\\dt${NC}       List tables in current database\n"
printf "  ${GREEN}\\d table${NC}  Describe table structure\n"
printf "  ${GREEN}\\q${NC}        Quit session\n"
printf "${BLUE}------------------------------${NC}\n\n"

"$PSQL_CMD" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
