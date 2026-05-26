import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // E.g., 'Warehouse', 'Customer Service'
        },
        inChargeName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Busy', 'Offline'],
            default: 'Active',
        },
        activeIncidentsCount: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);

const Department = mongoose.model('Department', departmentSchema);

export default Department;