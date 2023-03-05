const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    dateStrings: true,
    multipleStatements: true,
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
        'select * from data order by datetime_create desc ',
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
            callback(results[0])
        }
    )
}

function getNewstVersion(data_name, callback) {
    var sql_data_version = `SELECT max(version) as max_version from history where parent_data = ?`
    var sqls_data_version = mysql.format(sql_data_version, [data_name])

    connection.query(sqls_data_version, (error, results) => {
        if (error) throw error;
        callback(results[0]["max_version"])
    })
}

function getContentAndHistories(data_name, version, callback) {

    var sql_histories = `select * from history where history.parent_data = ? order by version desc;`
    var sqls_histories = mysql.format(sql_histories, [data_name])

    var sql_content;

    if (version == -1) {
        // the newest
        var sql_content = `SELECT * , max(version) as max_version  from  contents where version = (SELECT max(version) from contents where parent_data = ? );`
    } else {
        var sql_content = `SELECT *  from contents where contents.parent_data = ? and version  = ?;`
    }

    var sqls_contens = mysql.format(sql_content, [data_name, version])

    var sql3 = `SELECT max(version) as max_version from history where parent_data = ? ;`
    var sql3s = mysql.format(sql3, [data_name])


    connection.query(
        sqls_histories + sqls_contens + sql3s, (error, results) => {
            if (error) throw error;
            callback(results)
        }

    )
}

function createOneData(data_name, user_id, callback) {

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
    getTest, getAllData, getOneData, createOneData, getContentAndHistories, getNewstVersion
}