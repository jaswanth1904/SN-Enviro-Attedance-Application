const express = require('express');
const { submitExplanation, getExplanations, reviewExplanation } = require('../controllers/escalationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', submitExplanation); // Public or token-based
router.get('/', protect, authorize('Admin', 'Application Engineer'), getExplanations);
router.put('/:id/review', protect, authorize('Admin', 'Application Engineer'), reviewExplanation);

module.exports = router;
