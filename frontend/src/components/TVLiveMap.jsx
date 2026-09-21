import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Activity, Sun, Moon } from 'lucide-react';
import { io } from 'socket.io-client';
import api from './api';

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
            .leaflet-popup-tip-container {
                display: none; /* Remove the arrow for a cleaner floating look */
            }
        `}</style>
        </div>
    );
};

export default TVLiveMap;
