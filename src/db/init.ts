import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Photo } from "../entities/Photo";
import { Guess } from "../entities/Guess";
import { Friendship } from "../entities/Friendship";
import { Comment } from "../entities/Comment";

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "cosmo",
  synchronize: true,
  logging: true,
  entities: [User, Photo, Guess, Friendship, Comment],
  subscribers: [],
  migrations: [],
});

// Initialize the database
async function initializeDatabase() {
  try {
    // Initialize connection
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    // Enable PostGIS extension
    await AppDataSource.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    console.log("PostGIS extension enabled");

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error;
  }
}

// Export the data source for use in other files
export { AppDataSource, initializeDatabase };

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}