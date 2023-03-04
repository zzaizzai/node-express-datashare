const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    dateStrings: true,
});

function getTest(callback) {
    connection.query('select * from test',
        (error, results) => {
            if (error) throw error;
            callback(results)
        }
    )
}

function getAllData(callback) {
    connection.query(
        'select * from data order by datetime_create',
        (error, results) => {
            if (error) throw error;
            callback(results)
        }
    )
}

function getOneData(name, callback) {
    connection.query(
        `select *, data.name as data_name, users.name  as user_name 
        from data inner join users on data.user_id_create = users.id 
        where data.name  = ?`, [name],
        (error, results) => {
            if (error) throw error;
            callback(results)
        }
    )
}

function createDate(data_name, user_id, callback) {

    var newData = {
        name: data_name,
        user_id_create: user_id,
        datetime_create: new Date()
    }

    connection.query(
        `insert into data set ?`, newData,
        (error, results) => {
            if (error) throw error;
            callback(results)
        }

    )
}


module.exports = {
    getTest, getAllData, getOneData, createDate
}