import { Request, Response } from "express";
import db from "../config/db";
import path from "path";
import { generateStructuredKB } from "../services/llmService";
import { extractTextFromFile } from "../utils/fileExtractor";
import { cleanText } from "../utils/textCleaner";


export const getArticles = (req: Request, res: Response) => {
  const sql = "SELECT * FROM articles ORDER BY updatedAt DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to fetch articles" });
    }

    res.json(results);
  });
};


export const getArticleById = (req: Request, res: Response) => {
  const sql = "SELECT * FROM articles WHERE id = ?";

  db.query(sql, [req.params.id], (err, results: any) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to fetch article" });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(results[0]);
  });
};


export const createArticle = (req: Request, res: Response) => {
  const { title, content, status } = req.body;

  const sql = `
    INSERT INTO articles (title, content, status)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [title, content, status], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to create article" });
    }

    res.status(201).json({ message: "Article created successfully" });
  });
};


export const updateArticle = (req: Request, res: Response) => {
  const { title, content, status } = req.body;

  const sql = `
    UPDATE articles
    SET title = ?, content = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [title, content, status, req.params.id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to update article" });
    }

    res.json({ message: "Article updated successfully" });
  });
};


export const deleteArticle = (req: Request, res: Response) => {
  const sql = "DELETE FROM articles WHERE id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to delete article" });
    }

    res.json({ message: "Article deleted successfully" });
  });
};


export const searchArticles = (req: Request, res: Response) => {
  const { query, status, dateFrom, dateTo } = req.query;

  let sql = "SELECT * FROM articles WHERE 1=1";
  const values: any[] = [];

  if (query) {
    sql += " AND (title LIKE ? OR content LIKE ?)";
    values.push(`%${query}%`, `%${query}%`);
  }

  if (status && status !== "all") {
    sql += " AND status = ?";
    values.push(status);
  }

  if (dateFrom) {
    sql += " AND DATE(createdAt) >= ?";
    values.push(dateFrom);
  }

  if (dateTo) {
    sql += " AND DATE(createdAt) <= ?";
    values.push(dateTo);
  }

  sql += " ORDER BY updatedAt DESC";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to search articles" });
    }

    res.json(results);
  });
};


export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.filename
    );

    console.log("📥 Upload received:", file.originalname);

    /* STEP 1 — CREATE ARTICLE FIRST */
    const insertSql = `
      INSERT INTO articles (title, content, status)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [file.originalname, "", "processing"], (err, result: any) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "DB error" });
      }

      const articleId = result.insertId;

      /* STEP 2 — RESPOND IMMEDIATELY */
      res.status(200).json({
        message: "Upload successful. Processing started.",
        articleId,
      });

      /* STEP 3 — BACKGROUND PROCESS */
      processFileInBackground(filePath, file.originalname, articleId);
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed" });
  }
};


const processFileInBackground = async (
  filePath: string,
  originalName: string,
  articleId: number
) => {
  try {
    console.log("🧠 Processing started:", originalName);

    let text = await extractTextFromFile(filePath, originalName);

    console.log("📄 Extracted text length:", text.length);

    text = cleanText(text);

    if (text.length > 2500) {
      console.log("⚠️ trimming text");
      text = text.slice(0, 2500);
    }

    const structured = await generateStructuredKB(text);

    console.log("✅ AI finished:", structured.title);

    const updateSql = `
      UPDATE articles
      SET 
        title = ?, 
        content = ?, 
        summary = ?, 
        steps = ?, 
        roles = ?, 
        keyPoints = ?, 
        risks = ?, 
        notes = ?, 
        status = ?
      WHERE id = ?
    `;

    db.query(updateSql, [
      structured.title || originalName,
      JSON.stringify(structured),
      structured.summary || "",
      JSON.stringify(structured.steps || []),
      JSON.stringify(structured.roles || []),
      JSON.stringify(structured.keyPoints || []),
      JSON.stringify(structured.risks || []),
      structured.notes || "",
      "completed",
      articleId,
    ]);

  } catch (error) {
    console.log("❌ AI ERROR:", error);

    db.query(
      "UPDATE articles SET status = ? WHERE id = ?",
      ["failed", articleId]
    );
  }
};