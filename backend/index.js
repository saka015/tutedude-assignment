import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import connect from "./db.js";
import CreateCertificateRouter from "./Routes/CreateCertificate.js";
import dotenv from "dotenv";
import cors from "cors";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

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

const filePath = path.join(__dirname, "certificate.pdf");

async function uploadFile() {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "certificate.pdf",
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
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
  } catch (error) {
    console.log(error.message);
  }
}

(async () => {
  const fileId = await uploadFile();
  if (fileId) {
    generatePublicUrl(fileId);
  } else {
    console.log("File upload failed.");
  }
})();

// Connect to the database
connect();

// Use the CreateCertificate router
app.use("/", CreateCertificateRouter);

// Set CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server Connected ${port}`);
});
