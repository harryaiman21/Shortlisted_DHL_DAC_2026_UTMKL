
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
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

Backend runs at:
http://localhost:5000

3. Frontend Setup
npm install
npm run dev

Frontend runs at:
http://localhost:5173

4. Ollama AI Setup (Phi-3)

Start Ollama:

ollama serve

Install Phi-3 (first time only):

ollama pull phi3

AI endpoint:
POST http://localhost:11434/api/generate

Model used:
phi3

5. UiPath RPA Setup

UiPath is used to automate file processing and uploading into the system.

📁 UiPath Project Location

Open UiPath Studio:

source-code/uipath_files/Main.xaml
🔑 Google / Workspace JSON Key (IMPORTANT)

The UiPath automation uses a Google Service Account JSON key for authentication.

📍 Location inside project:
source-code/uipath_files/keys/dhl-kb-rpa-f33b7ace4f37.json
⚠️ IMPORTANT:
Do NOT use absolute path like C:\Keys\...
The workflow uses a relative path for portability:
uipath_files/keys/dhl-kb-rpa-f33b7ace4f37.json
📥 RPA Input Folder (VERY IMPORTANT)

All files to be processed by UiPath must be placed here:

C:\RPA_Input\

Workflow:

UiPath reads files from C:\RPA_Input
Processes each file automatically
Sends to backend API for AI processing

6. System Workflow
UiPath reads files from C:\RPA_Input
Authenticates user via backend API
Connects to Google Workspace using JSON key
Processes files automatically
Extracts content (PDF, DOCX, TXT, images)
Sends data to backend
AI (Phi-3) structures content
Saves articles into MySQL
Frontend displays results

7. Features
Login system
File upload system
AI-generated structured articles
Search functionality
Dashboard interface
MySQL database integration
UiPath automation
8. Access Links

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

phpMyAdmin:
http://localhost/phpmyadmin

9. YouTube Demo

https://drive.google.com/drive/folders/1GEwTjUBgQfItrpaAxoPb4G8DkEeZ0FyK

Author

Marwan (A22MJ3007)

```
```
