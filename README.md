# Cosmo - Location-Based Photo Guessing Game

Cosmo is a social location-based photo guessing game where users share geotagged photos and friends compete to guess the exact locations.

## Overview

The application consists of two main components:
1. A Node.js backend API (this repository)
2. A React Native mobile app in the `cosmo-mobile` directory

## CI/CD Pipeline

Cosmo uses GitHub Actions for continuous integration and deployment. The pipeline includes:

- Linting for both backend and frontend code
- Automated testing with Jest
- Docker image building and deployment

For more details, see the [CI/CD Guide](./.github/CI_CD_GUIDE.md).

## Features

- User authentication and profile management
- Photo uploads with geolocation data
- Friend system with requests and connection management
- Location guessing with points based on proximity
- Activity feed of friends' photos
- Leaderboards and statistics
- Push notifications for new photos and guesses

## Technology Stack

### Backend
- Node.js with Express
- TypeScript for type safety
- PostgreSQL with PostGIS for geospatial queries
- Redis for caching and rate limiting
- S3-compatible storage for images
- JWT authentication
- Docker containerization

### Mobile App
- React Native with Expo
- Redux Toolkit for state management
- React Navigation for routing
- Maps integration for location guessing

## Docker Development Environment

We provide a complete Docker-based development environment with all required services.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cosmo.git
   cd cosmo
   ```

2. Run the setup script to bootstrap the development environment:
   ```
   ./setup-dev.sh
   ```

This will:
- Create a `.env` file from `.env.example`
- Install dependencies
- Build and start the Docker containers
- Display URLs for all services

### Services

The development environment includes:

- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **PostgreSQL with PostGIS**: localhost:5432
- **Redis**: localhost:6379
- **MinIO (S3-compatible storage)**:
  - API: [http://localhost:9000](http://localhost:9000)
  - Web Console: [http://localhost:9001](http://localhost:9001) (login with minioadmin/minioadmin)

### Manual Setup

If you prefer to set up manually:

1. Copy the environment variables file:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the Docker containers:
   ```
   docker-compose up -d
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `POST /auth/refresh-token` - Refresh an expired JWT token

### Photos
- `POST /photos` - Upload a new photo
- `GET /photos/feed` - Get photos from friends
- `GET /photos/:id` - Get a specific photo
- `GET /photos/:photoId/leaderboard` - Get leaderboard for a photo

### Guesses
- `POST /photos/:photoId/guess` - Submit a guess for a photo
- `GET /photos/:photoId/guess` - Get the user's guess for a photo

### Friends
- `POST /friends/request/:userId` - Send a friendship request
- `POST /friends/request/:userId/respond` - Accept/reject a friendship request
- `GET /friends` - List all accepted friends
- `GET /friends/requests` - List all pending friend requests

### User Profile
- `GET /users/me` - Get current user info
- `PUT /users/me` - Update user profile
- `POST /users/me/avatar` - Upload user avatar

## Mobile App

To run the mobile app:

```
cd cosmo-mobile
npm install
npm start
```

Then scan the QR code with the Expo Go app on your device.

## Database Schema

The database schema consists of the following tables:

1. **users** - User accounts with authentication
2. **photos** - Photos with geolocation data
3. **guesses** - User guesses for photo locations
4. **friendships** - Connections between users
5. **comments** - User comments on photos
6. **notifications** - User notifications

## Testing

Run tests with:
```
npm test
```

## License

ISC