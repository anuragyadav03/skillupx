// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------------------
// ENV / CONFIG
// ---------------------------
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  OAUTH_REDIRECT_URI = "https://developers.google.com/oauthplayground",
  EMAIL_USER, // sender e.g. service@yourdomain.com
  GOOGLE_SHEET_ID,
  LEAD_RECEIVER_EMAIL,
  LEAD_CC_EMAIL = "",
  PORT = 4000,
} = process.env;

// Minimal validation
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !EMAIL_USER) {
  console.error("🚫 Missing one of required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, EMAIL_USER");
  process.exit(1);
}

// ---------------------------
// OAUTH2 CLIENT (used for Sheets + Gmail)
// ---------------------------
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  OAUTH_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

// Create Sheets client authenticated with the same OAuth2 client
const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

// Helper: create nodemailer transporter using a fresh access token
async function createTransporter() {
  // getAccessToken returns either string or { token, res } depending on lib version
  const accessTokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token ?? accessTokenResponse;

  if (!accessToken) {
    throw new Error("Failed to obtain access token from OAuth2 client.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_USER,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GOOGLE_REFRESH_TOKEN,
      accessToken, // fresh token
    },
  });
}

// ---------------------------
// API: Save Lead
// ---------------------------
app.post("/lead", async (req, res) => {
  try {
    const { name, email, phone, subjects } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, Email, Phone are required." });
    }

    // Format timestamp: DD-MM-YYYY HH:mm:ss in IST
    const timestamp = new Date()
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      })
      .replace(/\//g, "-");

    // Append to Google Sheet if GOOGLE_SHEET_ID provided
    if (GOOGLE_SHEET_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: "Sheet1!A:E",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[name, email, phone, subjects || "Not Provided", timestamp]],
          },
        });
      } catch (sheetErr) {
        console.error("⚠️ Warning: failed to append to Google Sheet:", sheetErr);
        // continue to sending email even if sheet append fails
      }
    }

    // Send email via OAuth2
    const transporter = await createTransporter();

    const mailOptions = {
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info?.messageId ?? info);

    return res.json({ success: true, message: "Lead saved & email sent." });
  } catch (error) {
    console.error("❌ ERROR saving lead / sending email:", error);
    return res.status(500).json({ error: "Failed to save lead." });
  }
});

// ---------------------------
// START
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 Lead Server running on http://localhost:${PORT}`);
  console.log("✔ Using OAuth2 for Gmail + Sheets (no credentials.json required)");
});
