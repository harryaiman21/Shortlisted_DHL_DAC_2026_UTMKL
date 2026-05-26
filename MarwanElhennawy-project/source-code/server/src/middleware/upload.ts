import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ensure uploads folder exists at runtime
const uploadPath = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Allowed file types (DHL use case)
const allowedExtensions = [
  ".txt",
  ".docx",
  ".pdf",
  ".msg",
  ".jpg",
  ".jpeg",
  ".png"
];

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    cb(null, uploadPath);
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    // FIX: prevent weird names like .docx.pdf
    const originalName = path
      .parse(file.originalname)
      .name;

    const extension = path.extname(file.originalname);

    const safeName =
      Date.now() +
      "-" +
      originalName.replace(/\s+/g, "-") +
      extension;

    cb(null, safeName);
  },
});

// FILE FILTER
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (optional but good)
  },
});