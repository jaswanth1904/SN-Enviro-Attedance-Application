const calculateDistance = require('../utils/distance');
const Site = require('../models/Site');

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

    // If siteId is not provided, we treat it as a service/field location (no radius check)
    if (!siteId) {
        req.isServiceLocation = true;
        return next();
    }

    try {
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
