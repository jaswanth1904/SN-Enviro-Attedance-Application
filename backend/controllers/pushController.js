const User = require('../models/User');

// @desc    Subscribe user to web push
// @route   POST /api/push/subscribe
// @access  Private
exports.subscribeToPush = async (req, res, next) => {
    try {
        const subscription = req.body;
        
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, error: 'Invalid subscription object' });
        }

        // Save subscription to the logged-in user
        await User.findByIdAndUpdate(req.user.id, {
            pushSubscription: subscription
        });

        res.status(200).json({
            success: true,
            message: 'Push subscription saved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public VAPID key
// @route   GET /api/push/vapid-public-key
// @access  Public
exports.getVapidPublicKey = (req, res, next) => {
    res.status(200).json({
        success: true,
        publicKey: process.env.VAPID_PUBLIC_KEY
    });
};
