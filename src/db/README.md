# Database Initialization

This module handles the initialization and connection to the PostgreSQL database for the Cosmo application.

## Schema

The database schema consists of the following tables:

1. **users**
   - `id` (PK): UUID primary key
   - `email`: Unique email address
   - `password_hash`: Hashed password
   - `username`: User's display name
   - `avatar_url`: Optional URL to the user's avatar
   - `created_at`: Timestamp when the user was created

2. **photos**
   - `id` (PK): UUID primary key
   - `user_id`: Foreign key to users.id
   - `s3_key`: Key for the photo in S3 storage
   - `latitude`: Geographic latitude
   - `longitude`: Geographic longitude
   - `created_at`: Timestamp when the photo was created

3. **guesses**
   - `id` (PK): UUID primary key
   - `photo_id`: Foreign key to photos.id
   - `user_id`: Foreign key to users.id
   - `guess_lat`: Latitude of the guess
   - `guess_lng`: Longitude of the guess
   - `distance_meters`: Distance in meters between the guess and the actual location
   - `points`: Points awarded for the guess
   - `created_at`: Timestamp when the guess was made

4. **friendships**
   - `user_id` (Composite PK): Foreign key to users.id
   - `friend_id` (Composite PK): Foreign key to users.id
   - `status`: ENUM: 'pending' or 'accepted'
   - `created_at`: Timestamp when the friendship was created

5. **comments**
   - `id` (PK): UUID primary key
   - `photo_id`: Foreign key to photos.id
   - `user_id`: Foreign key to users.id
   - `text`: Comment text
   - `created_at`: Timestamp when the comment was created

## PostGIS Integration

The database also includes the PostGIS extension for handling geographic data operations.

## Usage

The database connection is established when the server starts. The database connection is exposed through the `AppDataSource` object, which can be imported from this module.

```typescript
import { AppDataSource } from './db/init';

// Use the data source to query the database
const users = await AppDataSource.getRepository(User).find();
```