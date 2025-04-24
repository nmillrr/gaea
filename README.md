# Cosmo Backend

A Node.js backend API for the Cosmo application built with Express and TypeScript.

## Features

- RESTful API with Express
- TypeScript for type safety
- PostgreSQL database with TypeORM
- PostGIS extension for geospatial queries
- JWT authentication
- File uploads to cloud storage (AWS S3 or Google Cloud Storage)
- CORS enabled

## Database Schema

The database schema consists of the following tables:

1. **users**
   - User accounts with authentication
   - Fields: id, email, password_hash, username, avatar_url, created_at

2. **photos**
   - Photos with geolocation data
   - Fields: id, user_id, s3_key, latitude, longitude, created_at

3. **guesses**
   - User guesses for photo locations
   - Fields: id, photo_id, user_id, guess_lat, guess_lng, distance_meters, points, created_at

4. **friendships**
   - Connections between users
   - Fields: user_id, friend_id, status (pending/accepted), created_at

5. **comments**
   - User comments on photos
   - Fields: id, photo_id, user_id, text, created_at

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL with PostGIS extension
- AWS account or Google Cloud account (for photo storage)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/cosmo.git
   cd cosmo
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other configuration options.

4. Build the application
   ```
   npm run build
   ```

5. Start the server
   ```
   npm start
   ```
   For development with automatic reloading:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /` - Health check endpoint
- (Other endpoints will be documented as they are implemented)

## Development

### Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the application
- `npm start` - Start the built application
- `npm run lint` - Run linting

### Database Initialization

The database schema is managed using TypeORM entities. When the server starts, it automatically initializes the database connection and creates the necessary tables if they don't exist.

## License

ISC