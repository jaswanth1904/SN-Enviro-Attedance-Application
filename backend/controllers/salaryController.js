const Salary = require('../models/Salary');

// @desc    Get current user's salary history
// @route   GET /api/salary/my
// @access  Private
exports.getMySalary = async (req, res, next) => {
    try {
        const salary = await Salary.find({ user: req.user.id }).sort('-month');

        res.status(200).json({
            success: true,
            count: salary.length,
            data: salary
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create/Update salary record (Admin only)
// @route   POST /api/salary
// @access  Private (Admin/Accountant)
exports.createSalary = async (req, res, next) => {
    try {
        const salary = await Salary.create(req.body);

        res.status(201).json({
            success: true,
            data: salary
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all salary records
// @route   GET /api/salary
// @access  Private (Admin/Accountant)
exports.getAllSalaries = async (req, res, next) => {
    try {
        const salaries = await Salary.find().populate('user', 'name email').sort('-month');

        res.status(200).json({
            success: true,
            count: salaries.length,
            data: salaries
        });
    } catch (error) {
        next(error);
    }
};
