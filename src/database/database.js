import { Logger } from "@senka/logger";
const logger = new Logger({ time: true });
import mongoose from "mongoose";
const connectUrl = `mongodb+srv://${process.env.database_username}:${process.env.database_password}@cluster0.nyoqfvm.mongodb.net/student_portfolio?retryWrites=true&w=majority`;
mongoose.connect(connectUrl);
const db = mongoose.connection;
db.on("error", (...args) => {
  logger.error("Connection error: ", ...args);
});
db.once("open", function () {
  logger.log("Successfully connected to the database");
});
db.on("disconnected", (err) => {
  logger.warn("Database disconnected!");
  mongoose.connect(connectUrl);
});
