const express = require('express');
const { getMySalary, createSalary, getAllSalaries } = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, authorize('Admin', 'Accountant'), getAllSalaries)
    .post(protect, authorize('Admin', 'Accountant'), createSalary);

router.get('/my', protect, getMySalary);

module.exports = router;
