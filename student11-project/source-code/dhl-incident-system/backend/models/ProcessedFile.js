import mongoose from 'mongoose';

const processedFileSchema = new mongoose.Schema({
    fileName: String,
    fileId: String,
    fileHash: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['created', 'updated', 'duplicate', 'failed'],
        default: 'created'
    },
    processedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('ProcessedFile', processedFileSchema);