const cors = require("cors");
const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const certificateRouter = require("./routes/certificate.routes.js");

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

    // console.log(response.data);
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

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/", certificateRouter);

module.exports = app;
