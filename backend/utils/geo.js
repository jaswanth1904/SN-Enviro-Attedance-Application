const axios = require('axios');

/**
 * Get location name from coordinates using Google Reverse Geocoding
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @returns {Promise<string>} Location address or default message
 */
exports.reverseGeocode = async (lat, lng) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API Key missing. Falling back to coordinates.');
            return `Location (${lat}, ${lng})`;
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }

        return `Location (${lat}, ${lng})`;
    } catch (error) {
        console.error('Reverse Geocoding Error:', error.message);
        return `Location (${lat}, ${lng})`;
    }
};
