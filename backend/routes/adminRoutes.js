const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getOverviewStats, getLiveTracking, exportReport, sendAnnouncement } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('Admin', 'Application Engineer'));

router.get('/overview', getOverviewStats);
router.get('/live-tracking', getLiveTracking);
router.get('/export', exportReport);
router.post('/announcement', sendAnnouncement);

module.exports = router;
