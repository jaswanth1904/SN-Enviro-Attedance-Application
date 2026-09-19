import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Users, Filter, Clock, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import api from '../api';
import { io } from 'socket.io-client';

const MapRefresher = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return null;
};

// Custom Markers for different statuses
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div class="relative w-6 h-6 flex items-center justify-center">
        <div class="absolute w-full h-full rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>
        <div class="relative w-3 h-3 rounded-full shadow-[0_0_10px_${color}]" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const iconOnTime = createCustomIcon('#10b981'); // Emerald
const iconLate = createCustomIcon('#ef4444');   // Red
const iconOffice = createCustomIcon('#2563eb'); // Blue

const LiveTrackingMap = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [allEngineers, setAllEngineers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await api.get('/admin/live-tracking');
        if (res.data.success) {
          setAllEngineers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch live tracking', err);
      }
    };
    fetchLive();

    // Establish WebSocket Connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5002');
    
    socket.on('attendance_logged', (newAtt) => {
      const time = new Date(newAtt.timestamp);
      const isLate = (time.getHours() > 10 || (time.getHours() === 10 && time.getMinutes() >= 30));
      
      const mapItem = {
        id: newAtt._id,
        name: newAtt.user?.name || 'Unknown',
        role: newAtt.user?.role || 'Staff',
        city: newAtt.locationName || newAtt.site?.name || 'Location Logged',
        lat: newAtt.location?.coordinates[1] || 20.5937,
        lng: newAtt.location?.coordinates[0] || 78.9629,
        status: isLate ? 'late' : 'on-time',
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setAllEngineers(prev => [mapItem, ...prev.filter(e => e.id !== mapItem.id)]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') setFilteredData(allEngineers);
    else setFilteredData(allEngineers.filter(e => e.status === activeFilter));
  }, [activeFilter, allEngineers]);

  const getIcon = (status) => {
    if (status === 'office') return iconOffice;
    if (status === 'late') return iconLate;
    return iconOnTime;
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-50 overflow-hidden relative rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Sidebar / HUD */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-[380px] flex-[0.4] md:flex-none md:h-full bg-white border-r border-slate-200 z-[1000] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-lg relative"
      >
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-600" />
            Live Tracker
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            SN Enviro Field Tracking
          </p>
        </div>

        <div className="p-4 flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50 hide-scrollbar">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            All ({allEngineers.length})
          </button>
          <button 
            onClick={() => setActiveFilter('on-time')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'on-time' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50'}`}
          >
            On Time
          </button>
          <button 
            onClick={() => setActiveFilter('late')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'late' ? 'bg-red-500 text-white shadow-md' : 'bg-white border border-slate-200 text-red-500 hover:bg-red-50'}`}
          >
            Escalated
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {filteredData.map(emp => (
            <div key={emp.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{emp.name}</h4>
                {emp.status === 'late' && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">{emp.role}</p>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold">
                  {emp.city}
                </span>
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {emp.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Map Container */}
      <div className="flex-[0.6] md:flex-1 relative order-first md:order-last min-h-0">
        <MapContainer 
          center={[20.5937, 78.9629]} // Center of India
          zoom={5} 
          style={{ height: '100%', width: '100%', background: '#f8fafc' }}
          zoomControl={false}
        >
          <MapRefresher />
          {/* Default OSM basemap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredData.map(emp => (
            <Marker key={emp.id} position={[emp.lat, emp.lng]} icon={getIcon(emp.status)}>
              <Popup className="futuristic-popup">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl min-w-[200px]">
                  <div className="font-bold text-lg text-slate-900 mb-1">{emp.name}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3">{emp.role}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-slate-500 mb-1">Location</span>
                      <span className="font-bold text-slate-800">{emp.city}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Login Time</span>
                      <span className={`font-bold ${emp.status === 'late' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {emp.time}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Tactical UI Overlays */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            System Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-slate-600 font-medium">Active Uplinks:</span>
              <span className="font-bold text-emerald-600">{allEngineers.filter(e => e.status !== 'late').length}/{allEngineers.length}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-600 font-medium">Anomalies:</span>
              <span className="font-bold text-red-500">{allEngineers.filter(e => e.status === 'late').length} Detected</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Required for Leaflet Custom Popups in Tailwind */}
      <style>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default LiveTrackingMap;
