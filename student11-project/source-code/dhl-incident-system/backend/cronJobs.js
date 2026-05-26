import cron from 'node-cron';
import Incident from './models/Incident.js';

// We pass 'io' so the cron job can send live alerts to the frontend!
export const startCronJobs = (io) => {
    console.log("⏱️ Background SLA Watchdog started...");

    // Run this check every 1 minute (in production, maybe every 5-10 mins)
    cron.schedule('* * * * *', async () => {
        try {
            // Find incidents that are stuck in Draft or In Progress
            const stuckIncidents = await Incident.find({
                status: { $in: ['Draft', 'In Progress'] }
            });

            const now = new Date();
            let stateChanged = false;

            for (let inc of stuckIncidents) {
                // Calculate age in hours
                const hoursOld = (now - new Date(inc.createdAt)) / (1000 * 60 * 60);

                // SLA RULE: If an incident is older than 2 hours and not Critical, escalate it!
                if (hoursOld > 2 && inc.priority !== 'Critical') {
                    console.log(`⚠️ SLA Breach Warning: Escalating INC-${inc.incidentId} to Critical!`);

                    inc.priority = 'Critical';
                    inc.tracking.push({
                        label: 'SYSTEM AUTOMATION: SLA Breach Detected',
                        timestamp: new Date().toLocaleString(),
                        status: 'current',
                        comment: 'Incident stuck for > 2 hours. Auto-escalated to Critical.',
                        author: 'Cron Watchdog'
                    });

                    await inc.save();
                    stateChanged = true;
                }
            }

            // If the Cron Job changed anything, send a live WebSocket pulse to the React app!
            if (stateChanged) {
                io.emit('database_updated', { message: 'SLA Watchdog escalated incidents.' });
            }

        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
};