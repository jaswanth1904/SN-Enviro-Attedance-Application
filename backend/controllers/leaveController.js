const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res, next) => {
    try {
        req.body.user = req.user.id;
        const leave = await Leave.create(req.body);

        const populatedLeave = await Leave.findById(leave._id).populate('user', 'name email role');
        const io = req.app.locals.io;
        if (io) {
            io.emit('new_leave_request', populatedLeave);
        }

        res.status(201).json({
            success: true,
            data: leave
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find({ user: req.user.id }).sort('-appliedAt');

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leaves (Admin/Senior only)
// @route   GET /api/leaves
// @access  Private (Admin/Senior)
exports.getAllLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find().populate('user', 'name email').sort('-appliedAt');

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        next(error);
    }
};

const sendEmail = require('../utils/sendEmail');

// @desc    Approve/Reject leave
// @route   PUT /api/leaves/:id
// @access  Private (Admin/Senior)
exports.updateLeaveStatus = async (req, res, next) => {
    try {
        const { status, rejectionReason } = req.body;
        let leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave request not found' });
        }

        leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, rejectionReason, approvedBy: req.user.id },
            { new: true, runValidators: true }
        ).populate('user', 'name email role');

        const io = req.app.locals.io;
        if (io) {
            io.emit('leave_status_updated', leave);
        }

        // Send email to the user if their email is available
        if (leave.user && leave.user.email) {
            setImmediate(() => {
                const notifyUser = async () => {
                    try {
                        const action = status === 'Approved' ? 'approved' : 'rejected';
                        const color = status === 'Approved' ? '#10b981' : '#f43f5e';
                        
                        await sendEmail({
                            email: leave.user.email,
                            subject: `Leave Request ${status}`,
                            message: `<div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <h2 style="color: #1e293b; border-bottom: 2px solid ${color}; padding-bottom: 10px;">Leave ${status}</h2>
                                <p style="color: #475569; font-size: 16px;">Hello <strong>${leave.user.name}</strong>,</p>
                                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your ${leave.leaveType} request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been <strong>${action}</strong> by the MD.</p>
                                ${status === 'Rejected' && rejectionReason ? `<p style="color: #475569; font-size: 15px; background-color: #fef1f2; padding: 10px; border-left: 4px solid #f43f5e;">Reason: ${rejectionReason}</p>` : ''}
                                <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;">
                                <small style="color: #94a3b8;">This is an automated notification from SN Enviro System.</small>
                            </div>`
                        });
                    } catch (err) {
                        console.error('Failed to send leave status email', err);
                    }
                };
                notifyUser();
            });
        }

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        next(error);
    }
};
