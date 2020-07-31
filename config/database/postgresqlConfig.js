const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "feemanagementdb",
  password: "vatsal09",
  port: 5432,
});
pool.query("SELECT NOW()", (err, res) => {
  try {
    console.log("PostgreSQL Database Connected ", res.rows[0]);
  } catch (err) {
    console.log("Error in connecting to PostgreSQL Database", err.stack);
  }
});

module.exports = pool;
