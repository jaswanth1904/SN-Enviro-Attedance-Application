const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, password, role, empId } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            phoneNumber,
            password,
            empId: empId || '',
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
        const allowedFields = ['name', 'empId', 'email', 'phoneNumber', 'alternativeContact', 'bloodGroup', 'role', 'joiningDate', 'employmentType', 'gradeLevel', 'socialLinks', 'homeAddress', 'coreCompetencies', 'currentProjects'];

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

        // Real-time broadcast for MD Dashboard
        if (req.app.locals.io) {
            req.app.locals.io.emit('profile_updated', user);
        }

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'sn_enviro_super_secret_fallback_key', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            empId: user.empId,
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

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'No employee account found with this email address.'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url (dynamic based on request origin or production domain)
        const host = req.headers.origin || 'https://attendance.snenviro.org';
        const resetUrl = `${host}/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 580px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 22px;">SN Enviro Attendance Portal</h2>
                    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
                </div>
                <p style="color: #334155; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                    You are receiving this email because a password reset request was made for your SN Enviro account. Click the button below to choose a new password:
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                    This link is valid for <strong>30 minutes</strong>. If you did not request this password reset, please ignore this email and your password will remain unchanged.
                </p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;">
                <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                    Automated system notification from SN Enviro Attendance Pvt Ltd &bull; attendance@snenviro.in
                </p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: '🔐 Password Reset Link - SN Enviro Portal',
                message
            });

            res.status(200).json({
                success: true,
                message: 'Password reset link sent to your registered email'
            });
        } catch (err) {
            console.error('Password reset email error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                error: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        // Strict password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const hasUpper = /[A-Z]/.test(password || '');
        const hasLower = /[a-z]/.test(password || '');
        const hasNumber = /[0-9]/.test(password || '');
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password || '');

        if (!password || password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired password reset link. Please request a new one.'
            });
        }

        // Prevent reusing same old password
        const isSamePassword = await user.matchPassword(password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: 'New password cannot be the same as your old password. Please create a new password.'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};
