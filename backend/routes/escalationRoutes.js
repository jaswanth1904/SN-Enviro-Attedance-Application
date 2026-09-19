const express = require('express');
const { submitExplanation, getExplanations } = require('../controllers/escalationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', submitExplanation); // Public or token-based
router.get('/', protect, authorize('Admin', 'Application Engineer'), getExplanations);

module.exports = router;
