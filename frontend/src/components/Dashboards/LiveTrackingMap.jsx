import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Users, Filter, Clock, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import api, { getSocketUrl } from '../api';
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

// Auto fly-to when employee card is selected
const MapFlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.flyTo([target.displayLat || target.lat, target.displayLng || target.lng], 14, { duration: 1.2 });
    }
  }, [target, map]);
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

// Dynamic pulsing radar icon for live traveling employees (Metro, Transit, Road)
const iconMoving = L.divIcon({
  className: 'custom-moving-icon',
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-full h-full rounded-full animate-ping opacity-75 bg-cyan-400"></div>
      <div class="relative w-5 h-5 rounded-full shadow-[0_0_12px_#06b6d4] bg-cyan-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
        ⚡
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const LiveTrackingMap = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [allEngineers, setAllEngineers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

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
    const socket = io(getSocketUrl());
    
    socket.on('attendance_logged', (newAtt) => {
      const time = new Date(newAtt.timestamp);
      const istTime = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const isLate = newAtt.status === 'Late' || hours > 10 || (hours === 10 && minutes >= 30);
      
      const mapItem = {
        id: newAtt._id,
        userId: newAtt.user?._id || newAtt.user?.id || newAtt._id,
        name: newAtt.user?.name || 'Unknown',
        role: newAtt.user?.role || 'Staff',
        city: newAtt.locationName || newAtt.site?.name || 'Location Logged',
        lat: newAtt.location?.coordinates[1] || 20.5937,
        lng: newAtt.location?.coordinates[0] || 78.9629,
        status: isLate ? 'late' : 'on-time',
        isMoving: false,
        time: time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
      };
      
      setAllEngineers(prev => [mapItem, ...prev.filter(e => e.id !== mapItem.id && e.userId !== mapItem.userId)]);
    });

    // Real-time live movement stream from employee GPS (>50m or travel)
    socket.on('employee_moved', (data) => {
      setAllEngineers(prev => {
        const idToMatch = data.userId || data.id;
        const exists = prev.some(e => e.userId === idToMatch || e.id === idToMatch);

        if (exists) {
          return prev.map(e => {
            if (e.userId === idToMatch || e.id === idToMatch) {
              return {
                ...e,
                lat: data.lat,
                lng: data.lng,
                city: data.locationName || e.city,
                isMoving: data.isMoving,
                speed: data.speed,
                lastMovementAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              };
            }
            return e;
          });
        } else {
          return [{
            id: idToMatch,
            userId: idToMatch,
            name: data.name || 'Employee',
            role: data.role || 'Staff',
            city: data.locationName || 'Live Tracker',
            lat: data.lat,
            lng: data.lng,
            status: data.status || 'on-time',
            isMoving: data.isMoving,
            speed: data.speed,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, ...prev];
        }
      });
    });

    // Shift checkout -> stop moving tracker
    socket.on('employee_stopped_tracking', (data) => {
      setAllEngineers(prev => {
        const idToMatch = data.userId || data.id;
        return prev.map(e => {
          if (e.userId === idToMatch || e.id === idToMatch) {
            return {
              ...e,
              isMoving: false,
              checkedOut: true
            };
          }
          return e;
        });
      });
    });

    // App Minimized / Screen Locked -> Show Last Known Location Spot & Warning
    socket.on('employee_minimized', (data) => {
      setAllEngineers(prev => {
        const idToMatch = data.userId || data.id;
        const timeStr = new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return prev.map(e => {
          if (e.userId === idToMatch || e.id === idToMatch) {
            return {
              ...e,
              lat: data.lat || e.lat,
              lng: data.lng || e.lng,
              isMoving: false,
              isMinimized: true,
              city: `${(data.locationName || e.city).replace(/\s*\(App Minimized.*?\)/, '')} (App Minimized ${timeStr})`,
              minimizedAt: timeStr
            };
          }
          return e;
        });
      });
    });

    // App Resumed -> Clear Minimized status
    socket.on('employee_resumed', (data) => {
      setAllEngineers(prev => {
        const idToMatch = data.userId || data.id;
        return prev.map(e => {
          if (e.userId === idToMatch || e.id === idToMatch) {
            return {
              ...e,
              isMinimized: false,
              city: e.city.replace(/\s*\(App Minimized.*?\)/, '')
            };
          }
          return e;
        });
      });
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') setFilteredData(allEngineers);
    else if (activeFilter === 'moving') setFilteredData(allEngineers.filter(e => e.isMoving));
    else setFilteredData(allEngineers.filter(e => e.status === activeFilter));
  }, [activeFilter, allEngineers]);

  // Disperse overlapping markers so engineers at the same site/office are both visible
  const dispersedEngineers = useMemo(() => {
    const coordBuckets = {};
    return filteredData.map((emp) => {
      const latNum = Number(emp.lat) || 20.5937;
      const lngNum = Number(emp.lng) || 78.9629;
      const bucketKey = `${latNum.toFixed(4)}_${lngNum.toFixed(4)}`;
      if (!coordBuckets[bucketKey]) {
        coordBuckets[bucketKey] = 0;
      }
      const indexInBucket = coordBuckets[bucketKey];
      coordBuckets[bucketKey] += 1;

      let displayLat = latNum;
      let displayLng = lngNum;

      if (indexInBucket > 0) {
        // Disperse overlapping pins in a neat small ring (~45m)
        const angle = (indexInBucket * (2 * Math.PI)) / 6;
        const radius = 0.00045;
        displayLat += radius * Math.cos(angle);
        displayLng += radius * Math.sin(angle);
      }

      return {
        ...emp,
        displayLat,
        displayLng
      };
    });
  }, [filteredData]);

  const getIcon = (emp) => {
    if (emp.isMinimized) return iconLate; // Amber/Red alert for minimized
    if (emp.isMoving) return iconMoving;
    if (emp.city?.includes('Head Office')) return iconOffice;
    if (emp.status === 'late') return iconLate;
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            All ({allEngineers.length})
          </button>
          <button 
            onClick={() => setActiveFilter('moving')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${activeFilter === 'moving' ? 'bg-cyan-600 text-white shadow-md' : 'bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Moving ({allEngineers.filter(e => e.isMoving).length})
          </button>
          <button 
            onClick={() => setActiveFilter('on-time')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'on-time' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50'}`}
          >
            On Time ({allEngineers.filter(e => e.status !== 'late').length})
          </button>
          <button 
            onClick={() => setActiveFilter('late')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'late' ? 'bg-red-500 text-white shadow-md' : 'bg-white border border-slate-200 text-red-500 hover:bg-red-50'}`}
          >
            Escalated ({allEngineers.filter(e => e.status === 'late').length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {dispersedEngineers.map(emp => (
            <div 
              key={emp.id} 
              onClick={() => setSelectedEmp(emp)}
              className={`p-4 rounded-xl bg-white border transition-all cursor-pointer group ${
                selectedEmp?.id === emp.id 
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                  : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  {emp.name}
                  {emp.isMoving && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                      ⚡ Moving
                    </span>
                  )}
                </h4>
                {emp.status === 'late' && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2.5">{emp.role}</p>
              
              <div className="flex justify-between items-center text-xs">
                <span className={`px-2.5 py-1 rounded-md font-bold truncate max-w-[200px] ${
                  emp.isMoving 
                    ? 'text-cyan-800 bg-cyan-50 border border-cyan-200' 
                    : emp.city?.includes('Head Office')
                      ? 'text-blue-800 bg-blue-50 border border-blue-200'
                      : 'text-slate-700 bg-slate-100'
                }`}>
                  {emp.city}
                </span>
                <span className="text-slate-500 flex items-center gap-1 font-medium shrink-0">
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
          <MapFlyTo target={selectedEmp} />
          {/* Default OSM basemap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {dispersedEngineers.map(emp => (
            <Marker key={emp.id} position={[emp.displayLat, emp.displayLng]} icon={getIcon(emp)}>
              <Popup className="futuristic-popup">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl min-w-[220px]">
                  <div className="font-bold text-lg text-slate-900 mb-0.5 flex items-center justify-between">
                    <span>{emp.name}</span>
                    {emp.isMoving && <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full font-bold">⚡ In Transit</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3">{emp.role}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-slate-500 mb-0.5">Location</span>
                      <span className="font-bold text-slate-800">{emp.city}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-0.5">{emp.isMoving ? 'Live Speed' : 'Login Time'}</span>
                      <span className={`font-bold ${emp.isMoving ? 'text-cyan-700' : (emp.status === 'late' ? 'text-red-600' : 'text-emerald-600')}`}>
                        {emp.isMoving ? (emp.speed || 'Moving') : emp.time}
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
              <span className="text-slate-600 font-medium">In Transit (Live):</span>
              <span className="font-bold text-cyan-600">{allEngineers.filter(e => e.isMoving).length} Moving</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-600 font-medium">Anomalies:</span>
              <span className="font-bold text-red-500">{allEngineers.filter(e => e.status === 'late').length} Detected</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Required for Leaflet Custom Popups in Tailwind & Smooth Marker Gliding */}
      <style>{`
        .leaflet-marker-icon {
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
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
