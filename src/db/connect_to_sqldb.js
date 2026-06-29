import { Sequelize } from 'sequelize';
import chalk from 'chalk';

// Determine if the environment is production or development
const isProduction = process.env.NODE_ENV === 'production';

// Read database connection parameters from environment variables
const database = process.env.PGSQL_DB_NAME;
const username = process.env.PGSQL_DB_USER;
const password = process.env.PGSQL_DB_PASSWORD;
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
const host = process.env.PGSQL_DB_HOST;
const port = process.env.PGSQL_DB_PORT
  ? parseInt(process.env.PGSQL_DB_PORT, 10)
  : 5432;

// Validate required environment variables 
// Throw an error if any required variable is missing or invalid
if (!database || !username || !password) {
  throw new Error(
    'Missing one or more required environment variables for database connection.',
  );
}
// In production, INSTANCE_CONNECTION_NAME is required for connecting via Cloud SQL socket
if (isProduction && !instanceConnectionName) {
  throw new Error('INSTANCE_CONNECTION_NAME is required in production.');
}
// In development, PGSQL_DB_HOST and PGSQL_DB_PORT are required for connecting via host and port
if (!isProduction && !host) {
  throw new Error('PGSQL_DB_HOST is required in development.');
}
// Validate that PGSQL_DB_PORT is a valid number if provided
if (!isProduction && isNaN(port)) {
  throw new Error('PGSQL_DB_PORT must be a valid number');
}

// Create the instance synchronously so models can call .define() at import time
const sequelize = new Sequelize(database, username, password, {
  // In production, we connect via the Cloud SQL socket path. In development, we connect via host and port.
  host: isProduction ? `/cloudsql/${instanceConnectionName}` : host,
  port,
  dialect: 'postgres', // Use PostgreSQL dialect
  // In production, we rely on the Cloud SQL proxy for SSL, so we don't need to set SSL options. In development, we disable SSL verification for local testing.
  dialectOptions: isProduction ? {} : { ssl: { rejectUnauthorized: false } },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }, // Connection pool settings
  logging: isProduction ? false : (msg) => console.log(chalk.gray(msg)), // Log SQL queries in development for debugging
});

// Function to connect to the database and authenticate the connection
const connectToDatabase = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log(
      chalk.magentaBright(
        `\nConnection to PostgreSQL database '${database}' established successfully.\n`,
      ),
    );
  } catch (error) {
    // Log the error and rethrow it to be handled by the caller
    console.error(
      chalk.red(`\nUnable to connect to the database: ${error.message}\n`),
    );
    throw error;
  }
};

// Function to close the database connection
const closeDatabaseConnection = () => sequelize?.close();

export { sequelize, connectToDatabase, closeDatabaseConnection };
