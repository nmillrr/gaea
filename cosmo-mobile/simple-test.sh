#!/bin/bash

# Simple test script for the Cosmo Mobile app

# Print colorful messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting simple test for the Cosmo Mobile app...${NC}"

# Make sure we're in the right directory
cd "$(dirname "$0")"
echo -e "${YELLOW}Current directory: $(pwd)${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install || {
        echo -e "${RED}Failed to install dependencies. Please check the error messages above.${NC}"
        exit 1
    }
    echo -e "${GREEN}Dependencies installed.${NC}"
else
    echo -e "${GREEN}Dependencies already installed.${NC}"
fi

# Start the Expo app
echo -e "${GREEN}Starting the Expo app...${NC}"
echo -e "${YELLOW}This will run in the foreground. Press Ctrl+C to stop.${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${YELLOW}Make sure the backend is running in another terminal:${NC}"
echo -e "${GREEN}cd $(dirname $(pwd)) && ./simple-test.sh${NC}"
echo -e "${GREEN}============================================${NC}"

# Run the Expo app
npm start