import { Sequelize } from 'sequelize';
import { Connector } from '@google-cloud/cloud-sql-connector';
import chalk from 'chalk';

const isProduction = process.env.NODE_ENV === 'production';

const database = process.env.PGSQL_DB_NAME;
const username = process.env.PGSQL_DB_USER;
const password = process.env.PGSQL_DB_PASSWORD;
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
const host = process.env.PGSQL_DB_HOST;
const port = process.env.PGSQL_DB_PORT ? parseInt(process.env.PGSQL_DB_PORT, 10) : 5432;

if (!database || !username || !password) {
  throw new Error('Missing one or more required environment variables for database connection.');
}
if (isProduction && !instanceConnectionName) {
  throw new Error('INSTANCE_CONNECTION_NAME is required in production.');
}
if (!isProduction && !host) {
  throw new Error('PGSQL_DB_HOST is required in development.');
}
if (!isProduction && isNaN(port)) {
  throw new Error('PGSQL_DB_PORT must be a valid number');
}

let connector;

// Create the instance synchronously so models can call .define() at import time
const sequelize = new Sequelize(database, username, password, {
  host: isProduction ? 'localhost' : host, // overridden by connector dialectOptions in prod
  port,
  dialect: 'postgres',
  dialectOptions: isProduction ? {} : { ssl: { rejectUnauthorized: false } },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: isProduction ? false : (msg) => console.log(chalk.gray(msg)),
});

const connectToDatabase = async () => {
  if (isProduction) {
    connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName,
      authType: 'IAM',
    });
    // Apply connector options to the underlying pg pool
    sequelize.config.dialectOptions = clientOpts;
    sequelize.options.dialectOptions = clientOpts;
  }

  try {
    await sequelize.authenticate();
    console.log(
      chalk.magentaBright(`\nConnection to PostgreSQL database '${database}' established successfully.\n`)
    );
  } catch (error) {
    console.error(chalk.red(`\nUnable to connect to the database: ${error.message}\n`));
    throw error;
  }
};

const closeDatabaseConnection = () => connector?.close();

export { sequelize, connectToDatabase, closeDatabaseConnection };