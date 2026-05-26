import Incident from '../models/Incident.js';
import Department from '../models/Department.js';
import { sendDepartmentAlert } from '../utils/emailService.js';

const generateTicketId = () => {
    return `INC-${Math.floor(Math.random() * 90000) + 10000}`;
};

const generateIncidentId = () => {
    const date = new Date();
    const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `DHL-${ymd}-${random}`;
};

// @desc    Get all incidents (Role-Based Filtering)
// @route   GET /api/incidents
export const getIncidents = async (req, res) => {
    try {
        let query = {};

        // ---> ROLE BASED SECURITY <---
        // If the user is an Employee (not an Admin), ONLY show incidents for their department
        if (req.user && req.user.role !== 'Admin') {
            query.department = req.user.department;
        }

        const incidents = await Incident.find(query).sort({ createdAt: -1 }).lean();
        res.status(200).json(incidents);
    } catch (error) {
        console.error("❌ Error fetching incidents:", error);
        res.status(500).json({ message: 'Failed to fetch incidents', error: error.message });
    }
};

// @desc    Get incidents for a specific customer
// @route   GET /api/incidents/customer/:email
export const getCustomerIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({ customerEmail: req.params.email })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(incidents);
    } catch (error) {
        console.error(`❌ Error fetching incidents for ${req.params.email}:`, error);
        res.status(500).json({ message: 'Failed to fetch customer incidents', error: error.message });
    }
};

// @desc    Get a single incident by MongoDB _id, ticketId, or incidentId
// @route   GET /api/incidents/:id
export const getIncidentById = async (req, res) => {
    try {
        let incident = await Incident.findById(req.params.id).catch(() => null);

        if (!incident) {
            incident = await Incident.findOne({
                $or: [
                    { ticketId: req.params.id },
                    { incidentId: req.params.id }
                ]
            });
        }

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found in the Vault.' });
        }

        res.status(200).json(incident);
    } catch (error) {
        console.error(`❌ Error fetching incident ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error retrieving incident details', error: error.message });
    }
};

// @desc    Create a new incident manually
// @route   POST /api/incidents
export const createIncident = async (req, res) => {
    try {
        const newTicketId = generateTicketId();
        const newIncidentId = req.body.incidentId || generateIncidentId();

        const initialTracking = [
            {
                label: `Ingested via ${req.body.source || 'Manual Entry'}`,
                timestamp: new Date().toLocaleString(),
                status: 'completed'
            },
            {
                label: 'Pending Manual Routing / Review',
                timestamp: 'Current',
                status: 'current'
            }
        ];

        const incident = new Incident({
            ...req.body,
            incidentId: newIncidentId,
            ticketId: req.body.ticketId || newTicketId,
            rawDescription: req.body.rawDescription || req.body.rawText || req.body.description || "Manual incident entry - no description provided.",
            tracking: req.body.tracking || initialTracking,
            // Automatically log who created it using the secure JWT token!
            creator: req.user ? req.user.name : (req.body.creator || 'System')
        });

        const createdIncident = await incident.save();

        if (req.io) {
            req.io.emit('newIncident', createdIncident);
        }

        console.log(`✅ Incident ${createdIncident.ticketId} published to Vault by ${incident.creator}!`);

        if (createdIncident.department && createdIncident.department !== 'Unassigned') {
            const assignedDept = await Department.findOne({ name: createdIncident.department });

            if (assignedDept && assignedDept.email) {
                sendDepartmentAlert(assignedDept.email, createdIncident);
                console.log(`📧 Assignment email sent to ${assignedDept.name}`);
            }
        }

        res.status(201).json(createdIncident);

    } catch (error) {
        console.error("❌ Error creating manual incident:", error);
        res.status(400).json({ message: 'Failed to create incident', error: error.message });
    }
};

// @desc    Update incident status/assignee/details (Role-Based Access Control)
// @route   PUT /api/incidents/:id
export const updateIncident = async (req, res) => {
    try {
        // ---> UPGRADE: Now accepts category, priority, and aiSummary from the Vault Edit modal
        const { status, assignee, department, category, priority, aiSummary, trackingUpdate } = req.body;
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // ---> ROLE BASED SECURITY <---
        // Prevent employees from updating tickets outside their department
        if (req.user && req.user.role !== 'Admin' && incident.department !== req.user.department) {
            return res.status(403).json({ message: 'Unauthorized. You can only update tickets assigned to your department.' });
        }

        const isNewDepartment = department && department !== incident.department;

        // Apply any updates that were sent in the request
        if (status) incident.status = status;
        if (assignee) incident.assignee = assignee;
        if (department) incident.department = department;
        if (category) incident.category = category;       // <-- NEW: Saves category edit
        if (priority) incident.priority = priority;       // <-- NEW: Saves priority edit
        if (aiSummary) incident.aiSummary = aiSummary;    // <-- NEW: Saves summary edit

        if (trackingUpdate) {
            if (incident.tracking && incident.tracking.length > 0) {
                incident.tracking.forEach(t => {
                    if (t.status === 'current') t.status = 'completed';
                });
            }

            // Lock the author name to the secure JWT token data
            trackingUpdate.author = req.user ? req.user.name : 'System';
            incident.tracking.push(trackingUpdate);
        }

        const updatedIncident = await incident.save();

        if (req.io) {
            req.io.emit('incidentUpdated', updatedIncident);
        }

        console.log(`🔄 Incident ${incident.ticketId} updated by ${req.user ? req.user.name : 'System'}`);

        // If the department was changed, send an email alert to the new department
        if (isNewDepartment && updatedIncident.department !== 'Unassigned') {
            const assignedDept = await Department.findOne({ name: updatedIncident.department });

            if (assignedDept && assignedDept.email) {
                sendDepartmentAlert(assignedDept.email, updatedIncident);
                console.log(`📧 Re-route email sent to ${assignedDept.name}`);
            }
        }

        res.status(200).json(updatedIncident);

    } catch (error) {
        console.error(`❌ Error updating incident ${req.params.id}:`, error);
        res.status(400).json({ message: 'Failed to update incident', error: error.message });
    }
};

// @desc    Delete a single incident (Admin Only)
// @route   DELETE /api/incidents/:id
export const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // Decrement the department counter so the Dashboard KPI stays accurate
        if (incident.department && incident.department !== 'Unassigned') {
            await Department.findOneAndUpdate(
                { name: incident.department },
                { $inc: { activeIncidentsCount: -1 } }
            ).catch(err => console.error("Failed to decrement department count:", err));
        }

        console.log(`🗑️ Incident ${incident.ticketId} deleted by ${req.user ? req.user.name : 'System'}`);
        res.status(200).json({ message: 'Incident removed successfully' });
    } catch (error) {
        console.error(`❌ Error deleting incident ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to delete incident', error: error.message });
    }
};

// @desc    DANGEROUS: Delete ALL incidents (Dev Mode / Admin Only)
// @route   DELETE /api/incidents/wipe-all
export const wipeAllIncidents = async (req, res) => {
    try {
        await Incident.deleteMany({});
        await Department.updateMany({}, { activeIncidentsCount: 0 });

        console.log(`🔥 ALL INCIDENTS DELETED AND DEPARTMENT COUNTERS RESET by ${req.user ? req.user.name : 'System'} 🔥`);
        res.status(200).json({ message: "Database wiped and counters reset!" });
    } catch (error) {
        console.error("❌ Error wiping database:", error);
        res.status(500).json({ message: "Failed to wipe database", error: error.message });
    }
};