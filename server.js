const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(cors());

app.post("/api/referrals", async (req, res) => {
  const {
    referrerName,
    referrerEmail,
    refereeName,
    refereeEmail,
    course,
    message,
  } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: "lavaraju.gorli4149@gmail.com",
    to: refereeEmail,
    subject: "Referral Notification",
    text: `You have been referred to the course: ${course} by ${referrerName}. Message: ${message}`,
  };

  try {
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Save referral to database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        course,
        message,
      },
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error("Error saving referral:", error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
