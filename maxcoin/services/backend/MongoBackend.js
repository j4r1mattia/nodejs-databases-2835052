/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const { MongoClient } = require("mongodb");
const CoinAPI = require("../CoinAPI");

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.mongoUrl = "mongodb://localhost:37017/maxcoin";
    this.client = null;
    this.collection = null;
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoUrl);
    try {
      this.client = await mongoClient.connect();
      this.collection = this.client.db("maxcoin").collection("values");
      return this.client;
    } catch (e) {
      console.error(`ERROR: ${e}`);
      throw e;
    }
  }

  async disconnect() {
    if (this.client) {
      return this.client.close();
    }
    return false;
  }

  async insert() {
    const data = await new CoinAPI().fetch();
    const documents = [];
    Object.entries(data.bpi).forEach(([date, value]) =>
      documents.push({ date, value })
    );

    return this.collection.insertMany(documents);
  }

  async getMax() {
    return this.collection.findOne({}, { sort: { value: "desc" } });
  }

  async max() {
    console.info("Connection to Mongo DB");
    console.time("mongodb-connect");

    await this.connect();
    console.info("Succesfully connected to Mongo DB");
    console.timeEnd("mongodb-connect");

    console.info("Inserting into Db");
    console.time("mongodb-insert");
    const insertResult = await this.insert();
    console.info(`Inserted ${insertResult.insertedCount} documents into Db`);
    console.timeEnd("mongodb-insert");

    console.info("get max value");
    console.time("mongodb-query-max");
    const { date, value } = await this.getMax();
    console.timeEnd("mongodb-query-max");

    console.info("Disconnection to Mongo DB");
    console.time("mongodb-disconnect");

    await this.disconnect();
    console.info("Succesfully disconnected to Mongo DB");
    console.timeEnd("mongodb-disconnect");

    return { date, value };
  }
}

module.exports = MongoBackend;
