import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import ProcessedFile from '../models/ProcessedFile.js';
import { processUnstructuredData } from './aiController.js';

// ---> NEW IMPORTS FOR AUTO-SAVING <---
import Incident from '../models/Incident.js';
import Department from '../models/Department.js';
import { sendDepartmentAlert } from '../utils/emailService.js';
// -------------------------------------

export const processGoogleDriveFile = async (req, res) => {
    try {
        const { fileName, fileId, mimeType, webViewLink } = req.body;

        if (!fileId) {
            return res.status(400).json({
                success: false,
                status: 'failed',
                message: 'fileId is required'
            });
        }

        console.log('📥 UiPath file received:', { fileName, fileId, mimeType, webViewLink });

        const uploadDir = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeFileName = fileName?.replace(/[^\w.\-() ]/g, '_') || `drive-file-${Date.now()}`;
        const filePath = path.join(uploadDir, safeFileName);
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 30000,
            validateStatus: () => true
        });

        if (response.status !== 200) {
            return res.status(400).json({
                success: false,
                status: 'failed',
                message: `Google Drive download failed with status ${response.status}. Check file sharing permission.`
            });
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const fileBuffer = fs.readFileSync(filePath);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        console.log('✅ File downloaded:', filePath);

        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const existingFile = await ProcessedFile.findOne({
            fileHash,
            processedAt: { $gte: fourteenDaysAgo }
        });

        if (existingFile) {
            console.log('⚠️ Duplicate file skipped:', fileHash);
            return res.status(200).json({
                success: true,
                status: 'duplicate',
                message: 'Duplicate file skipped. Same file was processed within last 14 days.',
                data: { fileName: safeFileName, fileId, mimeType, filePath, fileHash, previousProcessedAt: existingFile.processedAt }
            });
        }

        const processedFileRecord = await ProcessedFile.create({
            fileName: safeFileName,
            fileId,
            fileHash,
            status: 'created',
            processedAt: new Date()
        });

        // Build fake multer-style req for your existing AI controller
        const fakeReq = {
            ...req,
            body: {
                ...req.body,
                source: 'UiPath Google Drive Bot',
                fileHash,
                googleDriveFileId: fileId
            },
            files: [
                {
                    fieldname: 'file',
                    originalname: safeFileName,
                    encoding: '7bit',
                    mimetype: mimeType || 'application/octet-stream',
                    destination: uploadDir,
                    filename: safeFileName,
                    path: filePath,
                    size: fs.statSync(filePath).size
                }
            ],
            io: req.io
        };

        // ---> 🚨 THE FIX: INTERCEPT THE AI RESPONSE AND AUTO-SAVE TO MONGODB 🚨 <---
        const fakeRes = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: async function (data) {
                // If the AI successfully parsed the document
                if (this.statusCode === 200 && data.success) {
                    try {
                        const newTicketId = `INC-${Math.floor(Math.random() * 90000) + 10000}`;
                        const newIncidentId = `DHL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

                        const incident = new Incident({
                            incidentId: newIncidentId,
                            ticketId: newTicketId,
                            source: safeFileName, // Uses the actual file name
                            rawDescription: data.rawText || "Automated UiPath ingestion",
                            title: data.extractedData.title,
                            category: data.extractedData.category,
                            priority: data.extractedData.priority,
                            department: data.extractedData.department,
                            aiSummary: data.extractedData.aiSummary,
                            tags: data.extractedData.tags,
                            status: data.extractedData.confidenceScore >= 85 ? 'Reviewed' : 'Draft',
                            isBot: true,
                            creator: 'UiPath Automation',
                            tracking: [
                                { label: 'Ingested via Google Drive Bot', timestamp: new Date().toLocaleString(), status: 'completed' },
                                { label: 'AI Processing Complete', timestamp: new Date().toLocaleString(), status: 'completed' },
                                { label: 'Pending Human Review', timestamp: 'Current', status: 'current' }
                            ]
                        });

                        const savedIncident = await incident.save();

                        // Tell the frontend Vault to update instantly
                        if (req.io) {
                            req.io.emit('newIncident', savedIncident);
                        }

                        // Send Email if Department is assigned
                        if (savedIncident.department && savedIncident.department !== 'Unassigned') {
                            const assignedDept = await Department.findOne({ name: savedIncident.department });
                            if (assignedDept && assignedDept.email) {
                                sendDepartmentAlert(assignedDept.email, savedIncident);
                                console.log(`📧 UiPath automated email sent to ${assignedDept.name}`);
                            }
                        }

                        console.log(`✅ UiPath Incident ${newTicketId} automatically published to Vault!`);

                        // Tell UiPath the entire pipeline was 100% successful
                        return res.status(200).json({
                            success: true,
                            status: 'processed',
                            message: 'File processed and saved to Vault successfully.',
                            ticketId: newTicketId
                        });

                    } catch (dbError) {
                        console.error('❌ UiPath DB Save Error:', dbError);
                        return res.status(500).json({ success: false, message: 'AI processed successfully, but Database save failed.' });
                    }
                } else {
                    // If the AI failed (e.g. status 400 or 500), just pass the error back to UiPath
                    return res.status(this.statusCode || 500).json(data);
                }
            }
        };

        // Run the AI, but pass our 'fakeRes' so it triggers the save logic above!
        return processUnstructuredData(fakeReq, fakeRes);

    } catch (error) {
        console.error('❌ UiPath Drive Processing Error:', error);
        return res.status(500).json({
            success: false,
            status: 'failed',
            message: error.message
        });
    }
};