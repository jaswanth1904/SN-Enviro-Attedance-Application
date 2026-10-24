const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin/User)
exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res, next) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({
            success: true,
            data: department
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res, next) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Department removed'
        });
    } catch (error) {
        next(error);
    }
};
