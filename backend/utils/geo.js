const axios = require('axios');

/**
 * Get location name from coordinates using Google Reverse Geocoding
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @returns {Promise<string>} Location address or default message
 */
exports.reverseGeocode = async (lat, lng) => {
    try {
        // Use free OpenStreetMap Nominatim API instead of requiring a Google Maps key
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'User-Agent': 'SN-Enviro-Attendance-App' } }
        );

        if (response.data && response.data.address) {
            const addr = response.data.address;
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            
            if (city && state) return `${city}, ${state}`;
            if (city) return city;
            if (response.data.display_name) {
                return response.data.display_name.split(',').slice(0, 2).join(', ');
            }
        }

        return `Remote Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`;
    } catch (error) {
        console.error('Reverse Geocoding Error:', error.message);
        return `Location (${lat}, ${lng})`;
    }
};

const authorizedPlants = [
    { name: "SN Enviro Head Office (Hyderabad)", lat: 17.4334, lng: 78.4357 },
    { name: "Ultratech Cement Limited (unit: Patratu Cement Works)", lat: 23.6187, lng: 85.2746 },
    { name: "THDC India Limited, Amelia Coal Block", lat: 24.0784, lng: 82.6487 },
    { name: "Test", lat: 13.207554, lng: 79.101252 },
    { name: "Ultratech Cement Limited (Unit: Hotgi Cement Works)", lat: 17.566, lng: 75.9928 },
    { name: "UltraTech Cement Ltd. (Unit- Manikgarh Cement Works)", lat: 19.7219, lng: 79.1738 },
    { name: "MAADURGA THERMAL POWER COMPANY LTD. (MTPCL)", lat: 20.5761, lng: 86.0201 },
    { name: "Ultratech Cements Limited (Unit :Sidhi Cements Works)", lat: 24.3241, lng: 81.3358 },
    { name: "Kade Global Industry", lat: 24.8992, lng: 92.8939 },
    { name: "GODAWARI POWER & ISPAT LTD (KACHCHE ARI DONGRI IRON ORE MINES)", lat: 20.4073, lng: 81.0631 },
    { name: "IOL Chemicals and pharmaceuticals Limited", lat: 30.9011, lng: 75.8819 },
    { name: "Dhirauli Coal Mines (Stratatech Minerals Resources Private Limited)", lat: 23.976217, lng: 82.326778 },
    { name: "UltraTech Cement Limited (Unit: Neem Ka Thana Cement Works)", lat: 27.6833, lng: 75.7088 },
    { name: "ALOK FERRO ALLOYS LIMITED", lat: 21.3157, lng: 81.6136 },
    { name: "Ultratech Cement Limited (unit: Jhajjar Cement Works)", lat: 28.5051, lng: 76.3672 },
    { name: "Indo Rama Synthetics (I) Ltd", lat: 20.922, lng: 78.9545 },
    { name: "Ultratech Cement Limited (unit: Shahjahanpur Cement Works)", lat: 27.8667, lng: 79.6789 },
    { name: "SCML", lat: 25.1793, lng: 92.3908 },
    { name: "Cipla Limited", lat: 12.7942, lng: 77.6574 },
    { name: "Grasim Industries Limited", lat: 17.0809, lng: 82.1443 },
    { name: "Ultratech Cement Limited (Unit :Patliputra Cement Works)", lat: 25.3967, lng: 85.2899 },
    { name: "Grasim Industries Ltd Staple Fibre Division", lat: 23.4453, lng: 75.4097 },
    { name: "Bharat Aluminium Company Limited", lat: 22.3982, lng: 82.74 },
    { name: "Ultratech Cement Limited (unit: Birla White Cement Works)", lat: 26.8753, lng: 75.7064 },
    { name: "Ultratech cements limited (Unit :Magadalla Cement Works)", lat: 21.15534, lng: 72.76667 },
    { name: "GRINDWELL NORTON LIMITED", lat: 13.0609, lng: 77.7384 },
    { name: "MSP STEEL & POWER LTD", lat: 21.8974, lng: 83.394963 },
    { name: "M/s Ultratech Cement Limited, Unit- NARMADA Cement Ratnagiri Works", lat: 17.007121, lng: 73.335799 },
    { name: "TEST-1", lat: 12.905, lng: 77.5824 },
    { name: "Ultratech Cement Limited (Unit: Pune Bulk Terminal)", lat: 18.4944, lng: 74.097 },
    { name: "Godawari Power & Ispat Ltd.", lat: 21.3798, lng: 81.6804 },
    { name: "APL APOLLO BUILDING PRODUCTS LTD.", lat: 21.635, lng: 81.8069 },
    { name: "Bihar Distillers & Bottlers Pvt Ltd", lat: 25.4104, lng: 84.5289 },
    { name: "Adani Power Limited", lat: 13.1634, lng: 74.8123 },
    { name: "Hira Ferro Alloys Ltd.", lat: 21.3156, lng: 81.6153 },
    { name: "Hira Ferro Alloys Ltd - Display File", lat: 21.3156, lng: 81.6153 },
    { name: "UltraTech Cement Ltd Unit - Vikram Cemets Works (Lime Stone Mine - III)", lat: 24.5791, lng: 74.8053 },
    { name: "Ultra Tech Cements Ltd Unit Vikram Cemets Works - Mines", lat: 24.586069, lng: 74.805232 },
    { name: "ULTRA TECH CEMENT LIMITED (Unit: Neem Ka Thana Cement Works)", lat: 27.6833, lng: 75.7088 },
    { name: "Ultratech Cement Limited (unit: Dhar Cement Works) - Mines", lat: 22.2646, lng: 75.1358 },
    { name: "KASHI VISHWANATH STEEL PVT LTD", lat: 29.1887, lng: 79.0025 },
    { name: "Shree Agra Cement Plant (A Unit of Shree Cement East Private Limited)", lat: 27.4904, lng: 78.8324 },
    { name: "Ultratech Cement Limited (unit: Ginigera Cement Works)", lat: 15.3514, lng: 76.2635 },
    { name: "Ultratech Cement Limited (unit : Rawan Cement Works)", lat: 21.5776, lng: 82.0202 },
    { name: "Nuvoco Vistas Corporation Limited", lat: 24.7141, lng: 74.6709 },
    { name: "UltraTech Cement Limited (Unit: Sarla Nagar Cement Works)", lat: 17.1585, lng: 77.29 },
    { name: "BS SPONGE LIMITED", lat: 22.57058, lng: 88.3546 },
    { name: "Ultratech Cement Limited (unit: Bathinda Cement Works)", lat: 30.27328, lng: 75.162242 },
    { name: "UltraTech Cement Limited, Unit - Kukurdih Cement Works", lat: 21.6294, lng: 82.068 },
    { name: "Symbiotec Pharmalab Private Limited", lat: 22.6375, lng: 75.8346 },
    { name: "UltraTech Cements Limited (Unit: Basanth Nagar Cement Works)", lat: 18.7122, lng: 79.4052 },
    { name: "Shree Cement Limited (Bangur Cement Unit)", lat: 26.264738, lng: 74.19047 },
    { name: "UTCL - DALLA CEMENT WORKS", lat: 24.450435, lng: 83.041862 },
    { name: "Ultratech cements Ltd (unit: Andhra cements works)", lat: 15.026, lng: 78.0144 },
    { name: "Ultratech Cement Limited (unit: Dalla Cement Works)", lat: 24.4459, lng: 83.0771 },
    { name: "Ultratech Cement Limited (unit: Dhar Cement Works)", lat: 22.2665, lng: 75.1333 },
    { name: "LANXESS INIDA PRIVATE LIMITED", lat: 23.4411, lng: 75.4064 },
    { name: "Vikram Cemets Works", lat: 24.586069, lng: 74.805232 },
    { name: "Ultratech Cement Limited (unit:Nathdwara Cement Works)", lat: 24.8209, lng: 73.0898 },
    { name: "Maharashtra State Power Generation Company Limited", lat: 22.162, lng: 83.5321 },
    { name: "UltraTech Cement Ltd. (Unit- Dhule Cement Works)", lat: 21.1532, lng: 74.8505 },
    { name: "Ultratech Cement Limited (unit: Kotputli Cement Works)", lat: 27.798, lng: 76.2419 },
    { name: "Vedanta Limited Chhattisgarh Thermal Power Plant", lat: 21.9061, lng: 83.1289 },
    { name: "Ultratech Cement Limited (unit: Hirmi Cement Works)", lat: 21.5437, lng: 81.9471 },
    { name: "Ultratech Cement Limited (unit: Rajpura Cement Works)", lat: 30.5648, lng: 76.5822 },
    { name: "Ultratech Cement Limited (Unit: Baikunth Cement Works)", lat: 21.4952, lng: 81.7844 },
    { name: "UltraTech Cement Ltd (unit: Bara Cement Works)", lat: 25.1959, lng: 81.6454 },
    { name: "Ultratech cements limited (Unit :Sewagram Cement Works)", lat: 23.4295, lng: 68.7115 },
    { name: "Ultratech cements limited(Unit: Gujarat Cement Works)", lat: 20.90553, lng: 71.46051 },
    { name: "UltraTech Cement Limited. (Unit : Maihar Cement Works)", lat: 24.2047, lng: 80.8027 },
    { name: "ULTRA TECH CEMENT BELA CEMENT WORKS", lat: 24.501168, lng: 81.220635 },
    { name: "Ultratech Cement Limited (unit : Pali Cement Works)", lat: 26.2584, lng: 74.0904 },
    { name: "UltraTech Cement Ltd. (Unit- Dadri Cement Works)", lat: 28.578, lng: 77.5926 },
    { name: "Star Cement Limited", lat: 22.5173, lng: 88.2992 },
    { name: "Ultratech Cement Limited (unit: Arakkonam Cement Works)", lat: 13.0773, lng: 79.6138 },
    { name: "Ultratech Cement Limited (unit: Balaji Cement Works)", lat: 16.8711, lng: 80.022 },
    { name: "Ultratech Cement Limited (Unit: Reddipalayam Cement Works)(Thermal Power Plant)", lat: 11.1079, lng: 79.1747 },
    { name: "UltraTech Cement Ltd (Unit : APCW, Andhra Pradesh Cement Works - Mining)", lat: 15.026, lng: 78.0144 },
    { name: "Ultratech Cement Limited (Unit: Karur Cement Works)", lat: 10.492316, lng: 78.07511 },
    { name: "Ultratech Cement Limited (Unit: panipat Cement Works)", lat: 29.2894, lng: 76.8095 },
    { name: "Jayaswal Neco Industries Limited", lat: 21.3521, lng: 81.6606 },
    { name: "UltraTech Cement Ltd.(Unit: Petnikota Cement Works)", lat: 15.0709, lng: 78.081 },
    { name: "UltraTech Cement Ltd. (Unit- Vizag Cement Works)", lat: 17.946, lng: 83.2026 },
    { name: "Ultratech Cement Limited (Unit: Nathdwara Cement Work)", lat: 24.8209, lng: 73.0898 },
    { name: "Sidhi Cement Works, (A unit of UltraTech Cement Ltd.) Thermal Power Plant", lat: 24.3256, lng: 81.3315 },
    { name: "Ultratech Cement Limited (unit: Aligarh Cement Works)", lat: 28.023454, lng: 78.166783 },
    { name: "Star Cement Meghalaya Limited", lat: 25.1793, lng: 92.3908 },
    { name: "Ultratech Cement Limited (unit: Aditya Cement Works)", lat: 24.7613, lng: 74.6117 },
    { name: "Ultratech Cement Limited (Unit: Reddipalayam Cement Works)", lat: 11.1079, lng: 79.1747 },
    { name: "Ultratech cements limited (Unit :Nagpur Cement Works)", lat: 21.2489, lng: 79.3704 },
    { name: "Ultratech Cement Limited (Unit: Baga Cement Works)", lat: 31.329, lng: 76.8916 },
    { name: "Ultratech Cement Limited (unit: Rajashree Cement Works )", lat: 17.1408, lng: 77.1726 }
];

exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

exports.verifyPlantGeofence = (engineerLat, engineerLng) => {
    let closestPlant = null;
    let shortestDistance = Infinity;

    for (const plant of authorizedPlants) {
        const distance = exports.calculateDistance(engineerLat, engineerLng, plant.lat, plant.lng);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestPlant = plant;
        }
    }

    return {
        plant: closestPlant,
        distanceMeters: shortestDistance,
        isAuthorized: shortestDistance <= 1000 // 1.0 KM cutoff
    };
};

exports.authorizedPlants = authorizedPlants;
