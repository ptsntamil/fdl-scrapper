const mysql = require("mysql");
const { sql } = require("../config");
const util = require("util");

function connection() {
  //Create connection
  const conn = mysql.createConnection({
    host: sql.server,
    user: sql.user,
    password: sql.password,
    database: sql.database,
  });

  //connect to database
  conn.connect((err) => {
    if (err) throw err;
    console.log("Mysql Connected...");
  });
  return {
    query(sql, args) {
      return util.promisify(conn.query).call(conn, sql, args);
    },
    close() {
      return util.promisify(conn.end).call(conn);
    },
  };
}

exports.mysql = {
  connection,
};
