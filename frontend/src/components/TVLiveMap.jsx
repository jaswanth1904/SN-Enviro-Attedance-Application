import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Activity, Sun, Moon } from 'lucide-react';
import { io } from 'socket.io-client';
import api from './api';

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

// Premium Custom Icons for Industrial Plants
const createPlantIcon = (isActive, isDark) => {
    // Unoccupied plants are vibrant amber/gold, Active ones are glowing emerald
    const color = isActive ? '#10b981' : '#f59e0b'; // Colorful theme!
    const size = isActive ? 22 : 16; // Slightly larger for better colorful visibility
    const glow = isActive ? `box-shadow: 0 0 15px ${color};` : `box-shadow: 0 0 10px ${color}80;`; // Add a soft glow to unoccupied plants too
    
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                width: ${size}px; 
                height: ${size}px; 
                background-color: ${color}; 
                border-radius: 50%; 
                border: 2px solid ${isDark ? '#0f172a' : '#ffffff'};
                ${glow}
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                ${!isActive ? `<div style="width: 4px; height: 4px; background: ${isDark ? '#cbd5e1' : '#ffffff'}; border-radius: 50%;"></div>` : ''}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
};

// Engineer Icon (Including WFH employees)
const createGlowingIcon = (role, isDark) => {
    let color = '#3b82f6'; // Blue for Staff / WFH
    if (role === 'Application Engineer') color = '#ef4444'; // Red
    else if (role === 'Site Engineer') color = '#10b981'; // Green
    else if (role === 'Admin') color = '#a855f7'; // Purple

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                width: 26px; 
                height: 26px; 
                background-color: ${color}; 
                border-radius: 50%; 
                border: 3px solid ${isDark ? '#0f172a' : '#ffffff'};
                box-shadow: 0 0 20px ${color}, inset 0 0 8px rgba(255,255,255,0.7);
                animation: pulse-ring 2s infinite;
            "></div>
            <style>
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 ${color}80; }
                    70% { box-shadow: 0 0 0 15px rgba(0,0,0,0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
                }
            </style>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });
};

