const {Pool} = require('pg')

// Use Railway's built-in DATABASE_URL or fallback to local development
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found. Available env vars:', Object.keys(process.env));
  throw new Error('DATABASE_URL environment variable is not set. Please connect your Postgres service to this service.');
}

console.log('Using database connection string:', connectionString.substring(0, 20) + '...');

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;