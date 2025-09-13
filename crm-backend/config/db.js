const {Pool} = require('pg')

// Use Railway's built-in DATABASE_URL or fallback to local development
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
console.log('DATABASE_URL content:', process.env.DATABASE_URL);

if (!connectionString || connectionString.includes('${{')) {
  console.error('DATABASE_URL not found or not resolved. Please check Railway service connection.');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
  throw new Error('DATABASE_URL environment variable is not properly set. Please check Railway service connection.');
}

console.log('Using database connection string:', connectionString.substring(0, 20) + '...');

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;