const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME
});

function getTest(callback) {
    connection.query('select * from test',
    (error, results)=> {
        if (error) throw error;
        callback(results)

    })
}

module.exports = {
    getTest
}