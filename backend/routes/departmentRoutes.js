const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getDepartments)
    .post(authorize('Admin', 'Application Engineer'), createDepartment);

router.route('/:id')
    .delete(authorize('Admin', 'Application Engineer'), deleteDepartment);

module.exports = router;
