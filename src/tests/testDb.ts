import { AppDataSource } from '../db/init';

/**
 * Initialize the TypeORM DataSource for DB-backed test suites.
 * Requires the docker-compose Postgres to be running (npm run docker:up).
 */
export async function ensureTestDb(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
    } catch (error) {
      throw new Error(
        `Could not connect to the test database. Start it with "npm run docker:up". Underlying error: ${error}`
      );
    }
  }
}

export async function closeTestDb(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}
