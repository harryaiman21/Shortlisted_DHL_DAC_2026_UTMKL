import mongoose from 'mongoose';
import 'dotenv/config';

// Import your Mongoose Models
import Department from './models/Department.js';
// Make sure this path matches your actual Incident model file!
import Incident from './models/Incident.js';

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        // 1. CLEAR EXISTING DATA
        await Department.deleteMany();
        await Incident.deleteMany();
        console.log('Cleared existing Departments and Incidents...');

        // ==========================================
        // 2. SEED DEPARTMENTS
        // ==========================================
        const departmentsData = [
            {
                name: 'IT & Automation',
                inChargeName: 'Md Jubayer Islam',
                email: 'jubayerislam2702@gmail.com', // Your target email
                phone: '+60 12-345-6789',
                status: 'Active',
                activeIncidentsCount: 1
            },
            {
                name: 'Warehouse Operations',
                inChargeName: 'Ahmad bin Abdullah',
                email: 'warehouse.kul@dhl.dummy.com',
                phone: '+60 11-2222-3333',
                status: 'Busy',
                activeIncidentsCount: 2
            },
            {
                name: 'Customer Service',
                inChargeName: 'Sarah Jenkins',
                email: 'cs.support@dhl.dummy.com',
                phone: '+60 11-4444-5555',
                status: 'Active',
                activeIncidentsCount: 1
            },
            {
                name: 'Hub Operations',
                inChargeName: 'Michael Chang',
                email: 'hub.ops@dhl.dummy.com',
                phone: '+60 11-6666-7777',
                status: 'Offline',
                activeIncidentsCount: 0
            }
        ];

        await Department.insertMany(departmentsData);
        console.log('✅ Departments Seeded!');

        // ==========================================
        // 3. SEED INCIDENTS (Tied to Departments)
        // ==========================================
        const incidentsData = [
            {
                incidentId: 'INC-9001',
                source: 'UiPath System Monitor',
                category: 'System Error',
                priority: 'Critical',
                status: 'Draft',
                department: 'IT & Automation', // Assigned to YOU
                aiSummary: 'The automated API webhook responsible for syncing tracking statuses between the KUL Hub and the central server has timed out for the last 45 minutes. Backlog is accumulating rapidly.',
                rawText: '[ERROR 504] Gateway Timeout. Process: Sync_Tracking_Prod. Duration: 45m. Impact: High.',
                tags: ['API', 'Timeout', 'KUL Hub', 'Sync'],
                confidenceScore: 98,
                isBot: true,
                creator: 'System Monitor Bot'
            },
            {
                incidentId: 'INC-9002',
                source: 'Telegram Bot (Image)',
                category: 'Damaged Parcel',
                priority: 'High',
                status: 'Reviewed',
                department: 'Warehouse Operations',
                aiSummary: 'A forklift operator accidentally breached Pallet 4B containing sensitive medical supplies. Immediate supervisor review required before claims processing.',
                rawText: 'OCR Extracted: FORKLIFT INCIDENT ZONE 4. PALLET 4B BREACHED. MEDICAL SUPPLIES EXPOSED.',
                tags: ['Forklift', 'Medical', 'Damage Claim'],
                confidenceScore: 92,
                isBot: true,
                creator: 'Telegram OCR Bot'
            },
            {
                incidentId: 'INC-9003',
                source: 'Customer Email',
                category: 'Late Delivery',
                priority: 'Medium',
                status: 'In Progress',
                department: 'Customer Service',
                aiSummary: 'Customer is requesting a refund for a guaranteed next-day delivery that has been stuck at the Subang transit facility for 48 hours.',
                rawText: 'From: angrycustomer@email.com - Where is my package? Tracking #883920. It was supposed to be here Tuesday! I want a full refund.',
                tags: ['Refund', 'SLA Breach', 'Subang'],
                confidenceScore: 88,
                isBot: false,
                creator: 'Sarah Jenkins'
            },
            {
                incidentId: 'INC-9004',
                source: 'Driver App Note',
                category: 'Address Issue',
                priority: 'Low',
                status: 'Resolved',
                department: 'Warehouse Operations',
                aiSummary: 'Driver reported that the provided delivery address does not exist. Package returned to warehouse for address verification.',
                rawText: 'Address 124 Fake Street does not exist. Attempted calling customer, went to voicemail. Returning to base.',
                tags: ['Return to Sender', 'Invalid Address'],
                confidenceScore: 95,
                isBot: false,
                creator: 'Driver ID: 4492'
            }
        ];

        await Incident.insertMany(incidentsData);
        console.log('✅ Incidents Seeded!');

        console.log('🎉 Database fully prepared! You can now start the server.');
        process.exit();

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();