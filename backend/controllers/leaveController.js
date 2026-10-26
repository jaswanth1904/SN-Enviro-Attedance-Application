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
        const { status, rejectionReason, adminRemarks } = req.body;
        let leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave request not found' });
        }

        const updateData = {
            status,
            approvedBy: req.user.id
        };
        if (adminRemarks !== undefined) updateData.adminRemarks = adminRemarks;
        if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

        leave = await Leave.findByIdAndUpdate(
            req.params.id,
            updateData,
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
                        const remarksToDisplay = adminRemarks || (status === 'Rejected' ? rejectionReason : '');

                        const formattedStart = new Date(leave.startDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
                        const formattedEnd = new Date(leave.endDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

                        await sendEmail({
                            email: leave.user.email,
                            subject: `Official Leave Update: Request ${status} — SN Enviro`,
                            message: `
                                <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                                    <div style="border-bottom: 3px solid ${color}; padding-bottom: 12px; margin-bottom: 20px;">
                                        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Leave Request ${status}</h2>
                                        <small style="color: #64748b;">SN Enviro Attendance & Human Resources Portal</small>
                                    </div>
                                    <p style="color: #334155; font-size: 15px;">Dear <strong>${leave.user.name}</strong>,</p>
                                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                                        Your <strong>${leave.leaveType}</strong> application from <strong>${formattedStart}</strong> to <strong>${formattedEnd}</strong> has been <strong><span style="color: ${color};">${action.toUpperCase()}</span></strong> by Management / MD.
                                    </p>
                                    ${remarksToDisplay ? `
                                    <div style="background-color: ${status === 'Approved' ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${color}; padding: 14px; border-radius: 6px; margin: 20px 0;">
                                        <p style="margin: 0; font-size: 13px; font-weight: bold; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">MD / Management Note:</p>
                                        <p style="margin: 6px 0 0; font-size: 14px; color: #1e293b; font-style: italic;">"${remarksToDisplay}"</p>
                                    </div>
                                    ` : ''}
                                    ${status === 'Approved' ? (
                                        leave.leaveType === 'Work From Home (WFH)' ? `
                                        <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 12px; margin-top: 15px;">
                                            <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.5;">
                                                🏠 <strong>Remote Duty Authorized:</strong> You are approved for Work From Home (${formattedStart} to ${formattedEnd}). You can mark your daily attendance directly from your remote workstation via the employee portal.
                                            </p>
                                        </div>
                                        ` : `
                                        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 15px;">
                                            <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                                                🔒 <strong>Notice:</strong> During your approved leave period (${formattedStart} to ${formattedEnd}), your daily attendance check-in portal will be automatically locked to prevent duplicate or conflicting logs. Portal check-in will reopen automatically upon your return.
                                            </p>
                                        </div>
                                        `
                                    ) : ''}
                                    <hr style="margin: 25px 0 15px; border: none; border-top: 1px solid #e2e8f0;">
                                    <small style="color: #94a3b8; font-size: 11px;">Automated notification generated by SN Enviro Systems via attendance@snenviro.in</small>
                                </div>
                            `
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
