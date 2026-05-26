# DHL AI-Powered Incident Reporting & Resolution System
**DAC 3.0 Challenge — Scenario 2 | SECJ 3483 Web Technology | Universiti Teknologi Malaysia**

---

## What This System Does

DHL Customer Support receives incident reports daily from messy, inconsistent sources — emails, chat messages, phone notes, damaged parcel photos, and handwritten warehouse instructions. This system automates the full pipeline:

1. **Ingestion** — Staff paste raw text or upload PDF/DOCX files; UiPath bot reads files from a local folder automatically
2. **AI Classification** — Offline AI model (`distilbart-mnli-12-3`) reads the raw content and auto-assigns category, priority, title, and a clean structured summary
3. **Duplicate Detection** — AI checks incoming content against all existing unresolved incidents and flags duplicates before saving
4. **Tracking** — Every incident moves through a status workflow (`Draft → Reviewed → Published` and `Open → In Progress → Resolved`) with full audit history
5. **Reporting** — Analytics dashboard shows breakdowns by category, priority, and resolution status

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, React Router v7, Axios |
| Backend | Node.js v26 + Express 5 |
| Database | MySQL (auto-creates all tables on first run) |
| AI | `@xenova/transformers` — runs fully offline, no API key needed |
| File Parsing | `pdf2json` (PDF), `mammoth` (DOCX) |
| Export | `xlsx` (Excel), `pdfkit` (PDF), `docx` (Word) |
| Auth | JWT (24-hour tokens) + bcrypt password hashing |
| RPA | UiPath Studio 2026 Community Edition |

---

## Prerequisites

Before running this project, install:

- **Node.js v18+** — https://nodejs.org
- **MySQL 8+** — https://dev.mysql.com/downloads/mysql/ (set root password during install)
- **UiPath Studio Community** — https://www.uipath.com/developers/community-edition (for RPA component only)

---

## Setup Instructions

### Step 1 — Clone or extract the project

```
dhl-incident-system/
├── backend/
├── frontend/
├── uipath/DHL_IngestBot/
└── rpa/          ← local folders used by UiPath bot
```

### Step 2 — Configure the backend environment

Inside the `backend/` folder, create a file named `.env` with the following content:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=dhl_incidents
JWT_SECRET=any_long_random_string_here
PORT=3000
```

> The database `dhl_incidents` will be created automatically on first run. You do **not** need to create it manually.

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

> First install downloads the AI model (~85 MB) on the first server start. Subsequent starts are instant.

### Step 4 — Install frontend dependencies

```bash
cd frontend
npm install
```

### Step 5 — Verify local RPA folders

These folders are already included in the project. If they are missing, create them:

```
dhl-incident-system\rpa\
├── incoming\               ← not used; bot reads directly from Google Drive
├── processed\              ← bot moves files here on success
├── errors\                 ← bot moves files here on failure
├── logs\                   ← bot writes run logs here
├── screenshots\            ← proof screenshots on success
└── processed_hashes.txt    ← MD5 hash record for duplicate detection
```

Also ensure Google Drive for Desktop is installed and your Drive syncs as `G:\`.
The bot reads incoming files from `G:\My Drive\dhl-incoming\`.

---

## Running the System

Both servers must run at the same time. Start backend first.

**Terminal 1 — Backend**
```bash
cd backend
npm start
```
You should see:
```
MySQL connected and tables ready
Default users created: admin@dhl.com, agent@dhl.com, system
Server running on port 3000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
Then open: **http://localhost:5173**

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dhl.com` | `admin123` |
| Agent | `agent@dhl.com` | `agent123` |

Admin can delete incidents and export reports. Agent can create and update.

---

## System Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | JWT authentication |
| Dashboard | `/` | All incidents, search, filter by status/category/priority/date |
| Submit Incident | `/submit` | Paste raw text or upload PDF/DOCX — AI analyses on submit |
| Incident Detail | `/incidents/:id` | AI summary, status workflow, audit history, duplicate warning |
| Reports | `/reports` | Charts: by category, priority, resolution rate |
| Category Breakdown | `/reports/category` | Detailed per-category table with resolution rates |
| Settings | `/settings` | Profile and notification preferences |

---

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/login` | None | Returns JWT token |
| GET | `/api/incidents` | Bearer | List all incidents; supports `?search=&status=&category=&priority=` |
| GET | `/api/incidents/:id` | Bearer | Single incident |
| POST | `/api/incidents` | Bearer | Create incident — runs AI analysis |
| PATCH | `/api/incidents/:id/status` | Bearer | Update status, writes audit log |
| GET | `/api/incidents/:id/history` | Bearer | Full status change history |
| DELETE | `/api/incidents/:id` | Bearer (admin) | Delete incident |
| GET | `/api/reports` | Bearer | Aggregated stats by status, category, priority |
| GET | `/api/export/:format` | Bearer (admin) | Export all data as `xlsx`, `pdf`, or `docx` |
| POST | `/api/upload-file` | Bearer | Upload PDF/DOCX/TXT — returns extracted text |
| POST | `/api/ingest` | **None** | UiPath bot endpoint — creates incident without login |

