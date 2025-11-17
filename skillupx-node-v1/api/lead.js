import { google } from "googleapis";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // CORS — allow all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, phone, subjects } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, Email, Phone required." });
    }

    const timestamp = new Date()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })
      .replace(/\//g, "-");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [name, email, phone, subjects || "Not Provided", timestamp],
        ],
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `SkillupX Leads <${process.env.EMAIL_USER}>`,
      to: process.env.LEAD_RECEIVER_EMAIL,
      cc: process.env.LEAD_CC_EMAIL || undefined,
      subject: "New SkillupX Lead",
      html: `
        <h3>New Lead</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subjects:</strong> ${subjects || "Not Provided"}</p>
        <p><strong>Submitted At:</strong> ${timestamp}</p>
      `,
    });

    console.log(`📧 Email sent for lead: ${name} (${email}) to: [${process.env.LEAD_RECEIVER_EMAIL}, ${process.env.LEAD_CC_EMAIL}]`);

    return res.json({ success: true, message: "Lead saved & email sent." });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Failed to save lead." });
  }
}
