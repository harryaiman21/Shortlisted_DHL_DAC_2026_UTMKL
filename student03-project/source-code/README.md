# DHL Knowledge Base System

### AI-Powered SOP Automation | DHL Digital Automation Challenge 2026

Submitted by **Hesam Zoveidavian Poor** (A22MJ4009)  
Supervised by **Dr Harry Aiman**  
Universiti Teknologi Malaysia | May 2026

---

## Overview

This project automates the transformation of raw unstructured input into clean Standard Operating Procedure (SOP) articles for DHL logistics operations. Staff drop files into a shared Google Drive folder and the system handles everything automatically using RPA and AI.

**Input:** Teams screenshots, plain text notes, PDFs, Word documents  
**Output:** Structured SOP articles with title, summary, steps, tags, and category

---

## Tech Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| Frontend + API | Next.js 14 (TypeScript, App Router)                        |
| Database       | JSON flat-file (db.json)                                   |
| Authentication | JWT via jsonwebtoken                                       |
| AI / LLM       | OpenAI GPT-4o Mini                                         |
| RPA            | UiPath Studio (GSuite, PDF, WebAPI, UIAutomation packages) |
| OCR            | Tesseract OCR via UiPath UIAutomation Activities           |
| Styling        | Tailwind CSS + shadcn/ui                                   |

---

## Features

- JWT-secured login with role-based access control (Admin / Editor)
- Manual upload with real-time AI draft generation via OpenAI
- Draft, Reviewed, Published workflow with full status audit trail
- UiPath bot automatically fetches files from Google Drive and creates articles
- MD5 duplicate detection with 14-day processing window
- OCR processing for image files, PDF text extraction for documents
- Real-time stats dashboard with article counts by status and creator
- Clickable tags cloud, search, and multi-field filtering
- Article edit mode, clipboard copy, and browser PDF export
- UiPath run reports saved to local logs and posted to web app
- Error handling with automatic screenshots on failure

---

## UiPath Workflows

| Workflow              | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| Main.xaml             | Orchestrator, JWT login, error handling with Try-Catch                |
| FetchFromDrive.xaml   | Downloads files from Google Drive via service account                 |
| DuplicateCheck.xaml   | MD5 hash check against /api/duplicates with 14-day window             |
| ProcessContent.xaml   | Tesseract OCR for images, Read PDF Text for PDFs, plain text fallback |
| PostToWebApp.xaml     | HTTP POST to /api/articles to create article                          |
| UpdateStatus.xaml     | HTTP PATCH to confirm status and log processing timestamp             |
| SendSummaryEmail.xaml | Writes summary.txt and POSTs run log to /api/logs                     |

---

## API Endpoints

| Method | Endpoint          | Description                                     |
| ------ | ----------------- | ----------------------------------------------- |
| POST   | /api/auth         | Login, returns JWT token                        |
| GET    | /api/articles     | List articles with search and filter            |
| POST   | /api/articles     | Create new article                              |
| PATCH  | /api/articles/:id | Update article, enforces role restrictions      |
| DELETE | /api/articles/:id | Admin only delete                               |
| POST   | /api/process      | Send raw text to OpenAI, returns structured SOP |
| GET    | /api/duplicates   | Check MD5 hash within 14-day window             |
| POST   | /api/duplicates   | Register processed file hash                    |
| GET    | /api/stats        | Article counts by status and creator            |
| GET    | /api/logs         | All UiPath run logs                             |
| POST   | /api/logs         | Append run log from UiPath                      |

---

## Getting Started

**Prerequisites:** Node.js 18+, UiPath Studio, OpenAI API key, Google Service Account credentials

**1. Install dependencies**

```bash
cd web-app
npm install
```

**2. Create .env.local**

```
JWT_SECRET=dhl-kb-secret-2026
OPENAI_API_KEY=your-openai-api-key
```

**3. Start the web app**

```bash
npm run dev
```

Open http://localhost:3000

**4. Default accounts**

| Username   | Password  | Role   |
| ---------- | --------- | ------ |
| admin      | admin123  | Admin  |
| editor     | editor123 | Editor |
| uipath-bot | uipath123 | Bot    |

**5. Run UiPath**

Open the DHL_RPA project in UiPath Studio and press F5. Upload sample files to your Google Drive DHL-RPA folder first.

---

## Local Folders Required

Create these before running UiPath:

- `C:\DHL_Temp` for downloaded Drive files
- `C:\DHL_Logs` for run reports and error screenshots
- `C:\DHL_Creds\credentials.json` for Google Service Account key

---

_DHL APSSC x MJIIT Digital Automation Challenge 2026_
