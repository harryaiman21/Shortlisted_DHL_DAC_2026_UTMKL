import express from "express";
import { verifyToken } from "../middleware/authMiddleware";

import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles,
  uploadFile,
} from "../controllers/articleController";

import { upload } from "../middleware/upload";

const router = express.Router();

router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadFile
);


router.get(
  "/search",
  verifyToken,
  searchArticles
);


// GET ALL ARTICLES
router.get(
  "/",
  verifyToken,
  getArticles
);

// GET ARTICLE BY ID
router.get(
  "/:id",
  verifyToken,
  getArticleById
);

// CREATE ARTICLE
router.post(
  "/",
  verifyToken,
  createArticle
);

// UPDATE ARTICLE
router.put(
  "/:id",
  verifyToken,
  updateArticle
);

// DELETE ARTICLE
router.delete(
  "/:id",
  verifyToken,
  deleteArticle
);

export default router;