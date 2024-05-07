import express from "express";
import Certificate from "../models/Certificate.js";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const router = express.Router();

// Google Drive API setup
// Google Drive API setup
const CLIENT_ID =
  "14373927613-f04ajcs2tceegtdh9a13t63ba2ob4uag.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04JWgsgiPL7sNCgYIARAAGAQSNwF-L9Ir1_EsG_c3E2a9bTJ5rk-UAaPHmsxZOvdmZBHdOu7nRDWHiKZI45WPHzl5GBtjjfWcZx8";
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

console.log("i was here");

router.post("/", async (req, res) => {
  console.log("post received");

  try {
    const { name, pdfBytes } = req.body;

    // Upload the PDF to Google Drive
    const fileId = await uploadFile(pdfBytes);
    console.log("inside router");
    if (!fileId) {
      return res
        .status(500)
        .json({ error: "Failed to upload PDF to Google Drive" });
    }

    // Generate a public URL for the PDF
    const publicUrl = await generatePublicUrl(fileId);
    if (!publicUrl) {
      return res
        .status(500)
        .json({ error: "Failed to generate public URL for the PDF" });
    }

    // Save certificate details to MongoDB
    const certificate = new Certificate({ name, url: publicUrl });
    await certificate.save();

    res
      .status(201)
      .json({ message: "Certificate details saved successfully!" });
  } catch (error) {
    console.error("Error saving certificate details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function uploadFile(pdfBytes) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "certificate.pdf",
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: new Uint8Array(pdfBytes),
      },
    });

    return response.data.id; // Return file ID
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function generatePublicUrl(fileId) {
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });
    const publicUrl = result.data.webViewLink;
    console.log(publicUrl);
    return publicUrl;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

export default router;
