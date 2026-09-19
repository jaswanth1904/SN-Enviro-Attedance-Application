const express = require('express');
const { subscribeToPush, getVapidPublicKey } = require('../controllers/pushController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/subscribe', protect, subscribeToPush);
router.get('/vapid-public-key', getVapidPublicKey);

module.exports = router;
