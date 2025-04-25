FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache python3 make g++ bash curl

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the wait-for script to wait for dependent services
COPY ./docker/backend/wait-for.sh /usr/local/bin/wait-for
RUN chmod +x /usr/local/bin/wait-for

# Set default environment variable
ENV NODE_ENV=development

# Expose the API port
EXPOSE 4000

# Start command will be defined in docker-compose.yml
CMD ["npm", "run", "dev"]