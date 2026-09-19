import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Clock, Calendar, BarChart3,
    CheckCircle2, AlertCircle, RefreshCw,
    TrendingUp, Users, ShieldCheck, ArrowLeft, Shield, Zap, Info,
    LogOut, LogIn, Sun, Moon, Wallet, Briefcase, Eye, Loader2, Globe, Activity, Timer, User, Edit, Save, Link2, Layers, ChevronDown
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useGeolocation } from './useGeolocation';
import confetti from 'canvas-confetti';
import api from './api';
import LeaveHub from './LeaveHub';
import SalaryHub from './SalaryHub';
import ProfileCard from './ProfileCard';

export const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const MovingClockIcon = ({ time }) => {
    const s = time.getSeconds();
    const m = time.getMinutes();
    const h = time.getHours();

    return (
        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-lg animate-pulse" />
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-brand-primary relative z-10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" stroke="currentColor" className="opacity-10" />
                <motion.line
                    x1="12" y1="12" x2="12" y2="8"
                    animate={{ rotate: (h % 12) * 30 + m * 0.5 }}
                    style={{ transformOrigin: '12px 12px' }}
                />
                <motion.line
                    x1="12" y1="12" x2="12" y2="6"
                    animate={{ rotate: m * 6 }}
                    style={{ transformOrigin: '12px 12px' }}
                />
                <motion.line
                    x1="12" y1="12" x2="12" y2="5" stroke="currentColor" strokeWidth="1"
                    animate={{ rotate: s * 6 }}
                    style={{ transformOrigin: '12px 12px' }}
                    className="text-blue-600"
                />
                <circle cx="12" cy="12" r="0.5" fill="currentColor" />
            </svg>
        </div>
    );
};

const StatusBadge = ({ active }) => (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-md-outline/10 text-xs font-semibold">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-md-error'}`} />
        <span className={`tracking-wider uppercase text-[10px] ${active ? 'text-green-600 font-black' : 'text-md-on-surface-variant'}`}>{active ? 'Active Now' : 'Standby'}</span>
    </div>
);

