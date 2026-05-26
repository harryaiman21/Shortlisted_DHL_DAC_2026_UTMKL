````md
# DHL Knowledge Base Automation System

## Student Information
- Name: Marwan
- Matrix No: A22MJ3007

---

## Project Overview

This project is a web-based Knowledge Base Automation System that converts unstructured data (PDF, DOCX, TXT, images, emails, and messages) into structured knowledge articles using AI.

The system includes:
- React + TypeScript frontend
- Node.js + Express backend
- MySQL database (XAMPP)
- UiPath RPA automation
- Ollama AI (Phi-3 model)

---

## System Requirements

- Node.js (LTS)
- XAMPP
- Ollama
- VS Code

---

## 1. Database Setup (XAMPP)

1. Start XAMPP:
   - Apache
   - MySQL

2. Open phpMyAdmin:
   http://localhost/phpmyadmin

3. Create database:
   Dhl_system

4. Import SQL file:
   database file / your .sql file

---

## 2. Backend Setup

```bash
cd server
npm install
npm run dev
````

Backend runs at:
[http://localhost:5000](http://localhost:5000)

---

## 3. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at:
[http://localhost:5173](http://localhost:5173)

---

## 4. Ollama AI Setup (Phi-3)

Start Ollama:

```bash
ollama serve
```

Install Phi-3 (first time only):

```bash
ollama pull phi3
```

AI endpoint:
POST [http://localhost:11434/api/generate](http://localhost:11434/api/generate)

Model used:
phi3

---

## 5. UiPath RPA Setup

UiPath is used to automate file processing and uploading into the system.

### 📁 UiPath Project Location

Open UiPath Studio:

```
source-code/uipath_files/Main.xaml
```

---

### 🔑 Google / Workspace JSON Key (IMPORTANT)

The UiPath automation uses a Google Service Account JSON key for authentication.

Location inside project:

```
source-code/uipath_files/keys/google-key.json
```

⚠️ IMPORTANT:
Do NOT use absolute path like `C:\Keys\...`

The workflow uses a relative path for portability:

```
uipath_files/keys/google-key.json
```

---

### 📥 RPA Input Folder (VERY IMPORTANT)

All files to be processed by UiPath must be placed here:

```
C:\RPA_Input\
```

Workflow:

* UiPath reads files from C:\RPA_Input
* Processes each file automatically
* Sends to backend API for AI processing

---

## 6. System Workflow

* UiPath reads files from C:\RPA_Input
* Authenticates user via backend API
* Connects to Google Workspace using JSON key
* Processes files automatically
* Extracts content (PDF, DOCX, TXT, images)
* Sends data to backend
* AI (Phi-3) structures content
* Saves articles into MySQL
* Frontend displays results

---

## 7. Features

* Login system
* File upload system
* AI-generated structured articles
* Search functionality
* Dashboard interface
* MySQL database integration
* UiPath automation

---

## 8. Access Links

Frontend:
[http://localhost:5173](http://localhost:5173)

Backend:
[http://localhost:5000](http://localhost:5000)

phpMyAdmin:
[http://localhost/phpmyadmin](http://localhost/phpmyadmin)

---

## 9. YouTube Demo

[https://drive.google.com/drive/folders/1GEwTjUBgQfItrpaAxoPb4G8DkEeZ0FyK](https://drive.google.com/drive/folders/1GEwTjUBgQfItrpaAxoPb4G8DkEeZ0FyK)

---

## Author

Marwan (A22MJ3007)

```
```
