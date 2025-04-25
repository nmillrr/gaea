#!/bin/bash

# Script to set up development environment for Cosmo

set -e # Exit on error

# Change to the script's directory regardless of where it's called from
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"
echo "Running setup from directory: $(pwd)"

# Print colorful messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Cosmo development environment...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker and Docker Compose first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}.env file created.${NC}"
    else
        echo -e "${RED}.env.example file not found. Creating a default .env file...${NC}"
        cat > .env << EOL
# Node Environment
NODE_ENV=development
PORT=4000

# Database Configuration
POSTGRES_USER=cosmo
POSTGRES_PASSWORD=cosmopassword
POSTGRES_DB=cosmodb
DB_HOST=postgres
DB_PORT=5432
DB_USER=cosmo

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# MinIO (S3) Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_NAME=cosmo-uploads
S3_ENDPOINT=minio
S3_PORT=9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=cosmo-uploads
S3_USE_SSL=false
S3_PUBLIC_URL=http://localhost:9000/cosmo-uploads

# JWT Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOL
        echo -e "${GREEN}Default .env file created.${NC}"
    fi
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"

# Check if package.json exists in current directory
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}Backend dependencies installed.${NC}"
else
    echo -e "${RED}Error: package.json not found in $(pwd)${NC}"
    echo -e "${YELLOW}Skipping npm install. You may need to run it manually.${NC}"
fi

# Build and start Docker containers
echo -e "${YELLOW}Building and starting Docker containers...${NC}"

# Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d --build

    # Check if containers are running
    echo -e "${YELLOW}Checking if containers are running...${NC}"
    sleep 10 # Give more time for containers to start

    # Get the number of expected containers from docker-compose
    EXPECTED_CONTAINERS=$(docker-compose ps --services | wc -l | tr -d ' ')
    RUNNING_CONTAINERS=$(docker-compose ps -q | wc -l | tr -d ' ')
else
    echo -e "${RED}Error: docker-compose.yml not found in $(pwd)${NC}"
    echo -e "${YELLOW}Skipping docker-compose. You may need to run it manually.${NC}"
    EXPECTED_CONTAINERS=0
    RUNNING_CONTAINERS=0
fi

if [ -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Expected containers: ${EXPECTED_CONTAINERS}, Running containers: ${RUNNING_CONTAINERS}${NC}"

    if [ "$RUNNING_CONTAINERS" -lt "$EXPECTED_CONTAINERS" ]; then
        echo -e "${RED}Some containers failed to start. Check 'docker-compose logs' for details.${NC}"
        docker-compose ps
        echo -e "${YELLOW}You can still proceed, but some services might not be available.${NC}"
        echo -e "${YELLOW}Do you want to continue? (y/n)${NC}"
        read -r continue_setup
        if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
            echo -e "${RED}Setup aborted.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}All containers are running.${NC}"
    fi
else
    echo -e "${YELLOW}Skipping container check since docker-compose.yml was not found.${NC}"
fi

# Display information about services
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Cosmo Development Environment Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"

if [ -f "docker-compose.yml" ] && [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    echo -e "${YELLOW}Services:${NC}"
    echo -e "${YELLOW}PostgreSQL:${NC} localhost:5432"
    echo -e "${YELLOW}Redis:${NC} localhost:6379"
    echo -e "${YELLOW}MinIO API:${NC} http://localhost:9000"
    echo -e "${YELLOW}MinIO Console:${NC} http://localhost:9001 (login with minioadmin/minioadmin)"
    echo -e "${YELLOW}Backend API:${NC} http://localhost:4000"
    echo -e "${GREEN}============================================${NC}"
    echo -e "${YELLOW}Docker Commands:${NC}"
    echo -e "${YELLOW}Use 'docker-compose logs -f' to view logs${NC}"
    echo -e "${YELLOW}Use 'docker-compose down' to stop services${NC}"
else
    echo -e "${YELLOW}Docker services were not started.${NC}"
    echo -e "${YELLOW}Please check the error messages above and try again.${NC}"
fi

echo -e "${GREEN}============================================${NC}"