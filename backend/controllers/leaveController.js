const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res, next) => {
    try {
        req.body.user = req.user.id;
        const leave = await Leave.create(req.body);

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
        );

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        next(error);
    }
};
