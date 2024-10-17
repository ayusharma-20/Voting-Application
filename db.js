const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.MONGODB_URL_LOCAL;
// const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected");
});

db.on("disconnected", () => {
  console.log("disconnected");
});

db.on("error", (err) => {
  console.log("error in connection", err);
});

module.exports = db;
