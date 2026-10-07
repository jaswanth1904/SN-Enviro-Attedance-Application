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

// Custom Glowing Icon
const createGlowingIcon = (role, isDark) => {
    let color = '#3b82f6'; // Blue for Staff
    if (role === 'Application Engineer') color = '#ef4444'; // Red
    else if (role === 'Site Engineer') color = '#10b981'; // Green
    else if (role === 'Admin') color = '#a855f7'; // Purple

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                width: 28px; 
                height: 28px; 
                background-color: ${color}; 
                border-radius: 50%; 
                border: 4px solid ${isDark ? '#1e293b' : '#ffffff'};
                box-shadow: 0 0 20px ${color}, inset 0 0 8px rgba(255,255,255,0.7);
                animation: pulse 2.5s infinite;
            "></div>
            <style>
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 ${color}90; }
                    70% { box-shadow: 0 0 0 25px rgba(0,0,0,0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
                }
            </style>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

const TVLiveMap = () => {
    const [engineers, setEngineers] = useState([]);
    const [geoData, setGeoData] = useState(null);
    const [isDark, setIsDark] = useState(false); // Defaulting to light for better colorful look

    useEffect(() => {
        // Fetch India States GeoJSON for colorful political map overlay
        fetch('/india-states.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Failed to load India GeoJSON:', err));

        const fetchInitialData = async () => {
            try {
                // Fetch today's active attendances from the PUBLIC 24/7 endpoint
                const res = await api.get('/attendance/tv-reports');
                
                // Backend now perfectly returns exactly today's active attendances
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

                // Deduplicate by user (latest location)
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

        // Connect WebSocket
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5002');
        
        socket.on('attendance_logged', (newLog) => {
            // Check if it's a checkout
            if (newLog.checkOut) {
                // Remove from map
                setEngineers(prev => prev.filter(e => e.name !== newLog.user.name));
            } else {
                // Add or update on map
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
    }, []); // Removed user dependency since it's 24/7 public

    // Styling function to draw crisp state borders without any fill colors
    const getFeatureStyle = (feature) => {
        return {
            fillColor: 'transparent',
            weight: 2.5, // Stronger borders for Indian layout
            opacity: 1,
            color: isDark ? 'rgba(255,255,255,0.4)' : '#334155', // Clear state borders
            dashArray: '5, 5',
            fillOpacity: 0 // NO COLORS, just the borders!
        };
    };

    // No auth required - Public 24/7 TV Link

    // High Resolution Detailed Map Tiles (Rivers, Towns, Cities) - NO WATERMARKS
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        
    return (
        <div className="h-screen w-screen overflow-hidden bg-black relative">
            
            {/* Clean Professional Top Left Text Overlay */}
            <div className="absolute top-8 left-8 z-[500] pointer-events-none">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl shadow-2xl">
                    <h1 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>SN Enviro.</h1>
                    <p className="text-blue-400 font-bold tracking-widest text-xs mt-1 uppercase">MD's Live Map</p>
                </div>
            </div>

            <div className="absolute top-10 right-10 z-[500]">
                <button onClick={() => setIsDark(!isDark)} className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-full text-white shadow-2xl hover:bg-black/80 transition-all">
                    {isDark ? <Sun size={28} /> : <Moon size={28} />}
                </button>
            </div>

            {/* Pristine Fullscreen Map Area */}
            <div className={isDark ? 'dark-map-container' : ''} style={{ height: '100vh', width: '100vw' }}>
                <MapContainer 
                    center={[20.5937, 78.9629]} // Center of India
                    zoom={5} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false} // Cleanest possible UI
                >
                    <TileLayer
                        url={tileUrl}
                        maxZoom={19}
                    />
                    
                    {geoData && <GeoJSON data={geoData} style={getFeatureStyle} />}

                    {authorizedPlants.map((plant, index) => {
                        const activeEngineers = engineers.filter(e => e.site === plant.name);
                        const isActive = activeEngineers.length > 0;
                        const engineerNames = isActive ? activeEngineers.map(e => e.name).join(', ') : 'No Engineer Assigned';
                        
                        return (
                        <React.Fragment key={`plant-${index}`}>
                            <Circle 
                                center={[plant.lat, plant.lng]} 
                                radius={1000} 
                                pathOptions={{ color: isActive ? '#10b981' : '#ef4444', fillColor: isActive ? '#10b981' : '#ef4444', fillOpacity: 0.1, weight: 1.5 }} 
                            />
                            <Marker position={[plant.lat, plant.lng]}>
                                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                    <div className={`flex flex-col gap-2 p-3 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl border ${isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200/60'}`} style={{ minWidth: '220px', color: isDark ? '#ffffff' : '#1e293b' }}>
                                        <h3 className="font-bold text-sm tracking-tight leading-snug">{plant.name}</h3>
                                        <div className="flex flex-col gap-1 mt-1 border-t border-slate-500/20 pt-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                                <span style={{ color: isActive ? '#3b82f6' : 'inherit' }}>{engineerNames}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                <span>Industrial Site, India</span>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            {isActive ? (
                                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Active</span>
                                            ) : (
                                                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Unoccupied</span>
                                            )}
                                        </div>
                                    </div>
                                </Tooltip>
                            </Marker>
                        </React.Fragment>
                    )})}

                    {engineers.map((engineer) => (
                        <Marker 
                            key={engineer.id} 
                            position={engineer.position}
                            icon={createGlowingIcon(engineer.role, isDark)}
                            eventHandlers={{
                                mouseover: (e) => e.target.openPopup(),
                                mouseout: (e) => e.target.closePopup()
                            }}
                        >
                            <Popup className={isDark ? 'dark-popup pristine-card' : 'pristine-card'} autoPan={false} closeButton={false}>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                                        {engineer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg m-0 leading-tight tracking-tight" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{engineer.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest m-0" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>{engineer.role}</p>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-500/30">
                                    <p className="font-bold text-sm leading-snug flex items-start gap-1.5" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 opacity-70"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        <span>{engineer.site}</span>
                                    </p>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                        <Clock size={10} /> {engineer.time}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
        
        {/* CSS for custom pristine popups and Dark Mode Map Inversion */}
        <style>{`
            .dark-map-container .leaflet-layer,
            .dark-map-container .leaflet-control-zoom-in,
            .dark-map-container .leaflet-control-zoom-out,
            .dark-map-container .leaflet-control-attribution {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
            .pristine-card .leaflet-popup-content-wrapper {
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                padding: 4px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(0,0,0,0.05);
            }
            .pristine-card .leaflet-popup-content {
                margin: 12px;
                min-width: 220px;
            }
            .dark-popup.pristine-card .leaflet-popup-content-wrapper {
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
            }
            .leaflet-popup-tip-container, .leaflet-tooltip-tip {
                display: none; /* Remove the arrow for a cleaner floating look */
            }
            .leaflet-tooltip {
                background: transparent;
                border: none;
                box-shadow: none;
                padding: 0;
            }
        `}</style>
        </div>
    );
};

export default TVLiveMap;