---

## AI Classification (Offline)

The AI pipeline in `backend/ai.js` runs completely offline — no external API calls, no internet required after the first model download.

**How it works:**
1. Runs `Xenova/distilbart-mnli-12-3` zero-shot classification to detect the incident category
2. If model confidence is below 35%, falls back to trigger-word keyword scoring
3. Assigns priority (`High / Medium / Low`) via keyword scoring
4. Generates a clean title (5–8 words) and structured HTML summary
5. Checks for duplicates by comparing tracking numbers (e.g. `DHL-1234`, `MY123456`) against all existing open incidents
6. Filters out non-DHL content with `isDHLRelated()` before saving

**Categories detected:**
- Late Delivery
- Damaged Parcel
- Address Issue
- System Error
- Customer Complaint

---

## Database Schema

The database is auto-created. Three tables:

**`incidents`** — stores all incidents with AI-generated fields, status, tags, and source (`Manual` or `UiPath Bot`)

**`incident_history`** — audit log: every status change records old status, new status, who changed it, and timestamp

**`users`** — staff accounts with bcrypt-hashed passwords and roles (`admin` / `agent`)

Incident IDs start at `100001` and increment via a `meta` table — displayed as `INC-YYYY-XXXX` in the UI.

---

## UiPath RPA Component — DHL_IngestBot

**Location:** `uipath/DHL_IngestBot/`
**Framework:** UiPath Studio 2026, Windows target, VB.NET expressions
**Entry point:** `Main.xaml`

---

### What the bot does

DHL_IngestBot is a fully automated RPA workflow that reads customer complaint files from Google Drive, sends each file to the AI-powered backend for classification, and emails a summary report to the system admin at the end of every run. It requires no human interaction once started.

---

### Automation Flow

```
START
  │
  ├─ Read all .txt files from Google Drive folder
  │    G:\My Drive\dhl-incoming\
  │
  ├─ FOR EACH FILE:
  │    │
  │    ├─ Compute MD5 hash of file content
  │    │
  │    ├─ Check processed_hashes.txt
  │    │    │
  │    │    ├─ [DUPLICATE] → skip file, increment duplicateCount
  │    │    │
  │    │    └─ [NEW] → read full file content
  │    │                │
  │    │                ├─ HTTP POST → http://localhost:3000/api/ingest
  │    │                │   Body: { "raw_content": "...file text..." }
  │    │                │
  │    │                ├─ [SUCCESS 201] → parse incidentId from response
  │    │                │   Move file to rpa\processed\
  │    │                │   Append hash to processed_hashes.txt
  │    │                │   Increment createdCount
  │    │                │
  │    │                └─ [FAILURE] → move file to rpa\errors\
  │    │                               increment failedCount
  │    │                               append error to logText
  │
  ├─ Write run log to rpa\logs\log_YYYY-MM-DD_HH-mm.txt
  │
  └─ Send summary email to axion250304@gmail.com
       Subject: DHL IngestBot Run Summary — [date]
       Body:    Total processed | Created | Duplicates | Failed

END
```

---

### Prerequisites for the Bot

Before running DHL_IngestBot, ensure the following are set up:

