import mysql from "mysql";

let connection;
connection = mysql.createConnection({
    host    : 'localhost',
    port    : '3306',
    user    : 'root',
    password: '',
    database: 'data',
});
connection.connect();
connection.query(
  `SELECT * FROM data.user;`,
  function(error, results, fields) {
    if (error) throw error;
    console.log(`results`, results);
    console.log(`fields`, fields);
  }
);
connection.end();
