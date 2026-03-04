const express = require('express');
const { recordAttendance, getReports, recordImmediateAttendance, importAttendance, getMyAttendance, checkOutAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const checkLocation = require('../middleware/checkLocation');
const { upload, csvUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/my', protect, getMyAttendance);
router.post('/', protect, checkLocation, recordAttendance);
router.put('/checkout/:id', protect, checkOutAttendance);
router.post('/immediate', protect, upload.single('selfie'), checkLocation, recordImmediateAttendance);
router.post('/import', protect, authorize('Admin', 'Senior'), csvUpload.single('file'), importAttendance);
router.get('/reports', protect, authorize('Senior', 'Admin'), getReports);

module.exports = router;
