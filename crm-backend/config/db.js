const {Pool} = require('pg')

// Use Railway's built-in DATABASE_URL if available, otherwise use custom variables
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

let pool;

if (connectionString) {
  // Use Railway's built-in database connection
  pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  // Fallback to custom variables
  pool = new Pool({
    user: process.env.DB_USER || 'CRM_db',
    password: process.env.DB_PASSWORD || 'CRM1107',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'CRM_Project'
  });
}

module.exports = pool;