const express = require('express');
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, authorize('Admin', 'Senior'), getAllLeaves)
    .post(protect, applyLeave);

router.get('/my', protect, getMyLeaves);

router.put('/:id', protect, authorize('Admin', 'Senior'), updateLeaveStatus);

module.exports = router;
