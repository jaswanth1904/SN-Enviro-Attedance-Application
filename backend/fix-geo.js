const fs = require('fs');

let code = fs.readFileSync('./utils/geo.js', 'utf8');

const targetStr = `        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API Key missing. Falling back to coordinates.');
            return \`Location (\${lat}, \${lng})\`;
        }

        const response = await axios.get(
            \`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${lat},\${lng}&key=\${apiKey}\`
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }

        return \`Location (\${lat}, \${lng})\`;`;

const replStr = `        // Use free OpenStreetMap Nominatim API instead of requiring a Google Maps key
        const response = await axios.get(
            \`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`,
            { headers: { 'User-Agent': 'SN-Enviro-Attendance-App' } }
        );

        if (response.data && response.data.address) {
            const addr = response.data.address;
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            
            if (city && state) return \`\${city}, \${state}\`;
            if (city) return city;
            if (response.data.display_name) {
                return response.data.display_name.split(',').slice(0, 2).join(', ');
            }
        }

        return \`Remote Location (\${Number(lat).toFixed(4)}, \${Number(lng).toFixed(4)})\`;`;

// Normalize line endings
code = code.replace(/\r\n/g, '\n');

code = code.replace(targetStr, replStr);
fs.writeFileSync('./utils/geo.js', code);
