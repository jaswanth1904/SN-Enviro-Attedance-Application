const Explanation = require('../models/Explanation');
const User = require('../models/User');

exports.submitExplanation = async (req, res) => {
    try {
        const { token, reason } = req.body;
        
        // Find explanation by token
        const explanation = await Explanation.findOne({ token });
        
        if (!explanation) {
            return res.status(404).json({ success: false, error: 'Invalid or expired escalation token.' });
        }

        explanation.reason = reason;
        explanation.status = 'Reviewed';
        explanation.token = null; // one-time use
        await explanation.save();

        res.status(200).json({ success: true, data: explanation });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getExplanations = async (req, res) => {
    try {
        const explanations = await Explanation.find().populate('user', 'name role email').sort('-createdAt');
        res.status(200).json({ success: true, data: explanations });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
