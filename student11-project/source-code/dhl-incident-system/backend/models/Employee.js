import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['Admin', 'Manager', 'Agent', 'Viewer'],
            default: 'Agent'
        },
        department: { type: String, required: true },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        }
    },
    { timestamps: true }
);

// ---> UPGRADED: Modern Async/Await (No 'next' callback) <---
employeeSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    // This stops it from double-hashing if we just update their name or department
    if (!this.isModified('password')) {
        return; // Modern Mongoose just uses 'return' to exit the middleware
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords during login
employeeSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Employee', employeeSchema);