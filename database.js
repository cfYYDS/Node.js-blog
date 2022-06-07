const mysql = require('mysql');
const config = require('./config');

// 连接数据库
const database = mysql.createConnection({
  host: config.host,
  user: config.user,
  port: config.port,
  password: config.password,
  database: config.database
});

database.connect();

module.exports = database;