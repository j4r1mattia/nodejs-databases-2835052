const MongoBackend = require("./services/backend/MongoBackend");
const RedisBackend = require("./services/backend/RedisBackend");
const MySqlBackend = require("./services/backend/MySQLBackend");

async function runMongo() {
  const backend = new MongoBackend();
  return backend.max();
}

async function runRedis() {
  const backend = new RedisBackend();
  return backend.max();
}

async function runMySql() {
  const backend = new MySqlBackend();
  return backend.max();
}

runMySql()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.error(err));
