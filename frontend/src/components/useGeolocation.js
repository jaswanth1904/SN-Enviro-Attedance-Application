import { useState, useEffect } from 'react';

export const useGeolocation = () => {
    const [location, setLocation] = useState({
        coords: null,
        city: '',
        fullAddress: '',
        error: null,
        loading: true,
    });

    const HQ_LAT = 17.4401202;
    const HQ_LNG = 78.5043297;

    const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getDetailedAddress = async (lat, lng) => {
        // Check if employee is within 1,000m of SN Enviro Head Office
        const distToHQ = calculateDistanceMeters(lat, lng, HQ_LAT, HQ_LNG);
        if (distToHQ <= 1000) {
            return {
                city: 'SN Enviro Head Office',
                townOrCity: 'SN Enviro Head Office',
                fullAddress: 'Corporate Headquarters, Secunderabad, Hyderabad, TS',
                isHeadOffice: true
            };
        }

        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await response.json();

            const street = data.locality || '';
            const city = data.city || data.localityInfo?.administrative?.find(a => a.adminLevel === 6 || a.adminLevel === 8)?.name || '';
            const rawState = data.principalSubdivision || '';

            // Clean up State Names to standard codes (TS / AP)
            let stateCode = '';
            if (rawState.includes('Telangana')) stateCode = 'Telangana';
            else if (rawState.includes('Andhra Pradesh')) stateCode = 'Andhra Pradesh';
            else if (data.principalSubdivisionCode) stateCode = data.principalSubdivisionCode.split('-')[1] || rawState;
            else stateCode = rawState;

            const primaryName = city || street || 'Location Active';
            const secondaryParts = [];
            if (street && street !== primaryName) secondaryParts.push(street);
            if (primaryName) secondaryParts.push(primaryName);
            if (stateCode) secondaryParts.push(stateCode);

            const fullAddress = secondaryParts.join(', ');

            return {
                city: primaryName,
                townOrCity: primaryName,
                fullAddress: fullAddress || primaryName,
                isHeadOffice: false
            };
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            return { 
                city: 'Location Detected', 
                townOrCity: 'Location Detected',
                fullAddress: 'Location Verified',
                isHeadOffice: false 
            };
        }
    };

    const getPosition = () => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setLocation({
                coords: null,
                city: '',
                fullAddress: '',
                error: 'Geolocation is not supported by your browser',
                loading: false,
            });
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const addressData = await getDetailedAddress(lat, lng);

                setLocation({
                    coords: { latitude: lat, longitude: lng },
                    city: addressData.city,
                    townOrCity: addressData.townOrCity,
                    fullAddress: addressData.fullAddress,
                    isHeadOffice: addressData.isHeadOffice,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                console.warn(`Geolocation Error (${error.code}): ${error.message}`);
                setLocation({
                    coords: null,
                    city: '',
                    fullAddress: '',
                    error: error.message,
                    loading: false,
                });
            },
            options
        );
    };

    useEffect(() => {
        getPosition();
    }, []);

    return { ...location, refresh: getPosition };
};
