# Cosmo Backend

A Node.js backend API for the Cosmo application built with Express and TypeScript.

## Features

- RESTful API with Express
- TypeScript for type safety
- PostgreSQL database with TypeORM
- PostGIS extension for geospatial queries
- JWT authentication
- Secure file uploads to AWS S3
- EXIF metadata stripping for privacy
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

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Photos
- `POST /photos` - Upload a new photo (authenticated)
- `GET /photos` - Get all user photos (authenticated)
- `GET /photos/:id` - Get a specific photo (authenticated)

### Protected Routes
- `GET /api/me` - Get current user info (authenticated)

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL with PostGIS extension
- AWS account (for photo storage)

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
   Edit the `.env` file with your database credentials and AWS S3 configuration.

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

## Photo Upload Details

The photo upload endpoint:
- Accepts images via multipart/form-data
- Limits upload size to 10MB
- Only allows image file types (JPEG, PNG, GIF, WebP)
- Strips EXIF metadata for privacy
- Stores files in date-based folders (YYYY/MM/DD)
- Requires latitude/longitude coordinates
- Returns the photo's S3 URL and metadata

## Security Features

- Password hashing with bcrypt
- JWT-based authentication with 7-day expiration
- HTTPS-only cookies
- EXIF metadata stripping for privacy
- File size and type validation
- Input sanitization

## Testing

Run tests with:
```
npm test
```

## License

ISC