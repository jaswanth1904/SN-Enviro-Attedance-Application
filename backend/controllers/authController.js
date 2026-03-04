const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            phoneNumber,
            password,
            role: role || 'Staff'
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { identifier, email, phoneNumber, password } = req.body;

        // Support both old {email} and new {identifier} or direct {phoneNumber}
        const loginId = identifier || email || phoneNumber;

        if (!loginId || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email/phone and password'
            });
        }

        // Check for user by email OR phone
        const user = await User.findOne({
            $or: [
                { email: loginId },
                { phoneNumber: loginId }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const update = { $set: {}, $unset: {} };
        const allowedFields = ['name', 'email', 'phoneNumber', 'alternativeContact', 'bloodGroup', 'role', 'joiningDate', 'employmentType', 'gradeLevel', 'socialLinks', 'homeAddress', 'coreCompetencies', 'currentProjects'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (req.body[field] === '' || req.body[field] === null) {
                    update.$unset[field] = 1;
                } else {
                    update.$set[field] = req.body[field];
                }
            }
        });

        // Remove empty operators
        if (Object.keys(update.$set).length === 0) delete update.$set;
        if (Object.keys(update.$unset).length === 0) delete update.$unset;

        const user = await User.findByIdAndUpdate(req.user.id, update, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: message.join(', ')
            });
        }

        // Mongoose duplicate key
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                error: `This ${field} is already in use by another account.`
            });
        }
        next(error);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            alternativeContact: user.alternativeContact,
            bloodGroup: user.bloodGroup,
            profilePicture: user.profilePicture,
            joiningDate: user.joiningDate,
            employmentType: user.employmentType,
            gradeLevel: user.gradeLevel,
            socialLinks: user.socialLinks,
            homeAddress: user.homeAddress,
            coreCompetencies: user.coreCompetencies,
            currentProjects: user.currentProjects
        }
    });
};