const TVLiveMap = () => {
    const [engineers, setEngineers] = useState([]);
    const [geoData, setGeoData] = useState(null);
    const [isDark, setIsDark] = useState(false); // Default to Light theme as requested by user

    useEffect(() => {
        fetch('/india-states.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Failed to load India GeoJSON:', err));

        const fetchInitialData = async () => {
            try {
                const res = await api.get('/attendance/tv-reports');
                const activeAttendances = res.data.data;

                const activeMarkers = activeAttendances.map(a => ({
                    id: a._id,
                    name: a.user.name,
                    role: a.user.role,
                    position: [a.location.coordinates[1], a.location.coordinates[0]],
                    site: a.locationName || (a.site ? a.site.name : 'Unknown'),
                    time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    selfie: a.selfieUrl
                }));

                const uniqueMarkers = [];
                const seenUsers = new Set();
                for (const marker of activeMarkers) {
                    if (!seenUsers.has(marker.name)) {
                        seenUsers.add(marker.name);
                        uniqueMarkers.push(marker);
                    }
                }
                setEngineers(uniqueMarkers);
            } catch (error) {
                console.error("Failed to load map data", error);
            }
        };

        fetchInitialData();

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const socketUrl = apiUrl.replace(/\/api$/, '');
        const socket = io(socketUrl);
        socket.on('attendance_logged', (newLog) => {
            if (newLog.checkOut) {
                setEngineers(prev => prev.filter(e => e.name !== newLog.user.name));
            } else {
                const newMarker = {
                    id: newLog._id,
                    name: newLog.user.name,
                    role: newLog.user.role,
                    position: [newLog.location.coordinates[1], newLog.location.coordinates[0]],
                    site: newLog.locationName || (newLog.site ? newLog.site.name : 'Unknown'),
                    time: new Date(newLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setEngineers(prev => {
                    const filtered = prev.filter(e => e.name !== newMarker.name);
                    return [newMarker, ...filtered];
                });
            }
        });

        return () => socket.disconnect();
    }, []);

    const getFeatureStyle = () => ({
        fillColor: 'transparent',
        weight: 1.5,
        opacity: 0.3,
        color: isDark ? '#64748b' : '#94a3b8',
        dashArray: '3, 6',
        fillOpacity: 0
    });

    // Free Premium Tiles (Using OSM + CSS Inversion for perfect dark mode)
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        
    return (
        <div className={`h-screen w-screen overflow-hidden relative ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f8fafc]'}`}>
            
            {/* Cinematic Header - Responsive for Mobile, Laptop, and TV */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-[500] pointer-events-none">
                <div className={`pointer-events-auto backdrop-blur-2xl border px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-2xl md:rounded-3xl shadow-2xl transition-all ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200/50'}`}>
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'var(--font-serif)' }}>
                        SN Enviro<span className="text-brand-primary">.</span>
                    </h1>
                    <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-1.5">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className={`font-bold tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Global Command Center</p>
                    </div>
                </div>
            </div>

            {/* Dark Mode Toggle - Responsive positioning */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[500]">
                <button onClick={() => setIsDark(!isDark)} className={`backdrop-blur-xl border p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl transition-all hover:scale-105 ${isDark ? 'bg-black/50 border-white/10 text-white hover:bg-black/70' : 'bg-white/80 border-slate-200 text-slate-800 hover:bg-white'}`}>
                    {isDark ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
            </div>

            <div style={{ height: '100vh', width: '100vw' }} className={isDark ? 'dark-theme-map' : 'light-theme-map'}>
                <MapContainer 
                    center={[22.5937, 78.9629]} 
                    zoom={window.innerWidth < 768 ? 4 : 5.2} 
                    style={{ height: '100%', width: '100%', background: 'transparent' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer url={tileUrl} maxZoom={19} />
                    {geoData && <GeoJSON data={geoData} style={getFeatureStyle} />}

                    {/* Render Plants */}
                    {authorizedPlants.map((plant, index) => {
                        const activeEngineers = engineers.filter(e => e.site === plant.name);
                        const isActive = activeEngineers.length > 0;
                        const engineerNames = isActive ? activeEngineers.map(e => e.name).join(', ') : 'No Engineer Assigned';
                        
                        return (
                            <Marker key={`plant-${index}`} position={[plant.lat, plant.lng]} icon={createPlantIcon(isActive, isDark)}>
                                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                    <div className={`flex flex-col gap-2 p-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${isDark ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/95 border-slate-200'} transition-all`} style={{ minWidth: '220px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                                        <h3 className="font-bold text-sm tracking-tight">{plant.name}</h3>
                                        <div className={`flex flex-col gap-1.5 mt-1 border-t pt-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <div className="flex items-center gap-2 text-xs font-medium opacity-80">
                                                <Activity size={12} className={isActive ? 'text-emerald-500' : ''} />
                                                <span style={{ color: isActive ? (isDark ? '#34d399' : '#059669') : 'inherit' }}>{engineerNames}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Tooltip>
                            </Marker>
                        );
                    })}

                    {/* Render Engineers */}
                    {engineers.map((engineer) => (
                        <Marker 
                            key={engineer.id} 
                            position={engineer.position}
                            icon={createGlowingIcon(engineer.role, isDark)}
                            eventHandlers={{ mouseover: (e) => e.target.openPopup(), mouseout: (e) => e.target.closePopup() }}
                        >
                            <Popup className={`custom-premium-popup ${isDark ? 'dark' : 'light'}`} autoPan={false} closeButton={false}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                                            {engineer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-lg m-0 leading-none tracking-tight">{engineer.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-brand-primary">{engineer.role}</p>
                                        </div>
                                    </div>
                                    <div className={`mt-1 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                        <p className="font-semibold text-xs leading-snug flex items-start gap-2 opacity-90">
                                            <span className="mt-0.5 text-brand-primary">•</span>
                                            <span>{engineer.site}</span>
                                        </p>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-70">
                                            <Clock size={12} /> {engineer.time}
                                        </p>
                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            
            <style>{`
                .dark-theme-map .leaflet-layer {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
                .custom-premium-popup .leaflet-popup-content-wrapper {
                    border-radius: 20px;
                    padding: 4px;
                    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(16px);
                }
                .custom-premium-popup.light .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    color: #0f172a;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .custom-premium-popup.dark .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.95);
                    color: #f8fafc;
                    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.8);
                }
                .custom-premium-popup .leaflet-popup-content {
                    margin: 14px;
                    min-width: 240px;
                }
                .leaflet-popup-tip-container, .leaflet-tooltip-tip { display: none !important; }
                .leaflet-tooltip { background: transparent; border: none; box-shadow: none; padding: 0; }
                .leaflet-container { background: transparent !important; }
                
                /* Hide Leaflet watermark entirely for a cleaner look */
                .leaflet-control-container .leaflet-bottom.leaflet-right { display: none; }
            `}</style>
        </div>
    );
};

export default TVLiveMap;
