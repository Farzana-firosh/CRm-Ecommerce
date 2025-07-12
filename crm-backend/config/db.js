const {Pool} = require('pg')

const pool = new Pool({
   user:'CRM_db',
   password:'CRM1107',
   host:'localhost',
   port:5432,
   database:'CRM_Project'
})

module.exports = pool;