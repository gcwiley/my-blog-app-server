import path from 'path';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

// load the environmental variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const isProduction = process.env.NODE_ENV === 'production';

// configuration variables
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const instanceUnixSocket = process.env.INSTANCE_UNIX_SOCKET;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
if (!isProduction && isNaN(port)) {
  throw new Error('DB_PORT must be a valid number');
}

// checks for presence of required environment variables
if (!database || !username || !password) {
  throw new Error(
    'Missing one or more required environment variables for database connection.',
  );
}
if (isProduction && !instanceUnixSocket) {
  throw new Error('INSTANCE_UNIX_SOCKET is required in production.');
}
if (!isProduction && !host) {
  throw new Error('DB_HOST is required in development.');
}

// production: Unix socket via Cloud SQL proxy
// development: TCP with SSL
const dialectOptions = isProduction
  ? { socketPath: instanceUnixSocket }
  : { ssl: { rejectUnauthorized: false } };

const sequelize = new Sequelize(database, username, password, {
  host: isProduction ? instanceUnixSocket : host,
  port: isProduction ? undefined : port,
  dialect: 'postgres',
  dialectOptions,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: isProduction ? false : (msg) => console.log(chalk.gray(msg)),
});

// export a function to connect, rather than connecting immediately
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      chalk.magentaBright(
        `\nConnection to PostgreSQL database '${database}' established successfully.\n`,
      ),
    );
  } catch (error) {
    console.error(
      chalk.red(`\nUnable to connect to the database: ${error.message}\n`),
    );
    throw error; // let caller decide how to handle
  }
};

// export the sequelize instance AND the connection function
export { sequelize, connectToDatabase };
