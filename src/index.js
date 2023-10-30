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
  .use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))
  .use(router)
  .use("/avatars", Express.static("avatars"))
  .listen(process.env.port, () =>
    new Logger({ time: true }).log(`http://localhost:${process.env.port}`)
  );
