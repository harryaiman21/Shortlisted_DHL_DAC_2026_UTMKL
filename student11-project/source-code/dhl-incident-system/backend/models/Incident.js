import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
    label: { type: String, required: true },
    timestamp: { type: String, required: true },
    status: { type: String, required: true },
    comment: { type: String },
    author: { type: String }
});

const incidentSchema = new mongoose.Schema({
    // ---> THE FIX: We add the old ID back so Mongoose stops stripping it! <---
    incidentId: { type: String, required: false },

    // The actual ID your UI uses
    ticketId: { type: String, required: true, unique: true },

    // Core Data
    source: { type: String, default: 'Manual Entry' },
    customerEmail: { type: String },
    trackingNumber: { type: String },
    rawDescription: { type: String },

    // AI / Routing Data
    category: { type: String },
    priority: { type: String },
    department: { type: String },
    aiSummary: { type: String },
    tags: [{ type: String }],

    // Status & Auditing
    status: { type: String, default: 'In Progress' },
    creator: { type: String, default: 'System' },
    isBot: { type: Boolean, default: false },
    tracking: [trackingSchema]
}, {
    timestamps: true
});

// This prevents Mongoose from recompiling the model if it's already cached
const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default Incident;