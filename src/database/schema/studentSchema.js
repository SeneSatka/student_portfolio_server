import { Schema, model } from "mongoose";

export default model(
  "student",
  new Schema({
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    description: { type: String, default: "" },
  })
);
