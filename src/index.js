import Express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./router/router.js";
import "dotenv/config";
import "./database/database.js";
import { Logger } from "@senka/logger";

const app = Express();

app
  .use(cors())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(router)
  .listen(3000, () => new Logger({ time: true }).log("http://localhost:3000"));
