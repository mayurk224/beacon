import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
import config from "./config.js";
setServers(["1.1.1.1", "8.8.8.8"]);

function connectDB() {
  if (!config.MONGO_URL) {
    throw new Error("MONGO_URL is not defined");
  }
  mongoose
    .connect(config.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));
}

export default connectDB;
