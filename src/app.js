const express = require("express");
const mailer = require("nodemailer");
const path = require("path");
const app = express();
const port = process.env.PORT || 8000;

require("dotenv").config();
require("./db/conn");
const Send = require("./models/users");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const static_path = path.join(__dirname, "../public");

app.use(express.static(static_path));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Create a new user in our database

let userDetail;
app.post("/", async (req, res) => {
  try {
    userDetail = new Send({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
    });

    const submitted = await userDetail.save();
    res.status(201).render("app.ejs");

    // Send Email
    const transporter = mailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let body = {
      from: req.body.email,
      to: process.env.EMAIL_USER,
      subject: `Contact Request from  ${req.body.name}`,
      text: req.body.message,
    };

    transporter.sendMail(body, (err, result) => {
      if (err) {
        console.log(err);
        return false;
      }
      console.log(result);
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
