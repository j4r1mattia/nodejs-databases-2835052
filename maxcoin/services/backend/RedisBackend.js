/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const Redis = require("ioredis");
const CoinAPI = require("../CoinAPI");

class RedisBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.client = null;
  }

  async connect() {
    this.client = new Redis(7379);
    return this.client;
  }

  async disconnect() {
    return this.client.disconnect();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const values = [];
    Object.entries(data.bpi).forEach(([key, value]) => {
      values.push(value);
      values.push(key);
    });
    return this.client.zadd("maxcoin:values", values);
  }

  async getMax() {
    return this.client.zrange("maxcoin:values", -1, -1, "WITHSCORES");
  }

  async max() {
    console.info("Connection to Redis");
    console.time("redis-connect");

    const client = this.connect();
    if (client) {
      console.info("Succesfully connected to Redis");
    } else {
      throw Error("ERROR: Inable to connect to Redis");
    }
    console.timeEnd("redis-connect");

    console.info("Inserting into Db");
    console.time("redis-insert");
    const insertResult = await this.insert();
    console.info(`Inserted ${insertResult} documents into Db`);
    console.timeEnd("redis-insert");

    console.info("get max value");
    console.time("redis-query-max");
    const result = await this.getMax();
    console.timeEnd("redis-query-max");

    console.info("Disconnection to Redis");
    console.time("redis-disconnect");

    await this.disconnect();
    console.info("Succesfully disconnected to Redis");
    console.timeEnd("redis-disconnect");

    return result;
  }
}

module.exports = RedisBackend;
