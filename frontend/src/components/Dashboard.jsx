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
import api from './api';
import LeaveHub from './LeaveHub';
import SalaryHub from './SalaryHub';

const formatDuration = (ms) => {
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
                    className="text-md-secondary"
                />
                <circle cx="12" cy="12" r="0.5" fill="currentColor" />
            </svg>
        </div>
    );
};

const StatusBadge = ({ active }) => (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-md-surface-container-high border border-md-outline/10 text-xs font-semibold">
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
            <div className={`flex items-center justify-between w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium transition-all ${!disabled && 'hover:border-brand-primary/50 cursor-pointer'}`}>
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
                        className="absolute z-50 left-0 right-0 mt-2 bg-md-surface-container-high border border-md-outline/10 rounded-2xl shadow-2xl overflow-hidden py-2"
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
    const [attendance, setAttendance] = useState(() => {
        // Hydrate from localStorage for instant-on persistence
        const cached = localStorage.getItem('attendance_cache');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(false);
    const [checkStatus, setCheckStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState(user?.role === 'Admin' ? 'profile' : 'attendance');
    const [sessionTimer, setSessionTimer] = useState('00:00:00');
    const [currentSessionMetrics, setCurrentSessionMetrics] = useState({ hours: 0, overtime: 0 });

    const isAfterTenThirty = currentTime.getHours() > 10 || (currentTime.getHours() === 10 && currentTime.getMinutes() >= 30);

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
            const data = res.data.data || [];
            if (JSON.stringify(data) !== JSON.stringify(attendance)) {
                setAttendance(data);
                localStorage.setItem('attendance_cache', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to fetch attendance', err);
            // Handle network link loss explicitly
            if (!err.response && err.request) {
                setStatusMessage('Nexus Link Terminal Error: Connecting to API Node failed.');
                setCheckStatus('error');
            }
            if (err.response?.status === 401) {
                setStatusMessage('Security Session Expired. Re-authenticating...');
            }
        } finally {
            setLoading(false);
        }
    };

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

        setCheckStatus('pending');
        try {
            if (type === 'in') {
                await api.post('/attendance', {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    locationName: fullAddress,
                    timestamp: new Date().toISOString(),
                });
            } else {
                const latest = attendance[0];
                if (!latest || latest.checkOut) {
                    throw new Error('No active session detected');
                }
                await api.put(`/attendance/checkout/${latest._id}`);
            }

            setCheckStatus('success');
            setStatusMessage(type === 'in' ? 'Clock-in successful. Session Tracking active.' : 'Session Finalized. Redirecting to Home...');

            if (type === 'out') {
                // Auto-Logout and Redirect Protocol
                setTimeout(() => {
                    logout();
                    navigate('/');
                }, 2000);
            } else {
                fetchAttendance();
            }
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

    const isCheckedIn = attendance[0] && !attendance[0].checkOut;

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
                    className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16"
                >
                    <div className="flex items-center gap-10">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="w-14 h-14 m3-card-elevated flex items-center justify-center text-md-on-surface-variant hover:text-brand-primary transition-colors bg-md-surface-container-low border-0"
                        >
                            <ArrowLeft size={24} />
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-2.5">
                                <StatusBadge active={isCheckedIn} />
                                <span className="text-brand-primary/60 font-bold text-[10px] uppercase tracking-widest">Authenticated node</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-md-on-surface tracking-tight mb-1">
                                Operational <span className="text-brand-primary">Nexus</span>
                            </h1>
                            <p className="text-md-on-surface-variant font-medium text-sm flex items-center gap-2">
                                <ShieldCheck size={16} className="text-brand-primary" /> Employee: {user?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="m3-card-filled px-8 py-4 flex items-center gap-8 bg-md-surface-container-low border border-md-outline/10 h-20">
                            <MovingClockIcon time={currentTime} />
                            <div className="border-l border-md-outline/10 pl-8 h-full flex flex-col justify-center">
                                <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-1">System Time</p>
                                <p className="text-3xl font-bold text-md-on-surface font-mono leading-none tracking-tighter">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </p>
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* M3 Tab Navigation */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'attendance', label: 'Attendance Feed', icon: Activity },
                        { id: 'control', label: 'Control Panel', icon: ShieldCheck },
                        { id: 'profile', label: 'Profile Identity', icon: User },
                        { id: 'finance', label: 'Payroll Hub', icon: Wallet },
                    ].filter(tab => {
                        if (user?.role === 'Admin') {
                            return !['attendance', 'control'].includes(tab.id);
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
                            className="grid lg:grid-cols-12 gap-8"
                        >
                            {/* Check-in Section */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="m3-card-filled p-10 bg-md-surface-container-low border border-md-outline/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full -mr-24 -mt-24 blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <span className="text-[10px] text-brand-primary font-bold tracking-widest uppercase mb-1 block">Security Access</span>
                                                <h3 className="text-2xl font-bold text-md-on-surface tracking-tight">System Presence</h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                <Timer size={24} className={isCheckedIn ? 'animate-pulse' : ''} />
                                            </div>
                                        </div>

                                        <div className="bg-md-surface-container p-6 rounded-[24px] mb-10 border border-md-outline/5 relative group/geo">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-md-surface-container-high flex items-center justify-center text-brand-primary shadow-sm">
                                                    <MapPin size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-1">Current Coordinates</p>
                                                    <p className="text-md-on-surface font-bold text-sm leading-snug truncate">{geoLoading ? 'Acquiring Lock...' : (fullAddress || 'Satellite Sync Standby')}</p>
                                                </div>
                                            </div>

                                            {/* M3 Map Integration */}
                                            <div className="w-full h-36 rounded-2xl overflow-hidden m3-card-outlined border-md-outline/10 mb-4 relative">
                                                {coords ? (
                                                    <iframe
                                                        title="Location Satellite"
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`}
                                                        className="grayscale brightness-110 opacity-80"
                                                        style={{ filter: 'grayscale(0.5) contrast(1.1) brightness(1.05)' }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-md-surface-variant/20 flex flex-col items-center justify-center opacity-30">
                                                        <Globe size={32} className="animate-spin-slow mb-2" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Signal Search</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5" />
                                            </div>

                                            {geoLoading && (
                                                <div className="h-1 w-full bg-md-outline/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                        className="h-full w-1/3 bg-brand-primary"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleCheckAction('in')}
                                                disabled={checkStatus === 'pending' || geoLoading || isCheckedIn}
                                                className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl font-bold uppercase tracking-widest transition-all ${(isCheckedIn || isAfterTenThirty) ? 'bg-md-surface-container-high text-md-on-surface-variant/40' : 'bg-brand-primary text-brand-on-primary shadow-lg shadow-brand-primary/20'}`}
                                            >
                                                <LogIn size={22} />
                                                <span className="text-[10px]">Login</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleCheckAction('out')}
                                                disabled={checkStatus === 'pending' || geoLoading || !isCheckedIn}
                                                className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl font-bold uppercase tracking-widest transition-all ${!isCheckedIn ? 'bg-md-surface-container-high text-md-on-surface-variant/40' : 'bg-md-error text-md-on-error shadow-lg shadow-md-error/20'}`}
                                            >
                                                <LogOut size={22} />
                                                <span className="text-[10px]">Logout</span>
                                            </motion.button>
                                        </div>

                                        <div className="mt-8 p-6 bg-md-error/10 rounded-[28px] border-2 border-md-error/30 shadow-2xl shadow-md-error/5 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-14 h-14 bg-md-error/20 rounded-full flex items-center justify-center text-md-error mb-1">
                                                    <AlertCircle size={32} strokeWidth={3} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[12px] text-md-error font-black uppercase tracking-[0.3em]">CRITICAL OPERATION WARNING</p>
                                                    <p className="text-[11px] text-md-on-surface font-extrabold leading-relaxed tracking-wider px-2">
                                                        MUST READ: Finalize your work shift ONLY ONCE. Your first login and final logout are the only data points saved per day. Multiple cycles are strictly prohibited for data integrity.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {statusMessage && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`mt-8 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2.5 border ${checkStatus === 'error' ? 'bg-md-error-container text-md-on-error-container border-md-error/20' : 'bg-brand-primary-container/20 text-brand-primary border-brand-primary/20'}`}
                                                >
                                                    {checkStatus === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                                    {statusMessage}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="m3-card-elevated p-6 bg-md-surface-container-lowest border border-md-outline/5 hover:bg-md-primary-container/10 transition-colors group">
                                        <p className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-3 group-hover:text-brand-primary transition-colors">Digital Chronograph</p>
                                        <div className="flex items-baseline gap-2 overflow-hidden">
                                            <h4 className={`text-2xl sm:text-3xl font-bold truncate ${isCheckedIn ? 'text-brand-primary font-mono' : 'text-md-on-surface'}`}>
                                                {isCheckedIn ? currentSessionMetrics.totalTimer : stats.total}
                                            </h4>
                                            <span className="text-[10px] text-md-on-surface-variant font-bold uppercase shrink-0">{isCheckedIn ? '' : 'HRS'}</span>
                                        </div>
                                    </div>
                                    <div className="m3-card-elevated p-6 bg-md-surface-container-lowest border border-md-outline/5 hover:bg-md-tertiary-container/10 transition-colors group">
                                        <p className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-3 group-hover:text-brand-tertiary transition-colors">Overtime Load</p>
                                        <div className="flex items-baseline gap-2 overflow-hidden">
                                            <h4 className={`text-2xl sm:text-3xl font-bold truncate ${isCheckedIn && currentSessionMetrics.overtime > 0 ? 'text-brand-tertiary font-mono' : 'text-md-on-surface/40'}`}>
                                                {isCheckedIn ? currentSessionMetrics.otTimer : stats.ot}
                                            </h4>
                                            <span className="text-[10px] text-md-on-surface-variant font-bold uppercase shrink-0">{isCheckedIn ? '' : 'OT'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feed Section */}
                            <div className="lg:col-span-8">
                                <div className="m3-card-filled bg-md-surface-container-low border border-md-outline/10 flex flex-col h-full overflow-hidden">
                                    <div className="p-8 md:p-10 border-b border-md-outline/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-md-on-surface tracking-tight">Recent Sessions</h3>
                                            <p className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mt-1">Live Data</p>
                                        </div>
                                        <button onClick={fetchAttendance} className="w-12 h-12 m3-card-elevated flex items-center justify-center bg-md-surface-container hover:bg-md-surface-container-high transition-colors">
                                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                        </button>
                                    </div>

                                    {/* Feed Metrics Dashboard Row */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-10 py-8 bg-md-surface-container/50 border-b border-md-outline/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-1.5 opacity-50">Operating Days</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-bold text-md-on-surface">{stats.days}</span>
                                                <span className="text-[9px] text-md-on-surface-variant font-bold uppercase">Days</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-1.5 opacity-50">Avg Session</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-bold text-md-on-surface">{stats.avg}</span>
                                                <span className="text-[9px] text-md-on-surface-variant font-bold uppercase">Hrs</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-1.5 opacity-50">Active OT</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-bold text-md-secondary">{stats.ot}</span>
                                                <span className="text-[9px] text-md-on-surface-variant font-bold uppercase">Load</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-1.5 opacity-50">Stream Status</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest"> Sync</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                        <div className="hidden md:block">
                                            <table className="w-full border-separate border-spacing-y-4">
                                                <thead>
                                                    <tr>
                                                        <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Log Timeline</th>
                                                        <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant text-center">Operational Window</th>
                                                        <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Geo Location</th>
                                                        <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant text-right">Metrics</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr><td colSpan="4" className="py-24 text-center">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <Loader2 size={40} className="text-brand-primary animate-spin" />
                                                                <span className="text-[11px] font-bold uppercase tracking-widest text-md-on-surface-variant">Syncing Streams...</span>
                                                            </div>
                                                        </td></tr>
                                                    ) : dailyRecords.length > 0 ? (
                                                        dailyRecords.map((record, i) => (
                                                            <motion.tr
                                                                key={record._id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.05 }}
                                                                className="group hover:bg-md-surface-variant/10 transition-colors"
                                                            >
                                                                <td className="px-6 py-6 m3-card-outlined rounded-r-none border-r-0 border-md-outline/10 bg-md-surface-container-lowest animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-md-on-surface font-black text-sm tracking-tight">{new Date(record.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
                                                                        <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{new Date(record.timestamp).getFullYear()}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-6 m3-card-outlined rounded-none border-x-0 border-md-outline/10 bg-md-surface-container-lowest">
                                                                    <div className="flex items-center justify-center gap-4">
                                                                        <div className="flex flex-col items-end">
                                                                            <span className="text-md-on-surface font-mono text-xs font-bold">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                                            <span className="text-[8px] text-brand-primary uppercase font-black tracking-widest opacity-70">LOGIN TIME</span>
                                                                        </div>
                                                                        <div className="w-8 h-[2px] bg-md-outline/10 rounded-full" />
                                                                        <div className="flex flex-col items-start">
                                                                            <span className={`font-mono text-xs font-bold ${record.checkOut ? 'text-brand-tertiary' : 'text-green-500 animate-pulse'}`}>
                                                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'PRESENT'}
                                                                            </span>
                                                                            <span className="text-[8px] text-brand-tertiary uppercase font-black tracking-widest opacity-70">LOGOUT TIME</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-6 m3-card-outlined rounded-none border-x-0 border-md-outline/10 bg-md-surface-container-lowest">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-md-secondary-container/30 flex items-center justify-center text-md-secondary">
                                                                            <MapPin size={14} />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-md-on-surface uppercase tracking-tight truncate max-w-[120px]">
                                                                            {record.locationName}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-6 m3-card-outlined rounded-l-none border-l-0 border-md-outline/10 text-right bg-md-surface-container-lowest">
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-md-on-surface font-black text-lg leading-none">{record.totalHours?.toFixed(1) || '0.0'}</span>
                                                                        <span className="text-[9px] text-md-on-surface-variant font-bold uppercase tracking-widest leading-none mt-1">Total Hrs</span>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="4" className="py-24 text-center">
                                                            <div className="flex flex-col items-center gap-4 opacity-10">
                                                                <Activity size={48} />
                                                                <span className="text-[11px] font-bold uppercase tracking-widest">No Stream Data Detected</span>
                                                            </div>
                                                        </td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card Feed */}
                                        <div className="md:hidden space-y-6">
                                            {loading ? (
                                                <div className="py-24 text-center">
                                                    <Loader2 size={40} className="text-brand-primary mx-auto animate-spin mb-4" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-md-on-surface-variant">Syncing Streams...</span>
                                                </div>
                                            ) : dailyRecords.length > 0 ? (
                                                dailyRecords.map((record, i) => (
                                                    <motion.div
                                                        key={record._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="m3-card-outlined p-6 flex flex-col gap-5 border-md-outline/10 bg-md-surface-container-lowest/50"
                                                    >
                                                        <div className="flex items-center justify-between border-b border-md-outline/5 pb-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-md-on-surface font-black text-lg">
                                                                    {new Date(record.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                                                                </span>
                                                                <span className="text-[9px] text-md-on-surface-variant font-bold uppercase tracking-[0.2em]">{new Date(record.timestamp).getFullYear()}</span>
                                                            </div>
                                                            <div className="flex items-baseline gap-1.5 px-4 py-2 bg-brand-primary/10 rounded-full text-brand-primary">
                                                                <span className="text-xl font-black">{record.totalHours?.toFixed(1) || '0.0'}</span>
                                                                <span className="text-[9px] font-bold uppercase">HRS</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest mb-1.5">LOGIN</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-brand-primary shadow-sm" />
                                                                    <span className="text-md-on-surface font-mono font-bold text-sm tracking-tight">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-brand-tertiary font-black uppercase tracking-widest mb-1.5">LOGOUT</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full shadow-sm ${record.checkOut ? 'bg-brand-tertiary shadow-brand-tertiary/40' : 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                                                                    <span className={`text-sm font-mono font-bold tracking-tight ${record.checkOut ? 'text-brand-tertiary' : 'text-green-500 animate-pulse'}`}>
                                                                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'PRESENT'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 bg-md-surface-container p-3 rounded-xl border border-md-outline/5">
                                                            <MapPin size={14} className="text-brand-primary mt-0.5 shrink-0" />
                                                            <span className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-tight leading-relaxed">
                                                                {record.locationName}
                                                            </span>
                                                        </div>

                                                        {record.overtime > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-md-secondary-container/30 text-md-secondary rounded-lg">
                                                                <Activity size={12} />
                                                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">+{record.overtime.toFixed(1)} OT Load Detected</span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="py-24 text-center opacity-10">
                                                    <Activity size={48} className="mx-auto mb-4" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">No Stream Data Detected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="m3-card-elevated p-8 bg-md-surface-container-low border-md-outline/5 transition-all">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-6">Total Efficiency</h4>
                                    <div className="flex items-baseline gap-3 overflow-hidden">
                                        <span className="text-4xl sm:text-5xl font-mono font-bold text-md-on-surface tracking-tighter truncate">{currentSessionMetrics.totalTimer}</span>
                                    </div>
                                    <div className="flex gap-4 mt-2 mb-6">
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">Hours</span>
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">Min</span>
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">Sec</span>
                                    </div>
                                    <p className="text-xs font-medium text-md-on-surface-variant italic">Live Operational Pulse: Computing net efficiency...</p>
                                </div>
                                <div className="m3-card-elevated p-8 bg-md-surface-container-low border-md-outline/5 transition-all">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant mb-6">Total Payload (HRS)</h4>
                                    <div className="flex items-baseline gap-3 overflow-hidden">
                                        <span className="text-4xl sm:text-5xl font-bold text-md-on-surface tracking-tighter truncate">{currentSessionMetrics.hours}</span>
                                        <span className="text-sm font-bold text-md-on-surface-variant uppercase">HR</span>
                                    </div>
                                    <p className="mt-6 text-xs font-medium text-md-on-surface-variant">Cumulative decimal representation of current session.</p>
                                </div>
                                <div className="m3-card-elevated p-8 bg-md-surface-container-low border-md-outline/5">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-md-secondary mb-6">Overtime Detection</h4>
                                    <div className="flex items-baseline gap-3 overflow-hidden">
                                        <span className={`text-4xl sm:text-5xl font-mono font-bold tracking-tighter truncate ${currentSessionMetrics.overtime > 0 ? 'text-md-secondary' : 'text-md-on-surface/20'}`}>
                                            {currentSessionMetrics.otTimer}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">OT Load</span>
                                    </div>
                                    <p className="mt-6 text-xs font-medium text-md-on-surface-variant">Automatic OT activation for activity detected after 18:00.</p>
                                </div>
                            </div>

                            <div className="m3-card-outlined p-10 border-md-outline/10 bg-md-surface-container-lowest/30">
                                <div className="flex flex-col md:flex-row gap-12 items-center">
                                    <div className="flex-1 space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-md-secondary-container/20 text-md-secondary text-[10px] font-bold uppercase tracking-widest">
                                            <Zap size={14} fill="currentColor" /> System Health Optimal
                                        </div>
                                        <h3 className="text-3xl font-bold text-md-on-surface tracking-tight">Identity & Metric Synchronization</h3>
                                        <p className="text-md-on-surface-variant leading-relaxed">
                                            The Control Panel provides a real-time visualization of your operational telemetry.
                                            All metrics are synchronized directly with the primary node cluster every 1000ms.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-64 flex flex-col gap-4">
                                        <div className="p-6 rounded-[24px] bg-md-surface-container-high border border-md-outline/5 text-center">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-md-on-surface-variant mb-2">Network State</p>
                                            <div className="flex items-center justify-center gap-2 text-brand-primary">
                                                <Globe size={16} className="animate-spin-slow" />
                                                <span className="text-sm font-bold">SN-NET / ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="m3-card-filled p-8 md:p-10 bg-md-surface-container-low border border-md-outline/10 rounded-[32px] overflow-hidden relative shadow-lg">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-[100px]" />

                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                                    <div className="relative group shrink-0">
                                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-[32px] bg-gradient-to-br from-brand-primary/20 via-brand-primary/5 to-transparent border-2 border-brand-primary/20 flex items-center justify-center text-brand-primary text-5xl font-bold shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                            {profileData.name ? profileData.name.charAt(0) : <User size={48} />}
                                        </div>
                                        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 border-md-outline/10 transition-all duration-300 ${isEditingProfile ? 'bg-md-error text-white' : 'bg-md-surface-container-high text-brand-primary'}`}>
                                            <Zap size={18} fill="currentColor" strokeWidth={0} />
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest border border-brand-primary/20">
                                                    {user?.role} NODE
                                                </span>
                                                <h2 className="text-2xl md:text-3xl font-bold text-md-on-surface tracking-tight">{user?.name}</h2>
                                            </div>
                                            <button
                                                onClick={() => isEditingProfile ? handleProfileUpdate() : setIsEditingProfile(true)}
                                                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${isEditingProfile ? 'bg-md-error text-white' : 'bg-brand-primary text-brand-on-primary'}`}
                                                disabled={isSavingProfile}
                                            >
                                                {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : (isEditingProfile ? <Save size={16} /> : <Edit size={16} />)}
                                                {isEditingProfile ? 'Save' : 'Edit Profile'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {statusMessage && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`mb-6 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2.5 border ${checkStatus === 'error' ? 'bg-md-error-container text-md-on-error-container border-md-error/20' : 'bg-brand-primary-container/20 text-brand-primary border-brand-primary/20'}`}
                                                >
                                                    {checkStatus === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                                    {statusMessage}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-md-outline/10">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Name</label>
                                                {isEditingProfile ? (
                                                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                ) : <p className="text-sm font-bold text-md-on-surface truncate">{user?.name}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Email</label>
                                                {isEditingProfile ? (
                                                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                ) : <p className="text-sm font-bold text-md-on-surface truncate">{user?.email}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Mobile</label>
                                                {isEditingProfile ? (
                                                    <input type="text" value={profileData.phoneNumber} onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })} className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                ) : <p className="text-sm font-bold text-md-on-surface truncate">{user?.phoneNumber || 'Not Set'}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Alternative Contact</label>
                                                {isEditingProfile ? (
                                                    <input type="text" value={profileData.alternativeContact} onChange={(e) => setProfileData({ ...profileData, alternativeContact: e.target.value })} className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                ) : <p className="text-sm font-bold text-md-on-surface truncate">{user?.alternativeContact || 'Not Set'}</p>}
                                            </div>
                                            <CustomSelect
                                                label="Blood Group"
                                                value={profileData.bloodGroup}
                                                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                                                onChange={(val) => setProfileData({ ...profileData, bloodGroup: val })}
                                                disabled={!isEditingProfile}
                                            />
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">System Role</label>
                                                {isEditingProfile ? (
                                                    <select
                                                        value={profileData.role}
                                                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                                                        className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30"
                                                    >
                                                        {['Staff', 'Senior', 'Accountant', 'Admin', 'Application Engineer', 'Office Employee'].map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                ) : <p className="text-sm font-bold text-brand-primary uppercase tracking-tight">{user?.role}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Date of Joining</label>
                                                {isEditingProfile ? (
                                                    <input type="date" value={profileData.joiningDate} onChange={(e) => setProfileData({ ...profileData, joiningDate: e.target.value })} className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                ) : <p className="text-sm font-bold text-md-on-surface">{user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not Set'}</p>}
                                            </div>

                                            <CustomSelect
                                                label="Employment Type"
                                                value={profileData.employmentType}
                                                options={['Full-time', 'Part-time', 'Contract', 'Intern']}
                                                onChange={(val) => setProfileData({ ...profileData, employmentType: val })}
                                                disabled={!isEditingProfile}
                                            />

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Grade/Level</label>
                                                {isEditingProfile ? (
                                                    <input type="text" placeholder="e.g., Junior, Lead" value={profileData.gradeLevel} onChange={(e) => setProfileData({ ...profileData, gradeLevel: e.target.value })} className="w-full bg-md-surface-container p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                ) : <p className="text-sm font-bold text-md-on-surface">{user?.gradeLevel || 'Not Set'}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Official Social Link</label>
                                                {isEditingProfile ? (
                                                    <div className="relative">
                                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant opacity-40" size={14} />
                                                        <input type="url" placeholder="LinkedIn / Portfolio" value={profileData.socialLinks} onChange={(e) => setProfileData({ ...profileData, socialLinks: e.target.value })} className="w-full bg-md-surface-container pl-10 p-2.5 rounded-xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30" />
                                                    </div>
                                                ) : profileData.socialLinks ? (
                                                    <a href={profileData.socialLinks} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-primary hover:underline text-sm font-bold">
                                                        <Link2 size={14} /> View Identity Node
                                                    </a>
                                                ) : <p className="text-sm font-medium text-md-on-surface-variant opacity-40">No URL Linked</p>}
                                            </div>

                                            <div className="col-span-full space-y-1 pt-4">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Core Competencies</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., JavaScript, React, System Design"
                                                        value={profileData.coreCompetencies}
                                                        onChange={(e) => setProfileData({ ...profileData, coreCompetencies: e.target.value })}
                                                        className="w-full bg-md-surface-container p-3 rounded-2xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30"
                                                    />
                                                ) : (
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {user?.coreCompetencies ? user.coreCompetencies.split(',').map((skill, idx) => (
                                                            <span key={idx} className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest border border-brand-primary/20">
                                                                {skill.trim()}
                                                            </span>
                                                        )) : <p className="text-sm font-medium text-md-on-surface-variant opacity-40">No competencies listed.</p>}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-full space-y-1 pt-4">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Current Projects</label>
                                                {isEditingProfile ? (
                                                    <textarea
                                                        rows={2}
                                                        value={profileData.currentProjects}
                                                        onChange={(e) => setProfileData({ ...profileData, currentProjects: e.target.value })}
                                                        className="w-full bg-md-surface-container p-3 rounded-2xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30 resize-none"
                                                        placeholder="List your active assignments or initiatives..."
                                                    />
                                                ) : <p className="text-sm font-bold text-md-on-surface leading-relaxed">{user?.currentProjects || 'No active projects detected.'}</p>}
                                            </div>

                                            <div className="col-span-full space-y-1 pt-4">
                                                <label className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Home Address</label>
                                                {isEditingProfile ? (
                                                    <textarea
                                                        rows={3}
                                                        value={profileData.homeAddress}
                                                        onChange={(e) => setProfileData({ ...profileData, homeAddress: e.target.value })}
                                                        className="w-full bg-md-surface-container p-3 rounded-2xl border border-md-outline/20 text-sm font-medium focus:ring-2 ring-brand-primary/30 resize-none"
                                                        placeholder="Mailing address for identity verification..."
                                                    />
                                                ) : <p className="text-sm font-medium text-md-on-surface-variant leading-relaxed italic">{user?.homeAddress || 'No residency data synchronized.'}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

            {/* Ambient Multichrome MD3 Accents */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-brand-primary-container/10 rounded-full blur-[160px] -z-10 pointer-events-none animate-pulse" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-brand-tertiary-container/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-secondary-container/5 rounded-full blur-[200px] -z-10 pointer-events-none" />
        </div >
    );
};

export default Dashboard;
