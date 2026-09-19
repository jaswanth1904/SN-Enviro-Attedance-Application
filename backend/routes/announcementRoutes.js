const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createAnnouncement, getAdminAnnouncements, getUserAnnouncements, markAsRead, deleteAnnouncement } = require('../controllers/announcementController');

// All routes require login
router.use(protect);

router.get('/', getUserAnnouncements);
router.put('/:id/read', markAsRead);

// Admin / MD restricted routes
router.use(authorize('Admin', 'Application Engineer'));

router.route('/')
    .post(createAnnouncement);

router.route('/admin')
    .get(getAdminAnnouncements);

router.route('/:id')
    .delete(deleteAnnouncement);

module.exports = router;
