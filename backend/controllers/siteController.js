const Site = require('../models/Site');

// @desc    Create a site
// @route   POST /api/sites
// @access  Private (Admin)
exports.createSite = async (req, res, next) => {
    try {
        const site = await Site.create(req.body);
        res.status(201).json({
            success: true,
            data: site
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all sites
// @route   GET /api/sites
// @access  Private
exports.getSites = async (req, res, next) => {
    try {
        const sites = await Site.find();
        res.status(200).json({
            success: true,
            count: sites.length,
            data: sites
        });
    } catch (error) {
        next(error);
    }
};
