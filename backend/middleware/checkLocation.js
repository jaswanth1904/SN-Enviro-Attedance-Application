const calculateDistance = require('../utils/distance');
const Site = require('../models/Site');
const Leave = require('../models/Leave');

/**
 * Middleware to check if the user's provided location is within the allowed radius of the site.
 * Expects siteId, latitude, and longitude in req.body.
 */
const checkLocation = async (req, res, next) => {
    const { siteId, latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Please provide latitude and longitude'
        });
    }

    try {
        // If employee has an Approved Work From Home (WFH) for today, allow check-in from anywhere
        if (req.user) {
            const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            const startOfDay = new Date(`${todayStr}T00:00:00.000+05:30`);
            const endOfDay = new Date(`${todayStr}T23:59:59.999+05:30`);
            const activeWFH = await Leave.findOne({
                user: req.user.id || req.user._id,
                status: 'Approved',
                leaveType: 'Work From Home (WFH)',
                startDate: { $lte: endOfDay },
                endDate: { $gte: startOfDay }
            });
            if (activeWFH) {
                req.isServiceLocation = true;
                req.isWFH = true;
                return next();
            }

            // Tech and Field/Regional roles authorized for flexible/service check-in
            const isTechRole = ['Software Developer', 'Embedded Engineer', 'Field Application Engineer', 'Application Regional Manager', 'Application regional manager', 'Application Engineer', 'Office Employee'].includes(req.user.role);
            if (isTechRole) {
                req.isServiceLocation = true;
                return next();
            }
        }

        // If siteId is not provided, we treat it as a service/field location (no radius check)
        if (!siteId) {
            req.isServiceLocation = true;
            return next();
        }

        const site = await Site.findById(siteId);

        if (!site) {
            return res.status(404).json({
                success: false,
                error: 'Site not found'
            });
        }

        const distance = calculateDistance(
            latitude,
            longitude,
            site.location.coordinates[1],
            site.location.coordinates[0]
        );

        // Requirement: < site.radius meters
        if (distance > site.radius) {
            return res.status(403).json({
                success: false,
                error: `Out of bounds. You are ${Math.round(distance)}m away from the site. Allowed radius is ${site.radius}m.`,
                distance: Math.round(distance)
            });
        }

        // Attach distance and site to request for use in controller
        req.distance = distance;
        req.site = site;
        req.isServiceLocation = false;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = checkLocation;
