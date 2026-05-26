// 1. CRITICAL FIX: MUST BE LINE 1 to load env vars before other imports run
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// ---> PHASE 4: SECURITY & LOGGING IMPORTS <---
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
// ---------------------------------------------

// 2. Import Routes, Jobs & Services
import incidentRoutes from './routes/incidentRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { runUiPathBot } from './controllers/botController.js';
import { startCronJobs } from './cronJobs.js';
import { verifyEmailConnection, sendAdminErrorAlert } from './utils/emailService.js';
import authRoutes from './routes/authRoutes.js';

// ---> NEW: Import Employee Model for Auto-Seeding <---
import Employee from './models/Employee.js';

// 3. Environment Variable Validation
if (!process.env.MONGO_URI) {
    logger.error('FATAL ERROR: MONGO_URI is not defined in .env');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;

// 4. Create HTTP Server and bind Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// ---> PHASE 4: APPLY SECURITY MIDDLEWARES <---
// Helmet sets 14+ security headers to prevent common web vulnerabilities
app.use(helmet());

// Rate Limiter: Max 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
// ---------------------------------------------

// 5. Global Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Inject Socket.io into the request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

// ---> TEMPORARY DEBUG ROUTE: FORCE SEED ADMIN <---
app.get('/api/force-seed', async (req, res) => {
    try {
        // Wipe any corrupted old accounts
        await Employee.deleteMany({ email: 'admin@dhl.com' });

        // Try to create the fresh one
        const newAdmin = await Employee.create({
            name: 'Super Admin',
            email: 'admin@dhl.com',
            password: 'password123',
            role: 'Admin',
            department: 'IT & Automation',
            status: 'Active'
        });

        // If it works, show it on the screen!
        res.json({ success: true, message: "Admin created successfully!", data: newAdmin });
    } catch (error) {
        // If it fails, print the EXACT error on the screen!
        console.error("SEED ERROR:", error);
        res.status(500).json({ success: false, message: "Seed failed", error: error.message, stack: error.stack });
    }
});
// --------------------------------------------------
// 6. Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);

// ---> NEW: UiPath Bot Routes <---
const botRouter = express.Router();
botRouter.post('/run-bot', runUiPathBot);
app.use('/api/bot', botRouter);
// --------------------------------

// 7. Global Error Handler
app.use((err, req, res, next) => {
    logger.error(`Unhandled Server Error: ${err.message}`, { stack: err.stack });

    try {
        sendAdminErrorAlert(err.message, err.stack);
    } catch (emailError) {
        logger.error(`Could not send Admin error email: ${emailError.message}`);
    }

    res.status(500).json({
        success: false,
        message: 'An unexpected server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 8. Socket.io Connection Management
io.on('connection', (socket) => {
    logger.info(`New Client Connected via Socket: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Client Disconnected: ${socket.id}`);
    });
});

// 9. Database Connection & Server Initialization
mongoose.connect(process.env.MONGO_URI)
    .then(async () => { // <-- UPGRADED TO ASYNC
        logger.info('MongoDB Connected Successfully');

        // ---> NEW: AUTO-SEED FIRST ADMIN ACCOUNT <---
        try {
            // 1. Force delete the old unencrypted ghost account
            await Employee.deleteOne({ email: 'admin@dhl.com' });

            // 2. Create a fresh, fully encrypted admin account
            await Employee.create({
                name: 'Super Admin',
                email: 'admin@dhl.com',
                password: 'password123', // Bcrypt will now hash this properly!
                role: 'Admin',
                department: 'IT & Automation',
                status: 'Active'
            });
            logger.info('✅ Database reset: Fresh Admin auto-seeded successfully!');

        } catch (seedErr) {
            logger.error('Failed to seed admin:', seedErr.message);
        }
        // ---------------------------------------------

        verifyEmailConnection();

        httpServer.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

            try {
                startCronJobs(io);
                logger.info('Background Cron Jobs initialized');
            } catch (cronError) {
                logger.warn(`Failed to start Cron Jobs: ${cronError.message}`);
            }
        });
    })
    .catch((err) => {
        logger.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    });

// 10. Graceful Shutdown
const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server gracefully...');
    httpServer.close(() => {
        logger.info('HTTP Server closed.');
        mongoose.connection.close(false).then(() => {
            logger.info('MongoDB connection closed.');
            process.exit(0);
        });
    });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);