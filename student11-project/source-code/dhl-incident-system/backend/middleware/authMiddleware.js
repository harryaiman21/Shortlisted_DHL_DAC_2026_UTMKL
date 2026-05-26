import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

// 1. Protect routes - Verifies token and attaches user to req.user
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token, attach to request, but EXCLUDE the password
            req.user = await Employee.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error("❌ Auth Token Error:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// 2. Role Authorization - Restricts access to specific roles (e.g., 'Admin')
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`
            });
        }
        next();
    };
};