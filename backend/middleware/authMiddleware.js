const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    // Testing Bypasses
    if (token === 'dummy-token-admin') {
        req.user = { id: '5f8d04b3b54764421b7156c0', name: 'Test Admin', email: 'admin@test.com', role: 'Admin' };
        return next();
    }
    if (token === 'dummy-token-engineer') {
        req.user = { id: '5f8d0d55b54764421b7156d0', name: 'Test Engineer', email: 'eng@test.com', role: 'Service Engineer' };
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sn_enviro_super_secret_fallback_key');

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized - User no longer exists'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
