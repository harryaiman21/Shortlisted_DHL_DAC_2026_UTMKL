import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';

// Generate JSON Web Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await Employee.findOne({ email });

        // 2. Validate User & Check Password Hash
        // We check them together to prevent "timing attacks" or revealing if an email exists
        if (user && (await user.matchPassword(password))) {

            // 3. Security Check: Is the account active?
            if (user.status !== 'Active') {
                console.log(`❌ Login Blocked: Account ${email} is deactivated.`);
                return res.status(403).json({ message: 'Account is deactivated. Please contact IT.' });
            }

            console.log(`✅ Login Success: ${user.name} logged in as ${user.role} (${user.department})`);

            // 4. Send secure payload & VIP pass (Token) to frontend
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token: generateToken(user._id),
            });
        } else {
            console.log(`❌ Login Failed: Invalid credentials attempt for ${email}`);
            // Always return a generic error for bad logins
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("❌ Server Error during login:", error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get logged in user profile (Session Restoration)
// @route   GET /api/auth/me
// @access  Private (Requires Token)
export const getUserProfile = async (req, res) => {
    try {
        // req.user is dynamically attached by our authMiddleware after decrypting the token
        const user = await Employee.findById(req.user._id).select('-password');

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status
            });
        } else {
            res.status(404).json({ message: 'User not found in database.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
    }
};