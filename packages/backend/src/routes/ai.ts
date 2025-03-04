import express from "express"; // Import necessary types
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { Server } from "socket.io";

/* i'm rlly not sure why we need this file setup
*
const ai = express.Router();
let io: Server | null = null;

// File upload setup
const uploadDir = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// this route needs to be reworked into a socket event...
// this whole route is borked atm
ai.post(
  "/styleguide",
  upload.single("uploadedFiles"), // Multer middleware for file upload
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // await uploadStyleGuide(req, res, io); // need a socket here...
    } catch (error) {
      next(error); // Forward error to the global error handler
    }
  }
);
*/
