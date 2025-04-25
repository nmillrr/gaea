#!/bin/bash

# Simple test script for the Cosmo app

# Print colorful messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting simple test for the Cosmo app...${NC}"

# Make sure we're in the right directory
cd "$(dirname "$0")"
echo -e "${YELLOW}Current directory: $(pwd)${NC}"

# Create a simple .env file if needed
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating a simple .env file...${NC}"
    cat > .env << EOL
# Node Environment
NODE_ENV=development
PORT=4000

# JWT Authentication
JWT_SECRET=dev-secret-key-for-testing
JWT_EXPIRY=1d
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRY=7d

# Database Configuration (for local testing without Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_USERNAME=postgres
EOL
    echo -e "${GREEN}.env file created.${NC}"
fi

# Check if TypeScript is compiled
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}Compiling TypeScript code...${NC}"
    npx tsc || {
        echo -e "${RED}Failed to compile TypeScript code. Continuing anyway...${NC}"
    }
fi

# Run the server directly using ts-node (no need for Docker)
echo -e "${GREEN}Starting the server with ts-node...${NC}"
echo -e "${YELLOW}This will run in the foreground. Press Ctrl+C to stop.${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${YELLOW}To test the mobile app, open another terminal and run:${NC}"
echo -e "${GREEN}cd $(pwd)/cosmo-mobile && npm install && npm start${NC}"
echo -e "${GREEN}============================================${NC}"

# Run the server with ts-node
npx ts-node src/server.ts