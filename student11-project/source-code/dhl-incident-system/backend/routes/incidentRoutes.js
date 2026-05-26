import express from 'express';
import multer from 'multer';

import {
    getIncidents,
    createIncident,
    updateIncident,
    getCustomerIncidents,
    getIncidentById,
    deleteIncident,
    wipeAllIncidents
} from '../controllers/incidentController.js';

import { processUnstructuredData } from '../controllers/aiController.js';
import { chatWithAssistant } from '../controllers/assistantController.js';
import { processGoogleDriveFile } from '../controllers/uipathController.js';
import { runUiPathBot } from '../controllers/botController.js';

// ---> NEW: Import the Security Middleware <---
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer setup for temporary file storage
const upload = multer({ dest: 'uploads/' });

// --- DEV / CLEANUP ROUTES ---
router.delete('/wipe-all', protect, wipeAllIncidents); // Secured

// --- STANDARD CRUD ROUTES ---
router.route('/')
    .get(protect, getIncidents)     // Secured: Forces backend to read req.user and filter data!
    .post(protect, createIncident); // Secured

// --- CUSTOMER ROUTES ---
router.get('/customer/:email', protect, getCustomerIncidents); // Secured

// --- UIPATH GOOGLE DRIVE PROCESSING ROUTE ---
// NOTE: We leave this unprotected so your external UiPath Bot can successfully 
// POST files without needing to log in via a web browser.
router.post('/uipath-drive', processGoogleDriveFile);

// --- MANUAL UIPATH BOT TRIGGER ROUTE ---
router.post('/run-bot', protect, runUiPathBot); // Secured

// --- AI FILE PROCESSING ROUTE ---
router.post('/ai-process', protect, upload.array('file', 5), (req, res, next) => {
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    next();
}, processUnstructuredData); // Secured

// --- ASSISTANT CHATBOT ROUTE ---
router.post('/chat', protect, chatWithAssistant); // Secured

// --- INCIDENT DETAILS ROUTE ---
router.route('/:id')
    .get(protect, getIncidentById)  // Secured
    .put(protect, updateIncident)   // Secured
    .delete(protect, deleteIncident); // Secured

export default router;