| Requirement | Details |
|-------------|---------|
| UiPath Studio | 2026 Community Edition, Windows framework |
| Node.js backend | Running on `http://localhost:3000` (`npm start` in `backend/`) |
| MySQL | Connected to backend, database `dhl_incidents` exists |
| Google Drive for Desktop | Installed, signed in — Drive must be mapped as `G:\` |
| Gmail SMTP | Connected via UiPath Integration Service (OAuth or App Password) |
| UiPath packages | See package list below |

**Required UiPath packages** (install via Manage Packages in Studio):

| Package | Version | Purpose |
|---------|---------|---------|
| `UiPath.System.Activities` | 26.4.1-preview | File I/O, string ops, MD5 hashing |
| `UiPath.WebAPI.Activities` | 2.5.0-preview | HTTP POST to backend API |
| `UiPath.Mail.Activities` | 2.9.0-preview | Send Gmail summary email |
| `UiPath.GSuite.Activities` | 3.9.0-preview | Google Drive file access |
| `UiPath.IntegrationService.Activities` | 1.26.0 | UiPath Integration Service connector |
| `Newtonsoft.Json` | (bundled) | Parse JSON response from API |

---

### File Paths

| Purpose | Path |
|---------|------|
| Incoming (Google Drive) | `G:\My Drive\dhl-incoming\` |
| Processed (success) | `C:\Users\axion\OneDrive\Desktop\dhl-incident-system\rpa\processed\` |
| Failed | `C:\Users\axion\OneDrive\Desktop\dhl-incident-system\rpa\errors\` |
| Hash record | `C:\Users\axion\OneDrive\Desktop\dhl-incident-system\rpa\processed_hashes.txt` |
| Run logs | `C:\Users\axion\OneDrive\Desktop\dhl-incident-system\rpa\logs\` |

> The `processed_hashes.txt` file stores one MD5 hash per line. Any file whose hash already appears in this file is skipped as a duplicate regardless of filename.

---

### Bot Variables

| Variable | Type | Description |
|----------|------|-------------|
| `currentText` | String | Full file path of the current file being processed |
| `currentFileName` | String | Just the filename (e.g. `complaint_001.txt`) |
| `fileText` | String | Full raw text content read from the file |
| `fileHash` | String | MD5 hash of `fileText` — used for duplicate detection |
| `existingHashes` | String | Full contents of `processed_hashes.txt` |
| `isDuplicate` | Boolean | `True` if `fileHash` is found in `existingHashes` |
| `responseBody` | String | Raw JSON string returned by the backend API |
| `incidentId` | String | Incident ID parsed from the API response |
| `logText` | String | Running log string appended to after each file |
| `logFilePath` | String | Full path for the log file of this run |
| `totalCount` | Int32 | Total number of files found in incoming folder |
| `createdCount` | Int32 | Number of new incidents successfully created |
| `duplicateCount` | Int32 | Number of files skipped as duplicates |
| `failedCount` | Int32 | Number of files that failed to post to the API |

---

### API Call Details

The bot calls the backend's open ingest endpoint — no authentication token required:

```
POST http://localhost:3000/api/ingest
Content-Type: application/json

{
  "raw_content": "<full text of the complaint file>",
  "source": "UiPath Bot"
}
```

**Success response (HTTP 201):**
```json
{
  "id": 100004,
  "title": "Late Delivery Complaint DHL-1234",
  "category": "Late Delivery",
  "priority": "High",
  "status": "Draft"
}
```

**Duplicate response (HTTP 200):**
```json
{
  "message": "Duplicate ignored",
  "is_duplicate": true,
  "reason": "Matching tracking number found in existing incident"
}
```

---

### Summary Email

At the end of every run the bot sends an email to `axion250304@gmail.com`:

```
Subject: DHL IngestBot Run Summary — 2026-05-20 14:32

DHL IngestBot completed.

Run date   : 2026-05-20 14:32
Total files: 5
Created    : 3
Duplicates : 1
Failed     : 1

See attached log for details.
```

---

### How to Open and Run

1. Open **UiPath Studio 2026**
2. Click **Open** → navigate to `uipath/DHL_IngestBot/project.json`
3. Studio will prompt to install missing packages — click **Restore All**
4. Make sure the Node.js backend is running (`npm start` in `backend/`)
5. Make sure Google Drive for Desktop is running and `G:\My Drive\dhl-incoming\` exists
6. Drop one or more `.txt` complaint files into `G:\My Drive\dhl-incoming\`
7. Press **Run** (F5) in UiPath Studio — or publish and run from UiPath Assistant
8. Check `rpa\logs\` for the run log and your inbox for the summary email

---

## Submission File Structure

```
WT_Assignment_<MatricNo>_<Name>.zip
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── ai.js
│   ├── package.json
│   └── .env.example        ← template without real credentials
├── frontend/
│   └── src/
├── uipath/
│   └── DHL_IngestBot/
├── rpa/                    ← empty folders only, not logs
└── README.md
```

> Do not include `node_modules/`, `backend/.env` (real credentials), or `rpa/logs/` in the submission ZIP.

---

## Key Notes for Evaluators

- **No internet required at runtime.** The AI model is cached locally after the first download. The system works fully offline.
- **Database auto-setup.** Running `npm start` in `backend/` creates the database, all tables, and seeds 3 sample incidents automatically. No SQL scripts to run manually.
- **Both servers must be running.** Backend on port 3000, frontend on port 5173. The Vite dev server proxies `/api/*` calls to the backend automatically.
- **UiPath endpoint is open by design.** `POST /api/ingest` has no auth so UiPath can post without a login session. All other write endpoints require a JWT token.
- **Duplicate detection is per-incident content.** The AI compares tracking numbers from incoming content against all existing unresolved incidents. Duplicates are flagged with a reason but not re-saved.
- **Export is admin-only.** Non-admin accounts get `403 Forbidden` on `/api/export/:format`.
