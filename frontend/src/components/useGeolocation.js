import { useState, useEffect } from 'react';

export const useGeolocation = () => {
    const [location, setLocation] = useState({
        coords: null,
        city: '',
        fullAddress: '',
        error: null,
        loading: true,
    });

    const getDetailedAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await response.json();

            // Detailed address logic
            // locality: Street or neighborhood level (e.g. Madhapur)
            // city: City (e.g. Hyderabad)
            // principalSubdivision: State (e.g. Telangana)
            // principalSubdivisionCode: TS/AP

            const street = data.locality || '';
            const city = data.city || '';
            const rawState = data.principalSubdivision || '';

            // Clean up State Names to SN Enviro standard Codes (TS / AP)
            let stateCode = '';
            if (rawState.includes('Telangana')) stateCode = 'TS';
            else if (rawState.includes('Andhra Pradesh')) stateCode = 'AP';
            else if (data.principalSubdivisionCode) stateCode = data.principalSubdivisionCode.split('-')[1] || rawState;
            else stateCode = rawState;

            // Combine into a professional SN Enviro address format
            const fullAddress = [street, city, stateCode].filter(Boolean).join(', ');

            return {
                city: city || street || 'Location Detected',
                fullAddress: fullAddress || 'Address Identified'
            };
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            return { city: 'Location Detected', fullAddress: 'Location Detected' };
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
                    fullAddress: addressData.fullAddress,
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
