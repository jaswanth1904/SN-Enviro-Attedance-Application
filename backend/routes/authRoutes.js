const express = require('express');
const { register, login, getMe, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateProfile);

module.exports = router;