const CustomSelect = ({ label, value, options, onChange, disabled }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div
            className="relative space-y-1"
            onMouseEnter={() => !disabled && setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">{label}</label>
            <div className={`flex items-center justify-between w-full bg-white p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium transition-all ${!disabled && 'hover:border-brand-primary/50 cursor-pointer'}`}>
                <span className={value ? 'text-md-on-surface' : 'text-md-on-surface-variant opacity-50'}>
                    {value || `Select ${label}`}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-2 bg-slate-100 border border-md-outline/10 rounded-2xl shadow-2xl overflow-hidden py-2"
                    >
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Dashboard = () => {
    const { user, logout, updateUser, updateProfile } = useAuth();
    const navigate = useNavigate();
    const { coords, city, fullAddress, error: geoError, refresh: refreshGeo, loading: geoLoading } = useGeolocation();
    const [attendance, setAttendance] = useState([]);
    const isCheckedIn = attendance[0] && !attendance[0].checkOut;
    const [loading, setLoading] = useState(false);
    const [checkStatus, setCheckStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState(user?.role === 'Admin' ? 'profile' : 'attendance');
    const [sessionTimer, setSessionTimer] = useState('00:00:00');
    const [currentSessionMetrics, setCurrentSessionMetrics] = useState({ hours: 0, overtime: 0 });

    const isAfterTenThirty = false; // TEMPORARILY DISABLED FOR TESTING

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        alternativeContact: user?.alternativeContact || '',
        bloodGroup: user?.bloodGroup || '',
        role: user?.role || '',
        joiningDate: user?.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : '',
        employmentType: user?.employmentType || '',
        gradeLevel: user?.gradeLevel || '',
        socialLinks: user?.socialLinks || '',
        homeAddress: user?.homeAddress || '',
        coreCompetencies: user?.coreCompetencies || '',
        currentProjects: user?.currentProjects || ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        const telemetryTimer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Real-time Session Monitoring
            const latest = attendance[0];
            if (latest && !latest.checkOut) {
                const start = new Date(latest.timestamp);
                const diffMs = now - start;
                setSessionTimer(formatDuration(diffMs));

                // Pivot is 18:00 (6 PM) on the day the shift started
                const pivot = new Date(start);
                pivot.setHours(18, 0, 0, 0);

                let otHrs = 0;
                const totalHrs = diffMs / (1000 * 60 * 60);

                if (now > pivot) {
                    // Overtime calculation: Difference between NOW and (the pivot OR start time, whichever is later)
                    const otMs = now - Math.max(start.getTime(), pivot.getTime());
                    otHrs = otMs / (1000 * 60 * 60);
                }

                setCurrentSessionMetrics({
                    hours: totalHrs.toFixed(2),
                    overtime: otHrs.toFixed(2),
                    totalTimer: formatDuration(diffMs),
                    otTimer: otHrs > 0 ? formatDuration(now - Math.max(start.getTime(), pivot.getTime())) : '00:00:00'
                });
            } else {
                setSessionTimer('00:00:00');
                setCurrentSessionMetrics({ hours: '0.00', overtime: '0.00', totalTimer: '00:00:00', otTimer: '00:00:00' });
            }
        }, 1000);

        // Visibility API for mobile/window data collection & session robustness
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchAttendance();
            }
        };

        const handleSync = () => fetchAttendance();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handleSync);
        window.addEventListener('focus', handleSync);

        return () => {
            clearInterval(telemetryTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handleSync);
            window.removeEventListener('focus', handleSync);
        };
    }, [attendance]);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        // Don't set loading on BG syncs to avoid flickering
        if (attendance.length === 0) setLoading(true);
        try {
            const res = await api.get('/attendance/my');
            let data = res.data.data || [];
            
            if (JSON.stringify(data) !== JSON.stringify(attendance)) {
                setAttendance(data);
            }
        } catch (err) {
            console.error('Failed to fetch attendance', err);
            // Handle network link loss explicitly
            if (!err.response && err.request) {
                setStatusMessage('Nexus Link Terminal Error: Connecting to API Node failed. Operating in Offline Mode.');
                setCheckStatus('error');
            }
            if (err.response?.status === 401) {
                setStatusMessage('Security Session Expired. Re-authenticating...');
            }
        } finally {
            setLoading(false);
        }
    };

    const [showSiteDetailsModal, setShowSiteDetailsModal] = useState(false);
    const [siteDetails, setSiteDetails] = useState({ duration: '8 Hours', issues: '' });
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState({ title: '', subtitle: '' });

    const handleCheckAction = async (type) => {
        if (type === 'in' && isAfterTenThirty) {
            setStatusMessage("you're not able to login because after 10:30 AM it won't be accessible to anyone please contact manager or an HR");
            setCheckStatus('error');
            return;
        }

        if (!coords) {
            setStatusMessage('Location required.');
            setCheckStatus('error');
            return;
        }

        if (type === 'in') {
            setCheckStatus('pending');
            try {
                const res = await api.post('/attendance', {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    locationName: fullAddress,
                    timestamp: new Date().toISOString(),
                    siteDetails: { duration: '8 Hours', issues: '' }
                });

                const newSession = res.data.data;
                setAttendance(prev => [newSession, ...prev]);
                
                setCheckStatus('success');
                setStatusMessage('');
                setPopupMessage({ title: 'Success!', subtitle: 'Your attendance has been marked.' });
                setShowSuccessPopup(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: ['#2563EB', '#10b981', '#ffffff'],
                    zIndex: 10000
                });
                setTimeout(() => setShowSuccessPopup(false), 4000);
            } catch (err) {
                setCheckStatus('error');
                console.error('Attendance failed:', err);
                setStatusMessage(err.response?.data?.error || err.message || 'Operational Sequence Interrupted.');
            }
            return;
        }

        setCheckStatus('pending');
        try {
            const latest = attendance[0];
            if (!latest || latest.checkOut) {
                throw new Error('No active session detected');
            }
            
            const res = await api.put(`/attendance/checkout/${latest._id}`);

            setAttendance(prev => {
                const newAtt = [...prev];
                newAtt[0] = res.data.data;
                return newAtt;
            });

            setCheckStatus('success');
            setStatusMessage('');
            
            setPopupMessage({ title: 'Shift Ended', subtitle: 'Your check-out has been recorded.' });
            setShowSuccessPopup(true);
            setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);
        } catch (err) {
            setCheckStatus('error');
            const isNetworkError = !err.response && err.request;
            if (isNetworkError) {
                setStatusMessage('Nexus Link Failure: Backend offline or unreachable.');
            } else {
                setStatusMessage(err.response?.data?.error || err.message || 'Operational Sequence Interrupted.');
            }
            console.error('Attendance action failed:', err);
        }
    };

    const submitSiteDetails = async () => {
        setShowSiteDetailsModal(false);
        setCheckStatus('pending');
        try {
            await api.post('/attendance', {
                latitude: coords.latitude,
                longitude: coords.longitude,
                locationName: fullAddress,
                timestamp: new Date().toISOString(),
                siteDetails: siteDetails // Pass it down, even if backend ignores it right now
            });

            // Optimistically update the dummy data so it reflects instantly
            const newSession = {
                _id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                locationName: fullAddress || 'Unknown Location',
                location: { coordinates: [coords.longitude, coords.latitude] },
                siteDetails: siteDetails,
                totalHours: 0,
                overtime: 0,
                checkOut: null
            };
            
            setAttendance([newSession, ...attendance]);
            localStorage.setItem('attendance_cache', JSON.stringify([newSession, ...attendance]));
            
            setCheckStatus('success');
            setStatusMessage('Clock-in successful. Site Details logged.');
        } catch (err) {
            setCheckStatus('error');
            const isNetworkError = !err.response && err.request;
            if (isNetworkError) {
                setStatusMessage('Nexus Link Failure: Backend offline or unreachable.');
            } else {
                setStatusMessage(err.response?.data?.error || err.message || 'Operational Sequence Interrupted.');
            }
            console.error('Attendance action failed:', err);
        }
    };

    const dailyRecords = React.useMemo(() => {
        const grouped = {};

        attendance.forEach(record => {
            const date = new Date(record.timestamp).toDateString();
            if (!grouped[date]) {
                grouped[date] = {
                    ...record,
                    totalHours: record.totalHours || 0,
                    overtime: record.overtime || 0,
                    // Use earliest login and latest logout for the day
                    earliestLogin: record.timestamp,
                    latestLogout: record.checkOut
                };
            } else {
                // Sum Metrics
                grouped[date].totalHours += (record.totalHours || 0);
                grouped[date].overtime += (record.overtime || 0);

                // Compare Login (Earliest)
                if (new Date(record.timestamp) < new Date(grouped[date].earliestLogin)) {
                    grouped[date].earliestLogin = record.timestamp;
                    grouped[date].timestamp = record.timestamp; // Update for display
                }

                // Compare Logout (Latest or still Active)
                if (!record.checkOut || !grouped[date].latestLogout) {
                    // If any session today is "PRESENT", the whole day shows as "PRESENT" or we take the latest checkout
                    if (!record.checkOut) {
                        grouped[date].latestLogout = null;
                        grouped[date].checkOut = null;
                    } else if (grouped[date].latestLogout && new Date(record.checkOut) > new Date(grouped[date].latestLogout)) {
                        grouped[date].latestLogout = record.checkOut;
                        grouped[date].checkOut = record.checkOut;
                    }
                } else if (new Date(record.checkOut) > new Date(grouped[date].latestLogout)) {
                    grouped[date].latestLogout = record.checkOut;
                    grouped[date].checkOut = record.checkOut;
                }
            }
        });

        return Object.values(grouped).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [attendance]);

    const stats = React.useMemo(() => {
        const total = attendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
        const ot = attendance.reduce((acc, curr) => acc + (curr.overtime || 0), 0);
        const uniqueDays = new Set(attendance.map(a => new Date(a.timestamp).toDateString())).size;
        const avgHours = uniqueDays > 0 ? (total / uniqueDays).toFixed(1) : '0.0';

        return {
            total: total.toFixed(1),
            ot: ot.toFixed(1),
            days: uniqueDays,
            avg: avgHours
        };
    }, [attendance]);

    const handleProfileUpdate = async () => {
        setIsSavingProfile(true);
        try {
            const res = await updateProfile(profileData);
            if (res.success) {
                setIsEditingProfile(false);
                setStatusMessage('Data Saved to Data Base Successfully!');
                setCheckStatus('success');
                setTimeout(() => setStatusMessage(''), 3000);
            } else {
                setStatusMessage(res.message);
                setCheckStatus('error');
            }
        } catch (err) {
            console.error('Update failed', err);
            setStatusMessage('Critical Network/Database Connection Error');
            setCheckStatus('error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div className="min-h-screen bg-md-surface pt-32 pb-20 px-8 relative">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* M3 Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center justify-center gap-6 mb-10 mt-4 md:mt-8"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-6">
                            <StatusBadge active={isCheckedIn} />
                            <span className="text-brand-primary/60 font-bold text-[10px] uppercase tracking-widest">Authenticated node</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-3">
                            SN Enviro <span className="text-brand-primary">Portal</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm flex items-center justify-center gap-2 max-w-sm">
                            <ShieldCheck size={16} className="text-brand-primary" /> Secure Enterprise Access
                        </p>
                    </div>
                </motion.div>



                {/* M3 Tab Navigation */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'attendance', label: 'Attendance Feed', icon: Activity },
                        { id: 'control', label: 'Control Panel', icon: ShieldCheck },
                        { id: 'leaves', label: 'Leaves Hub', icon: Calendar },
                        { id: 'profile', label: 'Profile Identity', icon: User },
                        { id: 'finance', label: 'Payroll Hub', icon: Wallet },
                    ].filter(tab => {
                        if (user?.role === 'Admin') {
                            return !['attendance', 'control', 'leaves'].includes(tab.id);
                        }
                        return true;
                    }).map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all whitespace-nowrap ${activeTab === tab.id ? 'm3-btn-filled shadow-md' : 'm3-btn-tonal text-md-on-surface-variant'}`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'attendance' && (
                        <motion.div
                            key="attendance"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center justify-center max-w-md mx-auto w-full pt-4 md:pt-10 pb-20"
                        >
                            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 w-full border border-slate-100 relative overflow-hidden flex flex-col items-center text-center group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                                
                                <h3 className="text-3xl font-medium text-slate-800 mb-2 tracking-tight relative z-10 font-serif">
                                    {isCheckedIn ? 'Shift Active' : 'Ready to Work?'}
                                </h3>
                                <p className="text-slate-500 font-light text-sm mb-8 relative z-10">
                                    {isCheckedIn ? 'You are currently logged in.' : 'Verify your location and login.'}
                                </p>

                                <div className="w-full bg-slate-50 rounded-[24px] p-6 mb-8 border border-slate-100 flex flex-col items-center relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-4">
                                        <MapPin size={28} strokeWidth={1.5} />
                                    </div>
                                    
                                    {geoLoading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={24} className="animate-spin text-slate-400" />
                                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Login</span>
                                        </div>
                                    ) : coords ? (
                                        <>
                                            <h4 className="text-lg font-bold text-slate-800 mb-1">{city || 'Location Active'}</h4>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mt-2 mb-3">
                                                <span>Lat: {coords.latitude.toFixed(4)}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span>Lng: {coords.longitude.toFixed(4)}</span>
                                            </div>
                                            
                                            {/* Daily Login Time Indicator */}
                                            {dailyRecords[0] && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full mt-2">
                                                    <Clock size={14} /> 
                                                    Login Time: {new Date(dailyRecords[0].earliestLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-rose-400">
                                            <Globe size={24} />
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Location Required</span>
                                        </div>
                                    )}
                                </div>

                                {!isCheckedIn && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => !coords ? refreshGeo() : handleCheckAction('in')}
                                        disabled={checkStatus === 'pending' || geoLoading || isAfterTenThirty}
                                        className={`w-full py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-extrabold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 relative z-10 overflow-hidden group ${
                                            !coords
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)] border border-blue-400/50 hover:shadow-[0_8px_40px_rgba(79,70,229,0.4)]'
                                                : isAfterTenThirty 
                                                    ? 'bg-slate-50/80 backdrop-blur-md text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-inner'
                                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] border border-emerald-400/50 hover:shadow-[0_8px_40px_rgba(16,185,129,0.4)] hover:-translate-y-1'
                                        }`}
                                    >
                                        {/* Shimmer sweep effect */}
                                        {(!isAfterTenThirty && !checkStatus && !geoLoading) && (
                                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                        )}

                                        <div className="relative z-10 flex items-center justify-center gap-3 w-full">
                                            {checkStatus === 'pending' || geoLoading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : !coords ? (
                                                <>
                                                    <Globe size={18} strokeWidth={2.5} /> Initiate Login
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn size={18} strokeWidth={2.5} /> Mark Checkin
                                                </>
                                            )}
                                        </div>
                                    </motion.button>
                                )}
                                
                                <AnimatePresence>
                                    {statusMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -10, height: 0 }}
                                            className={`mt-4 w-full text-center relative z-10 ${checkStatus === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}
                                        >
                                            <span className="text-xs font-medium">{statusMessage}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'control' && (
                        <motion.div
                            key="control"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid md:grid-cols-1 gap-6">
                                <div className="m3-card-elevated p-6 md:p-8 bg-slate-50 border-md-outline/5 transition-all flex flex-col items-center text-center">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-6">Total Session Duration</h4>
                                    <div className="flex items-baseline gap-3 overflow-hidden">
                                        <span className="text-4xl sm:text-5xl font-mono font-bold text-md-on-surface tracking-tighter truncate">{currentSessionMetrics.totalTimer}</span>
                                    </div>
                                    <div className="flex gap-4 mt-2 mb-6">
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">Hours</span>
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">Min</span>
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">Sec</span>
                                    </div>
                                    <p className="text-xs font-medium text-md-on-surface-variant italic">Live tracking of your current work session.</p>
                                    
                                    {dailyRecords[0] && (
                                        <div className="mt-8 pt-6 border-t border-slate-200 w-full max-w-sm">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-slate-500 flex items-center gap-2"><Clock size={16}/> Daily Login Time:</span>
                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">{new Date(dailyRecords[0].earliestLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <ProfileCard attendanceData={attendance} />
                        </motion.div>
                    )}

                    {activeTab === 'leaves' && (
                        <motion.div
                            key="leaves"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl mx-auto"
                        >
                            <LeaveHub />
                        </motion.div>
                    )}



                    {activeTab === 'finance' && (
                        <motion.div
                            key="finance"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <SalaryHub />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showSuccessPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full sm:w-[400px] bg-white/95 backdrop-blur-3xl rounded-[32px] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col items-center border border-white/60 text-center relative z-[9999]"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center text-emerald-500 mb-5 shadow-[inset_0_4px_20px_rgba(16,185,129,0.1)] relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                <CheckCircle2 size={36} strokeWidth={2.5} className="relative z-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{popupMessage.title || 'Success!'}</h3>
                            <p className="text-sm text-slate-500 font-medium px-4">{popupMessage.subtitle || 'Your attendance has been marked.'}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSiteDetailsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0"
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full sm:max-w-md rounded-[32px] sm:rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6"
                        >
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Site Details</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Please provide details for this check-in.</p>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Expected Duration</label>
                                    <select
                                        value={siteDetails.duration}
                                        onChange={(e) => setSiteDetails({ ...siteDetails, duration: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-4 ring-brand-primary/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="1 Hour">1 Hour</option>
                                        <option value="2 Hours">2 Hours</option>
                                        <option value="4 Hours">4 Hours</option>
                                        <option value="8 Hours">Full Day (8 Hours)</option>
                                        <option value="Multiple Days">Multiple Days</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Site Issues / Status (Optional)</label>
                                    <textarea
                                        value={siteDetails.issues}
                                        onChange={(e) => setSiteDetails({ ...siteDetails, issues: e.target.value })}
                                        rows={3}
                                        placeholder="Everything normal..."
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 focus:ring-4 ring-brand-primary/20 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => setShowSiteDetailsModal(false)}
                                    className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitSiteDetails}
                                    className="flex-[2] py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} /> Confirm Check-In
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient Multichrome MD3 Accents */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-brand-primary-container/10 rounded-full blur-[160px] -z-10 pointer-events-none animate-pulse" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-brand-tertiary-container/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-secondary-container/5 rounded-full blur-[200px] -z-10 pointer-events-none" />
        </div >
    );
};

export default Dashboard;
