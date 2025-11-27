require("dotenv").config();
const {Pool} = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ưu tiên
  max: 20,                // số connection tối đa
  idleTimeoutMillis: 30000, // 30s -- release idle clients
  connectionTimeoutMillis: 2000, // 2s -- thời gian chờ kết nối    
})
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;