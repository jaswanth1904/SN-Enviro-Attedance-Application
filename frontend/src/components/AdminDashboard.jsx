import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, BarChart3, ShieldAlert,
    Search, Download, Filter,
    CheckCircle2, AlertCircle, Clock,
    TrendingUp, ShieldCheck, Mail, MapPin,
    Calendar, Wallet, Briefcase, ChevronRight, XCircle, Check, FileText, ClipboardList,
    Activity, Shield, Laptop, RefreshCw, Loader2, Eye, ExternalLink, Globe, Map, Zap, LayoutDashboard
} from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const AuditModal = ({ record, onClose }) => {
    if (!record) return null;

    const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-6 bg-md-surface/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="m3-card-elevated w-full max-w-6xl overflow-hidden bg-md-surface-container-high border-md-outline/10 shadow-3xl"
            >
                <div className="flex flex-col lg:grid lg:grid-cols-2 h-full max-h-[90vh]">
                    {/* Visual & Identity Intelligence */}
                    <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-md-outline/10 flex flex-col bg-md-surface-container-lowest">
                        <div className="flex items-start justify-between mb-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-3xl font-black text-md-on-surface tracking-tighter">Personnel Audit</h3>
                                    <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em] mt-1">Official Verification Stream</p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-md-surface-container border border-md-outline/5">
                                    <div className="w-12 h-12 rounded-xl bg-brand-primary text-brand-on-primary flex items-center justify-center font-black text-xl">
                                        {record.user?.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-md-on-surface font-black text-base truncate">{record.user?.name}</p>
                                            <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest border border-brand-primary/10 shrink-0">
                                                {record.user?.role}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-brand-primary font-medium lowercase opacity-70 underline decoration-brand-primary/30 truncate mb-1.5">{record.user?.email}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-md-on-surface-variant">
                                                <div className="w-1 h-1 rounded-full bg-md-outline/30" />
                                                <span className="text-[9px] font-bold uppercase tracking-tighter">TEL: {record.user?.phoneNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-md-on-surface-variant">
                                                <div className="w-1 h-1 rounded-full bg-md-outline/30" />
                                                <span className="text-[9px] font-bold uppercase tracking-tighter">BLOOD: {record.user?.bloodGroup || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                                <ShieldCheck size={28} />
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] rounded-[32px] overflow-hidden border border-md-outline/10 relative bg-md-surface-container-low group shadow-inner">
                            {record.selfieUrl ? (
                                <img
                                    src={record.selfieUrl.startsWith('http') ? record.selfieUrl : `${apiBase}${record.selfieUrl}`}
                                    alt="Auth Selfie"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-md-on-surface-variant/20 bg-md-surface-container">
                                    <Laptop size={64} strokeWidth={1} />
                                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest">No Visual Bio-Data</p>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-md-surface/90 via-md-surface/40 to-transparent">
                                <div className="flex flex-col">
                                    <p className="text-[9px] text-brand-primary font-black uppercase tracking-[0.3em] mb-1.5">Temporal Stamp</p>
                                    <p className="text-md-on-surface font-black text-lg tracking-tight leading-none mb-1">
                                        {new Date(record.timestamp).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        }).toUpperCase()}
                                    </p>
                                    <p className="text-[10px] text-brand-primary/60 font-bold font-mono">
                                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geolocation & Metrics Intelligence */}
                    <div className="p-8 md:p-10 flex flex-col bg-md-surface-container-highest/30">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-md-on-surface tracking-tighter">Geo Intel</h3>
                                <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em] mt-1">Operational Coordinate Lock</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-12 h-12 m3-card-elevated flex items-center justify-center text-md-on-surface-variant hover:text-md-on-surface bg-md-surface-container border-0 shadow-lg"
                            >
                                <XCircle size={24} />
                            </motion.button>
                        </div>

                        <div className="flex-1 min-h-[300px] rounded-[32px] overflow-hidden border border-md-outline/10 relative group bg-md-surface-container shadow-2xl">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                src={`https://maps.google.com/maps?q=${record.location?.coordinates[1]},${record.location?.coordinates[0]}&z=16&output=embed`}
                                className="opacity-90 group-hover:opacity-100 transition-opacity grayscale-[0.2]"
                                style={{ filter: 'contrast(1.1) brightness(1.05)' }}
                            />
                            <div className="absolute top-6 left-6">
                                <div className="m3-card-filled px-5 py-2.5 bg-md-surface/90 backdrop-blur-xl rounded-full shadow-2xl border border-brand-primary/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                                        <span className="text-[10px] font-black text-md-on-surface uppercase tracking-[0.2em]">GPS SECURED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="m3-card-filled p-6 bg-md-surface-container-high border border-md-outline/5 hover:bg-md-surface-container-highest transition-colors">
                                <p className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-2 opacity-50">Shift Start</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <Clock size={16} />
                                    </div>
                                    <p className="text-md-on-surface font-black text-base font-mono">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
                                </div>
                            </div>

                            <div className="m3-card-filled p-6 bg-md-surface-container-high border border-md-outline/5 hover:bg-md-surface-container-highest transition-colors">
                                <p className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-2 opacity-50">{record.checkOut ? 'Shift Completion' : 'Active Load'}</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.checkOut ? 'bg-brand-tertiary/10 text-brand-tertiary' : 'bg-md-secondary-container/30 text-md-secondary'}`}>
                                        {record.checkOut ? <LogOut size={16} /> : <Activity size={16} />}
                                    </div>
                                    <p className={`font-black text-base font-mono ${record.checkOut ? 'text-brand-tertiary' : 'text-md-on-surface'}`}>
                                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : (record.totalHours?.toFixed(2) || '0.00') + ' HRS'}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-2 m3-card-filled p-6 bg-md-surface-container-high border border-md-outline/5">
                                <p className="text-[9px] text-md-on-surface-variant font-black uppercase tracking-widest mb-2 opacity-50">Operational Address</p>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                        <MapPin size={22} />
                                    </div>
                                    <p className="text-md-on-surface font-black text-sm tracking-tight leading-relaxed">{record.locationName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, onClick }) => (
    <motion.div
        whileHover={onClick ? { scale: 1.02, backgroundColor: 'var(--md-sys-color-surface-container-high)' } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        onClick={onClick}
        className={`m3-card-elevated p-8 bg-md-surface-container-low border border-md-outline/5 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
        <div className="flex items-center gap-6 relative z-10">
            <div className={`w-14 h-14 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color} border border-${color}/10`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] mb-1.5 opacity-60">{label}</p>
                <h4 className="text-3xl font-black text-md-on-surface tracking-tighter">{value}</h4>
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [allAttendance, setAllAttendance] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [allSalaries, setAllSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('attendance');
    const [selectedAudit, setSelectedAudit] = useState(null);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchAllData();

        // Dynamic Sync Logic: Only poll if tab is active to save resources for 500+ users
        const handleSync = () => {
            if (document.visibilityState === 'visible') {
                fetchAllData();
            }
        };

        const syncInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchAllData();
            }
        }, 30000); // Increased to 30s to reduce server throtling for massive teams

        document.addEventListener('visibilitychange', handleSync);

        const telemetryTimer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(syncInterval);
            clearInterval(telemetryTimer);
            document.removeEventListener('visibilitychange', handleSync);
        };
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [attRes, leaveRes, salRes] = await Promise.all([
                api.get('/attendance/reports'),
                api.get('/leaves'),
                api.get('/salary')
            ]);
            setAllAttendance(attRes.data.data || []);
            setAllLeaves(leaveRes.data.data || []);
            setAllSalaries(salRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveStatusUpdate = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status });
            fetchAllData();
        } catch (err) {
            console.error('Failed to update leave status', err);
        }
    };

    const stats = React.useMemo(() => {
        const totalOT = allAttendance.reduce((acc, curr) => acc + (curr.overtime || 0), 0);
        const uniqueUsers = new Set(allAttendance.filter(r => r.user?._id).map(r => r.user?._id)).size;
        const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
        const totalPayroll = allSalaries.reduce((acc, curr) => acc + (curr.totalSalary || 0), 0);

        return {
            totalOT,
            uniqueUsers,
            pendingLeaves,
            activeSessions: allAttendance.filter(r => !r.checkOut).length,
            totalPayroll
        };
    }, [allAttendance, allLeaves, allSalaries]);

    const filteredRecords = allAttendance.filter(record => {
        const name = record.user?.name?.toLowerCase() || '';
        const location = record.locationName?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return name.includes(search) || location.includes(search);
    });

    return (
        <div className="min-h-screen bg-md-surface pt-32 pb-20 px-8 relative">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* M3 Admin Header - Ultra Precise Layout */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
                >
                    <div className="flex items-center gap-10">
                        <div className="w-20 h-20 m3-card-elevated flex items-center justify-center text-brand-primary bg-md-surface-container-low relative border-brand-primary/10">
                            <ShieldAlert size={36} />
                        </div>
                        <div>
                            <div className="flex flex-col mb-1">
                                <h1 className="text-4xl md:text-5xl font-bold text-md-on-surface tracking-tight">
                                    Dashboard
                                </h1>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em]">Admin Central Command</p>
                                    <div className="w-1 h-1 rounded-full bg-md-outline/30" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Live Sync Alpha</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-md-on-surface-variant font-medium text-sm flex items-center gap-2 mt-4">
                                <ShieldCheck size={16} className="text-brand-primary" /> Active Oversight: {user?.name}
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchAllData}
                        className="self-start md:self-center px-6 py-3 m3-card-elevated flex items-center gap-3 text-md-on-surface-variant hover:text-brand-primary transition-all bg-md-surface-container-low border-0 group"
                    >
                        <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Force Refresh</span>
                    </motion.button>
                </motion.div>

                {/* Consolidated Operational Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
                    <StatCard
                        label="Login Candidates"
                        value={stats.uniqueUsers}
                        icon={Users}
                        color="brand-primary"
                        onClick={() => setActiveTab('today-candidates')}
                    />
                    <StatCard
                        label="In Review"
                        value={stats.pendingLeaves}
                        icon={ClipboardList}
                        color="brand-secondary"
                    />
                    <StatCard
                        label="Pending Leaves"
                        value={stats.pendingLeaves}
                        icon={FileText}
                        color="brand-secondary"
                    />
                    <StatCard
                        label="Payroll"
                        value={`₹${stats.totalPayroll.toLocaleString()}`}
                        icon={Wallet}
                        color="brand-accent"
                    />
                    <StatCard
                        label="Ops Load"
                        value={`${stats.totalOT.toFixed(1)}H`}
                        icon={Clock}
                        color="brand-tertiary"
                    />
                    <StatCard
                        label="Live Agents"
                        value={stats.activeSessions}
                        icon={Activity}
                        color="brand-primary"
                    />
                </div>

                {/* M3 Navigation Tabs */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'attendance', label: 'Presence Stream', icon: Activity },
                        { id: 'leaves', label: 'Leaves Clearance Center', icon: Briefcase },
                        { id: 'payroll', label: 'Treasury Records', icon: Wallet },
                    ].map((tab) => (
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
                            className="space-y-10"
                        >
                            <div className="m3-card-filled bg-md-surface-container-low border border-md-outline/10 overflow-hidden">
                                <div className="p-8 md:p-10 border-b border-md-outline/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-md-on-surface tracking-tight">Personnel Stream</h3>
                                        <p className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mt-1">Real-time Telemetry Data</p>
                                    </div>
                                </div>
                                <div className="p-4 md:p-10">
                                    {/* Desktop View */}
                                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-separate border-spacing-y-4">
                                            <thead>
                                                <tr>
                                                    <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Staff Identity</th>
                                                    <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Log Date</th>
                                                    <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Time Matrix</th>
                                                    <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Efficiency Matrix</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="4" className="py-24 text-center">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <Loader2 size={40} className="text-brand-primary animate-spin" />
                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-md-on-surface-variant">Synchronizing Matrix...</span>
                                                        </div>
                                                    </td></tr>
                                                ) : filteredRecords.map((record, i) => {
                                                    const currentDate = new Date(record.timestamp).toDateString();
                                                    const prevDate = i > 0 ? new Date(filteredRecords[i - 1].timestamp).toDateString() : null;
                                                    const isNewDay = i > 0 && currentDate !== prevDate;

                                                    return (
                                                        <React.Fragment key={record._id}>
                                                            {isNewDay && (
                                                                <tr>
                                                                    <td colSpan="4" className="py-8">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="h-px bg-md-outline/10 flex-1" />
                                                                            <div className="px-4 py-1.5 rounded-full bg-md-surface-container-high border border-md-outline/5 text-[9px] font-bold text-md-on-surface-variant uppercase tracking-widest">
                                                                                EO Day - Date Shift Detected
                                                                            </div>
                                                                            <div className="h-px bg-md-outline/10 flex-1" />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            <motion.tr
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.03 }}
                                                                className="group hover:bg-md-surface-variant/10 transition-colors"
                                                            >
                                                                <td className="px-8 py-8 m3-card-outlined rounded-r-0 border-r-0 border-md-outline/5 bg-md-surface-container-lowest/50">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                                                                            {record.user?.name?.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-md-on-surface font-bold tracking-tight text-sm mb-0.5">{record.user?.name}</p>
                                                                            <p className="text-[10px] text-md-on-surface-variant font-medium lowercase truncate max-w-[150px]">{record.user?.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-8 m3-card-outlined rounded-none border-x-0 border-md-outline/5 bg-md-surface-container-lowest/50">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-md-on-surface font-black text-sm tracking-tight">{new Date(record.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
                                                                        <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{new Date(record.timestamp).getFullYear()}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-8 m3-card-outlined rounded-none border-x-0 border-md-outline/5 bg-md-surface-container-lowest/50">
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center gap-2.5 mb-2">
                                                                            <span className="text-brand-primary font-mono text-sm font-bold">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                                            <span className="text-md-outline/20">—</span>
                                                                            <span className={`font-mono text-sm font-bold ${record.checkOut ? 'text-brand-tertiary' : 'text-green-500 animate-pulse'}`}>
                                                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'PRESENT'}
                                                                            </span>
                                                                        </div>
                                                                        {!record.checkOut && (
                                                                            <div className="flex flex-col gap-1 mt-1">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                                                                                    <span className="text-[10px] font-bold font-mono text-green-600">
                                                                                        {formatDuration(currentTime - new Date(record.timestamp))}
                                                                                    </span>
                                                                                </div>
                                                                                {(() => {
                                                                                    const now = currentTime;
                                                                                    const start = new Date(record.timestamp);
                                                                                    const sixPM = new Date(now);
                                                                                    sixPM.setHours(18, 0, 0, 0);
                                                                                    if (now > sixPM) {
                                                                                        const ot = (now - Math.max(start, sixPM)) / (1000 * 60 * 60);
                                                                                        if (ot > 0) return (
                                                                                            <span className="text-[8px] font-bold text-md-secondary uppercase animate-pulse">
                                                                                                OT ACTIVE: {ot.toFixed(2)}H
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                    return null;
                                                                                })()}
                                                                            </div>
                                                                        )}
                                                                        <button
                                                                            onClick={() => setSelectedAudit(record)}
                                                                            className="flex items-center gap-2 text-left group/loc"
                                                                        >
                                                                            <MapPin size={12} className="text-brand-primary" />
                                                                            <span className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-tight truncate max-w-[180px] group-hover/loc:text-brand-primary transition-colors">
                                                                                {record.locationName}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-8 m3-card-outlined rounded-l-0 border-l-0 border-md-outline/5 text-right bg-md-surface-container-lowest/50">
                                                                    <div className="flex items-baseline gap-2 justify-end">
                                                                        <span className="text-md-on-surface font-bold text-xl leading-none">
                                                                            {record.checkOut
                                                                                ? record.totalHours?.toFixed(1)
                                                                                : ((currentTime - new Date(record.timestamp)) / (1000 * 60 * 60)).toFixed(1)}
                                                                        </span>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] text-md-on-surface-variant font-bold uppercase tracking-widest">HRS</span>
                                                                            {(() => {
                                                                                let ot = record.overtime || 0;
                                                                                if (!record.checkOut) {
                                                                                    const now = currentTime;
                                                                                    const start = new Date(record.timestamp);
                                                                                    const sixPM = new Date(now);
                                                                                    sixPM.setHours(18, 0, 0, 0);
                                                                                    if (now > sixPM) {
                                                                                        ot = (now - Math.max(start, sixPM)) / (1000 * 60 * 60);
                                                                                    }
                                                                                }
                                                                                if (ot > 0) return <span className="text-[9px] text-md-secondary font-bold uppercase text-xs">+{ot.toFixed(1)} OT</span>;
                                                                                return null;
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile/Tablet View */}
                                    <div className="md:hidden space-y-6">
                                        {loading ? (
                                            <div className="py-24 text-center">
                                                <Loader2 size={40} className="text-brand-primary mx-auto animate-spin mb-4" />
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-md-on-surface-variant">Syncing Streams...</p>
                                            </div>
                                        ) : filteredRecords.length > 0 ? (
                                            filteredRecords.map((record, i) => {
                                                const currentDate = new Date(record.timestamp).toDateString();
                                                const prevDate = i > 0 ? new Date(filteredRecords[i - 1].timestamp).toDateString() : null;
                                                const isNewDay = i > 0 && currentDate !== prevDate;

                                                return (
                                                    <React.Fragment key={record._id}>
                                                        {isNewDay && (
                                                            <div className="py-2 flex items-center gap-4">
                                                                <div className="h-px bg-md-outline/10 flex-1" />
                                                                <span className="text-[8px] font-black text-md-on-surface-variant uppercase tracking-[0.3em]">Day Break</span>
                                                                <div className="h-px bg-md-outline/10 flex-1" />
                                                            </div>
                                                        )}
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="m3-card-outlined p-6 border-md-outline/10 bg-md-surface-container-lowest/50"
                                                        >
                                                            <div className="flex items-center gap-4 mb-4 border-b border-md-outline/5 pb-4">
                                                                <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-bold">
                                                                    {record.user?.name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-md-on-surface">{record.user?.name}</p>
                                                                    <p className="text-[10px] text-md-on-surface-variant font-medium mt-0.5">{record.user?.role || 'Staff'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="m3-card-filled p-4 bg-md-surface-container-low border border-md-outline/5 rounded-2xl mb-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-md-on-surface-variant mb-1">Log Date</span>
                                                                        <span className="text-sm font-black text-md-on-surface tracking-tight">
                                                                            {new Date(record.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary opacity-30">
                                                                        <Calendar size={18} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                                <div className="bg-md-surface-container-low p-3 rounded-2xl border border-md-outline/5">
                                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-md-on-surface-variant mb-1">Time Profile</p>
                                                                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-md-on-surface">
                                                                        <span className="text-brand-primary">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                                        <span>-</span>
                                                                        <span className={record.checkOut ? 'text-brand-tertiary font-black' : 'text-green-500 animate-pulse'}>
                                                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'PRESENT'}
                                                                        </span>
                                                                    </div>
                                                                    {!record.checkOut && (
                                                                        <p className="text-[9px] font-mono font-bold text-green-600 mt-1.5">
                                                                            LIVE: {formatDuration(currentTime - new Date(record.timestamp))}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="bg-md-surface-container-low p-3 rounded-2xl border border-md-outline/5">
                                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-md-on-surface-variant mb-1">Metrics</p>
                                                                    <div className="flex items-baseline gap-1">
                                                                        <span className="text-lg font-black text-md-on-surface">{record.totalHours?.toFixed(1) || '0.0'}</span>
                                                                        <span className="text-[9px] font-bold uppercase text-md-on-surface-variant">HRS</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-3 bg-md-surface-container p-3 rounded-2xl border border-md-outline/5">
                                                                <MapPin size={14} className="text-brand-primary mt-0.5 shrink-0" />
                                                                <span className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-tight leading-relaxed line-clamp-2">
                                                                    {record.locationName}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <div className="py-20 text-center opacity-20">
                                                <Activity size={48} className="mx-auto mb-4" />
                                                <p className="text-xs font-bold uppercase tracking-widest">No matching nodes detected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'today-candidates' && (
                        <motion.div
                            key="today-candidates"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-8"
                        >
                            <div className="m3-card-filled bg-md-surface-container-low border border-md-outline/10 overflow-hidden">
                                <div className="p-8 md:p-10 border-b border-md-outline/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-md-on-surface">Today's Presence Stream</h3>
                                        <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">Detailed Personnel Roster</p>
                                    </div>
                                    <button onClick={() => setActiveTab('attendance')} className="m3-btn-tonal px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Back to Hub</button>
                                </div>
                                <div className="p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allAttendance
                                            .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
                                            .map((record, i) => (
                                                <motion.div
                                                    key={record._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="m3-card-outlined p-6 border-md-outline/10 bg-md-surface-container-lowest/50 group hover:border-brand-primary/30 transition-all"
                                                >
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center font-black text-xl">
                                                            {record.user?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-md-on-surface">{record.user?.name}</p>
                                                            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest opacity-60">{record.user?.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-md-surface-container border border-md-outline/5 text-xs">
                                                            <span className="text-md-on-surface-variant font-bold uppercase tracking-tighter">Login</span>
                                                            <span className="text-brand-primary font-mono font-black">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-md-surface-container border border-md-outline/5 text-xs">
                                                            <span className="text-md-on-surface-variant font-bold uppercase tracking-tighter">Status</span>
                                                            <span className={`font-black tracking-widest text-[9px] px-2 py-0.5 rounded-full h-auto ${record.checkOut ? 'bg-brand-tertiary text-white' : 'bg-green-500 text-white animate-pulse'}`}>
                                                                {record.checkOut ? 'SHIFT END' : 'ACTIVE NOW'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-start gap-2 pt-2 text-[10px] text-md-on-surface-variant font-bold">
                                                            <MapPin size={12} className="text-brand-primary shrink-0" />
                                                            <span className="line-clamp-1">{record.locationName}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        {allAttendance.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length === 0 && (
                                            <div className="col-span-full py-20 text-center opacity-30">
                                                <Users size={48} className="mx-auto mb-4" />
                                                <p className="text-sm font-black uppercase tracking-[0.4em]">Zero Active Nodes Today</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'leaves' && (
                        <motion.div
                            key="leaves"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid md:grid-cols-2 gap-8"
                        >
                            {allLeaves.filter(l => l.status === 'Pending').length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center m3-card-filled border-md-outline/5 opacity-40">
                                    <CheckCircle2 size={64} className="text-brand-primary/20 mb-6" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-md-on-surface-variant">All requests cleared from stack</p>
                                </div>
                            ) : allLeaves.filter(l => l.status === 'Pending').map((leave, i) => (
                                <motion.div
                                    key={leave._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="m3-card-filled p-10 bg-md-surface-container-low border border-md-outline/10 hover:bg-md-surface-container-high transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                                <Users size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-bold text-md-on-surface tracking-tight">{leave.user?.name}</h4>
                                                <div className="flex items-center gap-2.5 mt-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                                                    <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{leave.leaveType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-md-surface-container p-8 rounded-[24px] mb-10 border border-md-outline/5">
                                        <div className="grid grid-cols-2 gap-10 mb-8">
                                            <div>
                                                <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-2">Initiation</p>
                                                <p className="text-lg text-md-on-surface font-bold tracking-tight">{new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-2">Completion</p>
                                                <p className="text-lg text-md-on-surface font-bold tracking-tight">{new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-md-outline/10 pt-8">
                                            <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-3">Manifesto</p>
                                            <p className="text-sm text-md-on-surface-variant leading-relaxed font-medium italic">"{leave.reason}"</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleLeaveStatusUpdate(leave._id, 'Approved')}
                                            className="m3-btn-filled py-4 text-[11px] font-bold"
                                        >
                                            APPROVE
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleLeaveStatusUpdate(leave._id, 'Rejected')}
                                            className="bg-md-error/10 text-md-error py-4 rounded-full text-[11px] font-bold hover:bg-md-error/20 transition-colors uppercase tracking-widest"
                                        >
                                            DISMISS
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'payroll' && (
                        <motion.div
                            key="payroll"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <div className="m3-card-elevated p-12 bg-md-surface-container-low border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div>
                                    <h3 className="text-3xl font-bold text-md-on-surface tracking-tight">Financial Disbursement</h3>
                                    <p className="text-md-on-surface-variant font-medium text-lg mt-2 tracking-tight">Active Cycle: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="m3-btn-filled px-10 py-5 text-[11px] font-bold flex items-center gap-4 h-auto"
                                >
                                    INITIALIZE PAYOUT <Wallet size={24} />
                                </motion.button>
                            </div>

                            <div className="m3-card-filled bg-md-surface-container-low border border-md-outline/10 overflow-hidden">
                                <div className="p-10 border-b border-md-outline/5">
                                    <h3 className="text-2xl font-bold text-md-on-surface tracking-tight">Ledger Exposure</h3>
                                    <p className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mt-1">Verified Remuneration Matrix</p>
                                </div>
                                <div className="overflow-x-auto p-4 custom-scrollbar">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr>
                                                <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Personnel</th>
                                                <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Horizon</th>
                                                <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Settlement</th>
                                                <th className="px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant text-right">Verification</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allSalaries.map((salary, i) => (
                                                <motion.tr
                                                    key={salary._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="group hover:bg-md-surface-variant/10 transition-colors"
                                                >
                                                    <td className="px-8 py-8 m3-card-outlined rounded-r-0 border-r-0 border-md-outline/5 bg-md-surface-container-lowest/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-md-surface-container-high border border-md-outline/10 flex items-center justify-center text-md-on-surface-variant font-bold text-xs">
                                                                #{i + 1}
                                                            </div>
                                                            <span className="text-md-on-surface font-bold text-lg tracking-tight">{salary.user?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 m3-card-outlined rounded-none border-x-0 border-md-outline/5 bg-md-surface-container-lowest/50 text-md-on-surface-variant font-bold text-xs uppercase tracking-widest">{salary.month}</td>
                                                    <td className="px-8 py-8 m3-card-outlined rounded-none border-x-0 border-md-outline/5 bg-md-surface-container-lowest/50">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-[10px] font-bold text-brand-primary/60">INR</span>
                                                            <span className="text-brand-primary font-bold text-xl tracking-tighter">₹{salary.netSalary?.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 m3-card-outlined rounded-l-0 border-l-0 border-md-outline/5 text-right bg-md-surface-container-lowest/50">
                                                        <span className="px-5 py-2 m3-btn-tonal text-[9px] font-bold h-auto inline-block">SECURELY HASHED</span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedAudit && (
                    <AuditModal
                        record={selectedAudit}
                        onClose={() => setSelectedAudit(null)}
                    />
                )}
            </AnimatePresence>

            {/* Ambient M3 Background Accents */}
            <div className="fixed top-1/2 left-1/2 -track-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02)_0%,transparent_70%)] -z-10 pointer-events-none" />
        </div >
    );
};

export default AdminDashboard;
