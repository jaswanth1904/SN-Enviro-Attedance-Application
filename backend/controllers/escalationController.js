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
        explanation.status = 'Submitted';
        explanation.token = null; // one-time use
        await explanation.save();

        res.status(200).json({ success: true, data: explanation });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getExplanations = async (req, res) => {
    try {
        let query = {};
        if (req.query.status && req.query.status !== 'All') {
            query.status = req.query.status;
        }

        const explanations = await Explanation.find(query)
            .populate('user', 'name role email department phoneNumber')
            .populate('reviewedBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({ 
            success: true, 
            count: explanations.length, 
            data: explanations 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.reviewExplanation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status = 'Reviewed', adminNotes = '' } = req.body;

        const explanation = await Explanation.findById(id);
        if (!explanation) {
            return res.status(404).json({ success: false, error: 'Explanation record not found.' });
        }

        explanation.status = status;
        if (adminNotes) explanation.adminNotes = adminNotes;
        explanation.reviewedBy = req.user ? req.user._id : null;
        explanation.reviewedAt = new Date();
        await explanation.save();

        const populated = await Explanation.findById(id)
            .populate('user', 'name role email department phoneNumber')
            .populate('reviewedBy', 'name email');

        res.status(200).json({ success: true, data: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
