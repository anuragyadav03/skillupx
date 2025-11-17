import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { google } from "googleapis";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -----------------------------------------------------
// LOAD ENVIRONMENT VARIABLES
// -----------------------------------------------------

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const LEAD_RECEIVER_EMAIL = process.env.LEAD_RECEIVER_EMAIL;
const LEAD_CC_EMAIL = process.env.LEAD_CC_EMAIL || "";

const PORT = process.env.PORT || 4000;

// -----------------------------------------------------
// GOOGLE SHEETS CONFIG
// -----------------------------------------------------

const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf8"));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// -----------------------------------------------------
// NODEMAILER CONFIG
// -----------------------------------------------------

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// -----------------------------------------------------
// SAVE LEAD API
// -----------------------------------------------------

app.post("/lead", async (req, res) => {
  try {
    const { name, email, phone, subjects } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, Email, Phone are required." });
    }

    // Format timestamp: DD-MM-YYYY HH:mm:ss
    const timestamp = new Date()
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      })
      .replace(/\//g, "-");

    // Write to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, email, phone, subjects || "Not Provided", timestamp]],
      },
    });

    // Send Email
    await transporter.sendMail({
      from: `SkillupX Leads <${EMAIL_USER}>`,
      to: LEAD_RECEIVER_EMAIL,
      cc: LEAD_CC_EMAIL || undefined,
      subject: "🔥 New SkillupX Lead Received",
      html: `
        <h2>New Lead Submitted</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subjects:</strong> ${subjects || "Not Provided"}</p>
        <p><strong>Submitted At:</strong> ${timestamp}</p>
      `,
    });
    console.log("Email is sent")

    return res.json({ success: true, message: "Lead saved & email sent." });

  } catch (error) {
    console.error("❌ ERROR saving lead:", error);
    return res.status(500).json({ error: "Failed to save lead." });
  }
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------

app.listen(PORT, () => {
  console.log(`🚀 SkillupX Lead Server is running on http://localhost:${PORT}`);
  console.log("✔ .env variables loaded successfully");
  console.log("✔ Google Sheet + Email services ready");
});
