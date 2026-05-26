import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import MsgReader from "msgreader";
import Tesseract from "tesseract.js";

export const extractTextFromFile = async (
  filePath: string,
  originalName: string
): Promise<string> => {
  try {
    const ext = path
      .extname(originalName)
      .toLowerCase();

    // txt
    if (ext === ".txt") {
      const buffer = fs.readFileSync(filePath);

      return (
        buffer.toString("utf-8").trim() ||
        "TXT file is empty."
      );
    }

    //DOCX
    if (ext === ".docx") {
      const result =
        await mammoth.extractRawText({
          path: filePath,
        });

      return (
        result.value ||
        "DOCX extraction failed."
      );
    }

    /* =========================
       PDF
    ========================= */
    if (ext === ".pdf") {
      const data = new Uint8Array(
        fs.readFileSync(filePath)
      );

      const pdf =
        await pdfjsLib.getDocument({
          data,
        }).promise;

      let text = "";

      for (
        let i = 1;
        i <= pdf.numPages;
        i++
      ) {
        const page = await pdf.getPage(i);

        const content =
          await page.getTextContent();

        const strings = content.items.map(
          (item: any) => item.str
        );

        text += strings.join(" ") + "\n";
      }

      return text;
    }

    //MSG
    if (ext === ".msg") {
      const buffer = fs.readFileSync(filePath);

      const msg = new MsgReader(buffer);

      const data = msg.getFileData();

      let body: any =
        data.body ||
        data.text ||
        data.html ||
        "";

      if (Buffer.isBuffer(body)) {
        body = body.toString("utf-8");
      }

      if (typeof body === "object") {
        body =
          body.html ||
          body.text ||
          "";
      }

      body = String(body);

      body = body
        .replace(/<[^>]*>/g, "")
        .trim();

      return body || "Empty email.";
    }

    // Images (OCR)
    if (
      ext === ".jpg" ||
      ext === ".jpeg" ||
      ext === ".png"
    ) {
      const result =
        await Tesseract.recognize(
          filePath,
          "eng"
        );

      return (
        result.data.text ||
        "No readable text found."
      );
    }

    return "Unsupported file type.";
  } catch (error) {
    console.error(
      "File extraction error:",
      error
    );

    return "Failed to extract file.";
  }
};