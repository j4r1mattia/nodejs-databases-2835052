/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const mysql = require("mysql2/promise");
const CoinAPI = require("../CoinAPI");

class MySQLBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: "localhost",
      port: 3406,
      user: "root",
      password: "mypassword",
      database: "maxcoin",
    });
    return this.connection;
  }

  async disconnect() {
    return this.connection.end();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const sql = "insert into coinvalues (valuedate, coinvalue) values ?";
    const values = [];
    Object.entries(data.bpi).forEach(([date, value]) => {
      values.push([date, value]);
    });
    return this.connection.query(sql, [values]);
  }

  async getMax() {
    return this.connection.query(
      "select * from coinvalues order by coinvalue desc limit 0,1"
    );
  }

  async max() {
    console.info("Connection to mysql");
    console.time("mysql-connect");

    const client = this.connect();
    if (client) {
      console.info("Succesfully connected to mysql");
    } else {
      throw Error("ERROR: Inable to connect to mysql");
    }
    console.timeEnd("mysql-connect");

    console.info("Inserting into Db");
    console.time("mysql-insert");
    const insertResult = await this.insert();
    console.info(`Inserted ${insertResult[0].affectedRows} documents into Db`);
    console.timeEnd("mysql-insert");

    console.info("get max value");
    console.time("mysql-query-max");
    const result = await this.getMax();
    const row = result[0][0];
    console.timeEnd("mysql-query-max");

    console.info("Disconnection to mysql");
    console.time("mysql-disconnect");

    await this.disconnect();
    console.info("Succesfully disconnected to mysql");
    console.timeEnd("mysql-disconnect");

    return row;
  }
}

module.exports = MySQLBackend;
