const {Pool} = require('pg')

const pool = new Pool({
   user: process.env.DB_USER || 'CRM_db',
   password: process.env.DB_PASSWORD || 'CRM1107',
   host: process.env.DB_HOST || 'localhost',
   port: process.env.DB_PORT || 5432,
   database: process.env.DB_NAME || 'CRM_Project'
})

module.exports = pool;