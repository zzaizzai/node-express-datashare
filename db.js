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

function newHistoryOfData(version, parent_data, text, user_id, callback) {

    var sql = `insert into history (version, parent_data , text, user_id_create) values ?; `
    var values =
        [
            [version, parent_data, text, "1"]
        ]

    connection.query(sql, [values], (error, results) => {
        if (error) throw error;
        callback(results)
    }

    )
}

function saveMethodsAndValues(parent_data, version_int, methods, values, user_id) {

    console.log(methods)
    const sql = `insert into contents ( parent_data , version, method, value,  user_id_create) values ?; `
    const values_for_sql = []
    for (var i = 0; i < methods.length; i++) {
        values_for_sql.push([parent_data, version_int, methods[i], values[i], user_id])
    }

    console.log(values_for_sql)
    connection.query(sql, [values_for_sql, (error, results) => {
        if (error) throw error;
        console.log(results)
    }])

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

function getResearchData(search_text, callback) {
    const sql = `select * from data  where name like ? order by datetime_create desc`
    const sqls = mysql.format(sql, ["%" + search_text + "%"])

    connection.query(sqls, (error, results) => {
        if (error) throw error;
        callback(results)
    }
    )
}

function getOneData(name, callback) {

    const sql = `select *, data.name as data_name, users.name  as user_name 
    from data inner join users on data.user_id_create = users.id 
    where data.name  = ?`
    const sqls = mysql.format(sql, [name])

    connection.query(sqls, (error, results) => {
        if (error) throw error;
        callback(results[0])
    })
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

    let sql_histories = `select *, users.name as user_name from history 
    left join users on history.user_id_create = users.id 
    where history.parent_data = ? 
    order by history.version  DESC ;`
    sql_histories = mysql.format(sql_histories, [data_name])

    let sql_content;

    if (version == -1) {
        // the newest
        sql_content = `SELECT * from contents where version = (SELECT max(version) from contents where parent_data = ? ) and parent_data = ? ;`
        sql_content = mysql.format(sql_content, [data_name, data_name])

    } else {
        sql_content = `SELECT *  from contents where contents.parent_data = ? and version  = ?;`
        sql_content = mysql.format(sql_content, [data_name, version])
    }

    var sql3 = `SELECT  max(version) as max_version from history where parent_data = ? ;`
    var sql3s = mysql.format(sql3, [data_name])

    connection.query(
        sql_histories + sql_content + sql3s, (error, results) => {
            if (error) throw error;
            callback(results)
        }

    )
}

function createOneData(data_name, user_id, callback) {

    var newData = {
        name: data_name,
        user_id_create: user_id,
    }

    sql_insert = `insert into data set ?;`
    sqls_insert = mysql.format(sql_insert, newData)

    var newHistory = {
        parent_data: data_name,
        version: 0,
        text: "created",
        user_id_create: 1
    }

    sql_history = mysql.format(`insert into history set ?;`, newHistory)


    connection.query(
        sqls_insert + sql_history,
        (error, results) => {
            if (error) throw error;
            callback(results)
        }

    )
}


module.exports = {
    getTest, getAllData, getOneData,
    createOneData, getContentAndHistories,
    getNewstVersion, newHistoryOfData,
    saveMethodsAndValues, getResearchData
}