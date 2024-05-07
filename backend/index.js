import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import Certificate from "./models/Certificate.js";
import connectDB from "./db.js";
import CreateCertificateRouter from "./Routes/CreateCertificate.js";

dotenv.config();

const app = express();
app.use(cors());


// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Google Drive API setup?add

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

const filePath = path.join(process.cwd(), "certificate.pdf");

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

// Connect to the database
await connectDB();

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
const port = 5000;
app.listen(port, () => {
  console.log(`✅ Server Connected ${port}`);
});
