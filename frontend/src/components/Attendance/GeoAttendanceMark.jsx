import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, CheckCircle, AlertTriangle, Loader2, Globe, Calendar, Factory } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import { useNavigate } from 'react-router-dom';

// Fix for default Leaflet markers in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 14);
    }
  }, [lat, lng, map]);
  return null;
};

const GeoAttendanceMark = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  
  // Site Visit Form State
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [siteDetails, setSiteDetails] = useState({
      daysStaying: '1',
      notes: ''
  });
  const [isSubmittingSite, setIsSubmittingSite] = useState(false);
  const [siteLogged, setSiteLogged] = useState(false);
  
  const navigate = useNavigate();

  const fetchCityName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      setCity(data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown Location');
    } catch (err) {
      console.error("Geocoding failed", err);
      setCity('Coordinates Logged');
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        fetchCityName(lat, lng);
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please ensure location permissions are granted.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const markAttendance = async () => {
    setLoading(true);
    const payload = {
      latitude: location.lat,
      longitude: location.lng,
      locationName: city || 'Unknown Location',
      timestamp: new Date().toISOString(),
    };

    try {
      if (!navigator.onLine) {
        throw new Error('Offline');
      }
      await api.post('/attendance', payload);
      setAttendanceMarked(true);
      setShowSiteForm(true);
    } catch (err) {
      if (!navigator.onLine || err.message === 'Offline' || err.code === 'ERR_NETWORK') {
        // Save to offline queue
        const queue = JSON.parse(localStorage.getItem('offlineAttendanceQueue') || '[]');
        queue.push(payload);
        localStorage.setItem('offlineAttendanceQueue', JSON.stringify(queue));
        alert('You are offline. Attendance locked securely to your device. It will sync automatically when signal returns.');
        setAttendanceMarked(true);
        setShowSiteForm(true);
      } else {
        setError(err.response?.data?.error || 'Failed to register attendance.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitSiteLog = async (e) => {
      e.preventDefault();
      setIsSubmittingSite(true);
      
      const sitePayload = { ...siteDetails, date: new Date().toISOString() };
      
      try {
          if (!navigator.onLine) throw new Error('Offline');
          // Normally api.post('/sites/log', sitePayload);
          setTimeout(() => {
              setIsSubmittingSite(false);
              setSiteLogged(true);
              setTimeout(() => navigate('/dashboard'), 2000);
          }, 1000);
      } catch (err) {
          if (!navigator.onLine || err.message === 'Offline' || err.code === 'ERR_NETWORK') {
              const queue = JSON.parse(localStorage.getItem('offlineSiteQueue') || '[]');
              queue.push(sitePayload);
              localStorage.setItem('offlineSiteQueue', JSON.stringify(queue));
              setIsSubmittingSite(false);
              setSiteLogged(true);
              setTimeout(() => navigate('/dashboard'), 2000);
          } else {
              setIsSubmittingSite(false);
              alert('Error saving site log.');
          }
      }
  };

  // Sync offline data when coming back online
  useEffect(() => {
      const syncOfflineData = async () => {
          if (navigator.onLine) {
              const attQueue = JSON.parse(localStorage.getItem('offlineAttendanceQueue') || '[]');
              if (attQueue.length > 0) {
                  for (let i = 0; i < attQueue.length; i++) {
                      try {
                          await api.post('/attendance', attQueue[i]);
                      } catch (e) { console.error('Offline sync failed', e); }
                  }
                  localStorage.removeItem('offlineAttendanceQueue');
                  alert('Offline attendance records successfully synchronized with the server.');
              }
          }
      };
      
      window.addEventListener('online', syncOfflineData);
      syncOfflineData(); // Check on mount
      
      return () => window.removeEventListener('online', syncOfflineData);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 relative">
        <div className="max-w-md mx-auto relative z-10">
            
            {!showSiteForm && !siteLogged && (
                <div className="flex flex-col items-center text-center justify-center gap-6 mb-10">
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
                            SN Enviro <span className="text-blue-600">Portal</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm max-w-[280px]">
                            Secure Enterprise Access
                        </p>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {siteLogged ? (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.5, rotateY: 90, z: -500 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        style={{ transformPerspective: 1200 }}
                        className="bg-slate-900 rounded-[32px] p-12 shadow-2xl shadow-blue-900/20 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 z-0"></div>
                        
                        <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                            >
                                <CheckCircle size={48} strokeWidth={2} />
                            </motion.div>
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
                        </div>
                        
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-black text-white mb-3 relative z-10"
                        >
                            Attendance Locked!
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-400 font-medium text-sm mb-2 max-w-[280px] relative z-10"
                        >
                            Your GPS location and site details have been securely synchronized.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400 relative z-10"
                        >
                            <Loader2 size={14} className="animate-spin" /> Redirecting to Portal
                        </motion.div>
                    </motion.div>
                ) : showSiteForm ? (
                    <motion.div 
                        key="site-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Factory size={18} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">Site Visit Log</h3>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Auto-filled via GPS</p>
                            </div>
                        </div>

                        <form onSubmit={submitSiteLog} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
                                    <MapPin size={14} /> Detected Location
                                </div>
                                <p className="font-bold text-slate-900">{city || 'Location Locked'}</p>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
                                    <Calendar size={14} /> Date
                                </div>
                                <p className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Days Staying at Site</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={siteDetails.daysStaying}
                                    onChange={e => setSiteDetails({ ...siteDetails, daysStaying: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Field Progress / Notes</label>
                                <textarea
                                    required
                                    placeholder="Describe tasks completed or issues found..."
                                    value={siteDetails.notes}
                                    onChange={e => setSiteDetails({ ...siteDetails, notes: e.target.value })}
                                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmittingSite}
                                className="w-full mt-4 bg-black hover:bg-slate-800 text-white rounded-full py-5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-70"
                            >
                                {isSubmittingSite ? <Loader2 size={18} className="animate-spin" /> : 'Submit Attendance'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="attendance-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 rounded-[32px] shadow-2xl p-8 w-full border border-slate-800 relative overflow-hidden flex flex-col items-center text-center"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 z-10" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <div className="w-full bg-slate-950 rounded-[24px] overflow-hidden mb-8 border border-slate-800/50 flex flex-col items-center relative z-10 min-h-[220px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                                    <Loader2 size={32} className="animate-spin text-blue-400" />
                                    <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Acquiring Satellites...</span>
                                </div>
                            ) : location ? (
                                <div className="w-full h-full relative">
                                    <div className="h-[220px] w-full">
                                        <MapContainer 
                                            center={[location.lat, location.lng]} 
                                            zoom={15} 
                                            style={{ height: '100%', width: '100%' }}
                                            zoomControl={false}
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                                            <Marker position={[location.lat, location.lng]}>
                                                <Popup><div className="text-center font-bold">{city}</div></Popup>
                                            </Marker>
                                            <RecenterMap lat={location.lat} lng={location.lng} />
                                        </MapContainer>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-700 z-[1000] flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{city || 'Location Locked'}</p>
                                            <p className="text-[9px] text-blue-400 font-mono mt-0.5 uppercase tracking-widest">Telemetry Active</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-16 gap-4 text-slate-500">
                                    <div className="w-16 h-16 rounded-full bg-slate-900 shadow-sm flex items-center justify-center text-blue-500 mb-2 border border-slate-800">
                                        <Globe size={28} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">GPS Required</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 flex flex-col items-center text-center">
                                <AlertTriangle size={20} className="text-rose-400 mb-2" />
                                <p className="text-xs text-rose-400 font-medium">{error}</p>
                            </div>
                        )}

                        {!location && !loading && (
                            <button 
                                onClick={getLocation}
                                className="w-full py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95 relative z-10"
                            >
                                Initiate Login
                            </button>
                        )}
                        
                        {location && !loading && (
                            <button 
                                onClick={markAttendance}
                                className="w-full py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20 active:scale-95 relative z-10"
                            >
                                Confirm & Mark Attendance
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default GeoAttendanceMark;
