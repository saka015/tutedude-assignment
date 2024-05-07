import express from "express";
import certificate from "../models/Certificate.js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post(
  "/",

  async (req, res) => {
    try {
      await certificate.create({
        name: req.body.name,
        url: req.body.url,
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.json({ success: false });
    }
  }
);

export default router;
