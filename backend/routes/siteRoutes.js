const express = require('express');
const { createSite, getSites } = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Admin'), createSite);
router.get('/', protect, getSites);

module.exports = router;
