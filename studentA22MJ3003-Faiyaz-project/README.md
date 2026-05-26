# DHL Knowledge Base Automation Portal

## Student Details

**Name:** Faiyaz Ahmed  
**Matric No:** A22MJ3003  
**Scenario:** Scenario 1 - AI-Powered Knowledge Base Automation for DHL Logistics Operations  

---

## Project Overview

DHL Logistics Operations teams handle many messages, documents, notes, screenshots, and instructions every day. These sources often contain important operational knowledge, but the information is usually unstructured, scattered, and difficult to reuse.

This project is a full-stack **DHL Knowledge Base Automation Portal** designed to transform raw logistics input into structured SOP and Knowledge Base articles.

The system allows users to upload or enter raw logistics information, create draft knowledge articles, review them, publish approved SOPs, and monitor RPA automation activity.

---

## Main Objective

The main objective of this project is to automate the process of transforming messy logistics input into clean, searchable, reusable Knowledge Base articles.

The system supports:

- Secured login
- Role-based access control
- Upload console for raw input
- Draft article creation
- Review and publishing workflow
- Version and status history
- Attachment upload
- RPA automation monitoring
- Duplicate checking for RPA processing
- Admin user management

---

## Technologies Used

### Frontend

- Angular
- TypeScript
- SCSS
- Font Awesome

### Backend

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport JWT
- Bcrypt password hashing

### Database

- PostgreSQL
- Docker

### RPA

- UiPath Studio

---

## Project Structure

```text
FaiyazAhmed_A22MJ3003/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── angular.json
│
├── rpa/
│   └── DHL_KB_RPA_Automation/
│       ├── Main.xaml
│       ├── project.json
│       └── project.uiproj
│
├── docker-compose.yml
└── README.md
```

---

## User Roles

The system includes four roles:

| Role | Description |
|---|---|
| ADMIN | Full access to dashboard, articles, upload console, automation runs, and user management |
| EDITOR | Can create drafts, upload source files, and manage article content |
| REVIEWER | Can review and publish articles, and view automation activity |
| RPA_BOT | Used by UiPath automation to create draft articles and log automation activity |

---

## Default Login Accounts

After running the database seed, the following accounts are available:

### Admin

```text
Email: booz@dhl-kb.com
Password: admin123
```

### Editor

```text
Email: biggus@dhl-kb.com
Password: editor123
```

### Reviewer

```text
Email: indus@dhl-kb.com
Password: reviewer123
```

### RPA Bot

```text
Email: rpa-bot@dhl-kb.com
Password: rpa123
```

---

## Main Features

### 1. Secure Login

The system uses JWT authentication. Users must log in before accessing the application.

The frontend stores the token in `sessionStorage`, so the user must log in again after closing the browser or tab.

---

### 2. Role-Based Access Control

Different users see different menus and actions depending on their role.

For example:

- Admin can access User Management.
- Editor can create drafts and use the Upload Console.
- Reviewer can review and publish articles.
- RPA Bot is used for automation-related actions.

Backend routes are also protected using JWT guards and role guards.

---

### 3. Dashboard

The dashboard displays live system information such as:

- Total articles
- Draft count
- Reviewed count
- Published count
- User count for admin
- RPA run count
- Latest automation activity
- Recent knowledge articles

---

### 4. Knowledge Articles

Users can view Knowledge Base articles and filter/search them by:

- Keyword
- Status
- Tag
- Creator details

Each article includes:

- Title
- Summary
- SOP content
- Source text
- Tags
- Creator
- Reviewer
- Publisher
- Attachments
- Status history
- Version history

---

### 5. Upload Console

The Upload Console accepts raw logistics input and creates draft Knowledge Base articles.

Supported input types include:

- Text
- PDF
- DOCX
- TXT
- PNG/JPG source files

The Upload Console can also attach source files to the created article.

---

### 6. Article Workflow

The system supports this workflow:

```text
Draft → Reviewed → Published
```

Additional status support:

```text
Published → Archived
Archived → Draft
```

This allows articles to be restored and updated when needed.

---

### 7. Version and Status History

The system records article changes and status transitions.

This allows users to see:

- When an article was created
- Who reviewed it
- Who published it
- Status movement history
- Version records

---

### 8. Attachments

Users can upload supporting files for each article.

Supported file types include:

- PDF
- DOCX
- TXT
- PNG
- JPG

---

### 9. Automation Runs

The Automation Runs page displays RPA execution history, including:

- Total scanned files
- Created articles
- Updated articles
- Duplicate files
- Failed files
- Execution logs
- Summary email status

---

### 10. Admin User Management

Admin users can manage accounts through the User Management page.

Admin can:

- View all users
- Create new users
- Edit names, emails, roles, and passwords
- Delete users, except protected RPA Bot account

---

## RPA Automation Summary

The UiPath automation is designed to support Scenario 1 by processing raw logistics input from a designated Google Drive or exported email source.

The RPA workflow:

1. Starts an automation run.
2. Reads source files from the input folder.
3. Generates a hash for duplicate checking.
4. Calls the backend duplicate-check API.
5. Skips duplicate files found within the last 14 days.
6. Creates new draft articles in the web application.
7. Uploads related source files.
8. Writes success, duplicate, and error logs.
9. Takes screenshots when failures occur.
10. Updates automation run totals.
11. Sends a summary email to the system admin.

---

## Backend API Highlights

### Authentication

```text
POST /auth/login
```

Used to log in and receive a JWT access token.

---

### Articles

```text
GET /articles
GET /articles/:id
POST /articles
PATCH /articles/:id
PATCH /articles/:id/status
DELETE /articles/:id
POST /articles/check-duplicate
```

The duplicate-check endpoint is used by RPA to prevent repeated SOP generation.

---

### Tags

```text
GET /tags
POST /tags
```

---

### Attachments

```text
POST /attachments/article/:articleId
GET /attachments/article/:articleId
DELETE /attachments/:id
```

---

### Automation

```text
POST /automation/runs
GET /automation/runs
GET /automation/runs/:id
PATCH /automation/runs/:id
POST /automation/logs
GET /automation/runs/:id/logs
```

---

### Admin Users

```text
GET /users-admin
POST /users-admin
PATCH /users-admin/:id
DELETE /users-admin/:id
```

---

## How to Run the Project

### Prerequisites

Make sure these are installed:

- Node.js
- npm
- Docker Desktop
- Angular CLI
- NestJS CLI

---

## 1. Start PostgreSQL Database

From the project root folder:

```bash
docker compose up -d
```

This starts the PostgreSQL database container.

---

## 2. Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder.

Use this format:

```env
DATABASE_URL="postgresql://dhl_user:dhl_password@localhost:5433/dhl_db?schema=public"
JWT_SECRET="dhl_kb_super_secret_demo_key"
JWT_EXPIRES_IN="2h"
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Seed default users and tags:

```bash
npx prisma db seed
```

Start the backend:

```bash
npm run start:dev
```

Backend runs at:

```text
http://localhost:3000
```

---

## 3. Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Angular:

```bash
ng serve
```

Frontend runs at:

```text
http://localhost:4200
```

---

## 4. Login to the System

Open:

```text
http://localhost:4200/login
```

Use one of the default accounts listed above.

Recommended first login:

```text
Email: booz@dhl-kb.com
Password: admin123
```

---

## 5. RPA Project

The UiPath project is located at:

```text
rpa/DHL_KB_RPA_Automation/
```

Main workflow file:

```text
Main.xaml
```

Open the project in UiPath Studio using:

```text
project.uiproj
```

---

## Important Notes

The following files/folders are intentionally excluded from submission:

```text
node_modules/
backend/node_modules/
frontend/node_modules/
backend/.env
frontend/.env
backend/uploads/
UiPath generated local cache files
```

The `.env` file is not included for security reasons. Create it manually using the example shown above.

---

## GitHub Submission Notes

This project is submitted inside the folder:

```text
FaiyazAhmed_A22MJ3003/
```

Please do not move files outside this folder when reviewing the project.

---

## Scenario Mapping

This project maps to:

```text
Scenario 1: AI-Powered Knowledge Base Automation for DHL Logistics Operations
```

The system demonstrates how raw DHL logistics information can be converted into clean SOP/Knowledge Base articles using a secured web application and RPA automation.

---

## Final Remarks

This project provides a complete prototype for DHL Knowledge Base Automation. It combines a secured full-stack web application, database-backed article management, role-based access, file upload support, RPA monitoring, duplicate checking, and UiPath automation support.