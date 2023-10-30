import { Router } from "express";
import studentSchema from "../database/schema/studentSchema.js";
import { hash, compare } from "bcrypt";
import fs from "fs";
import { Logger } from "@senka/logger";
const router = Router();
const logger = new Logger({ time: true });
function generateRandomToken(length) {
  if (!length || isNaN(length)) length = 30;
  if (length < 10) length = 10;
  let token = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const stdStrt = ["StD", "sTd", "STd", "stD"];
  token += stdStrt[Math.floor(Math.random() * stdStrt.length)];
  for (let i = 0; i < length - 3; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
}

router.post("/students", async (req, res) => {
  try {
    const { name, surname, password, email } = req.body;
    let errors = [];
    let emails = (await studentSchema.find({})).map((e) => e.email);

    if (emails.includes(email)) errors.push("Email is already used");
    if (!email || !name || !surname || !password) {
      errors.push(
        "Required parameters are missing. Please provide all necessary information."
      );
    }
    if (errors.length !== 0) {
      res.status(400).json({ errors: errors });
    } else {
      hash(password, 10, async (err, hash) => {
        if (err) return res.status(500).json({ errors: [err] });
        const student = new studentSchema({
          email: email,
          name: name,
          surname: surname,
          password: hash,
          id: Math.round(Date.now() * Math.random()),
          token: generateRandomToken(30),
        });
        await student.save().then((a) => {
          res.status(201).json({
            messages: ["Registered successful"],
            data: {
              name: a.name,
              surname: a.surname,
              email: a.email,
              token: a.token,
              id: a.id,
            },
          });
        });
      });
    }
  } catch (err) {
    logger.error(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let errors = [];
    let emails = (await studentSchema.find({})).map((e) => e.email);

    if (email && !emails.includes(email))
      errors.push("There are no students registered to email");
    if (!email || !password) {
      errors.push(
        "Required parameters are missing. Please provide all necessary information."
      );
    }
    if (errors.length !== 0) return res.status(400).json({ errors: errors });

    const student = await studentSchema.findOne({ email: email });
    if (student === null)
      return res.status(404).json({ errors: ["Student not found"] });
    compare(password, student.password, (err, _res) => {
      if (err) return res.status(500).json({ errors: [err] });
      else if (_res) {
        return res
          .status(200)
          .json({ messages: ["Login successful"], token: student.token });
      } else return res.status(401).json({ errors: ["Incorrect password"] });
    });
  } catch (err) {
    logger.error(err);
  }
});

router.get("/students", async (req, res) => {
  try {
    const { token } = req.query;
    const student = await studentSchema.findOne({ token: token });
    if (student === null)
      return res.status(404).json({ errors: ["Student not found"] });
    const data = (await studentSchema.findById(student._id)).toJSON();
    delete data.__v;
    delete data.password;
    delete data.token;
    data.avatarUrl = `http://${req.hostname}:${process.env.port}/avatars/${student.id}.png`;
    res.status(200).json({ messages: ["Data sended"], data: data });
  } catch (err) {
    logger.error(err);
  }
});

router.delete("/students", async (req, res) => {
  try {
    const { token, password, email } = req.body;
    const student = await studentSchema.findOne({ token: token, email });
    if (student === null)
      return res
        .status(400)
        .json({ errors: ["Parameters are missing or incorrect"] });
    compare(password, student.password, async (err, _res) => {
      if (err) return res.status(500).json({ errors: [err] });
      else if (_res) {
        await studentSchema
          .deleteOne({
            email: student.email,
            name: student.name,
            surname: student.surname,
            token: student.token,
            id: student.id,
            password: student.password,
          })
          .then((d) => {
            res.status(200).json({ messages: ["Deletion successful"] });
          });
      } else return res.status(401).json({ errors: ["Incorrect password"] });
    });
  } catch (err) {
    logger.error(err);
  }
});

router.post("/avatar", async (req, res) => {
  const base64Image = req.body.image.replace(/^data:image\/\w+;base64,/, "");
  await studentSchema.findOne({ token: req.body.token }).then((student) => {
    fs.writeFile(
      `./avatars/${student.id}.png`,
      base64Image,
      { encoding: "base64" },
      function (err) {
        if (err) {
          res.status(500).json({
            errors: [
              "An unknown error was encountered",
              "Avatar update failed",
            ],
          });
        } else {
          res.status(200).json({ messages: ["Avatar updated successfully"] });
        }
      }
    );
  });
});
export default router;
