import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, 
    Calendar, Users, Radio, RefreshCw, Sparkles, Building2, UserX, 
    ArrowUpRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { io } from 'socket.io-client';
import api, { getSocketUrl } from '../api';

const AttendanceManagement = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // All, Present, Late, Absent
    const [dateFilter, setDateFilter] = useState('All'); // All, Today, Yesterday, Week
    const [isLiveConnected, setIsLiveConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    const [highlightId, setHighlightId] = useState(null);
    const socketRef = useRef(null);

    // Live clock ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch initial data & all employees
    const fetchData = async () => {
        try {
            const [reportsRes, usersRes] = await Promise.all([
                api.get('/attendance/reports'),
                api.get('/users')
            ]);

            // Filter out Managing Director / Admin from attendance reports
            if (reportsRes.data && reportsRes.data.success) {
                const cleanReports = reportsRes.data.data.filter(r => 
                    r.user && 
                    r.user.name !== 'Managing Director' && 
                    r.user.role !== 'Admin' && 
                    r.user.role !== 'SuperAdmin' &&
                    r.user.email !== 'md@snenviro.in'
                );
                setAttendanceData(cleanReports);
            }

            // Filter out Managing Director / Admin from employee list
            if (usersRes.data && usersRes.data.success) {
                const cleanUsers = usersRes.data.data.filter(u => 
                    u.name !== 'Managing Director' && 
                    u.role !== 'Admin' && 
                    u.role !== 'SuperAdmin' &&
                    u.email !== 'md@snenviro.in'
                );
                setEmployees(cleanUsers);
            }
        } catch (err) {
            console.error('Failed to fetch attendance data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Real-Time WebSocket Telemetry
    useEffect(() => {
        const socket = io(getSocketUrl());
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsLiveConnected(true);
        });

        socket.on('disconnect', () => {
            setIsLiveConnected(false);
        });

        // When any employee checks in live
        socket.on('attendance_logged', (newLog) => {
            if (!newLog || !newLog.user) return;
            // Ignore Managing Director
            if (newLog.user.name === 'Managing Director' || newLog.user.role === 'Admin' || newLog.user.email === 'md@snenviro.in') {
                return;
            }

            setAttendanceData((prev) => {
                // If already present, update; otherwise prepend
                const exists = prev.findIndex(item => item._id === newLog._id);
                if (exists !== -1) {
                    const copy = [...prev];
                    copy[exists] = newLog;
                    return copy;
                }
                return [newLog, ...prev];
            });

            // Trigger visual glow
            setHighlightId(newLog._id);
            setTimeout(() => setHighlightId(null), 6000);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Format helper for relative time
    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const diffMs = new Date() - new Date(timestamp);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Calculate Today's Real-time Live Counters
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const yesterdayStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }, []);

    const todaysLogs = useMemo(() => {
        return attendanceData.filter(record => {
            if (!record.timestamp) return false;
            return new Date(record.timestamp).toISOString().split('T')[0] === todayStr;
        });
    }, [attendanceData, todayStr]);

    // Reliable check if a record was checked in after 10:30 AM IST cutoff
    const isRecordLate = (record) => {
        if (!record || !record.timestamp) return false;
        if (record.status === 'Late') return true;
        const time = new Date(record.timestamp);
        const istTime = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        return hours > 10 || (hours === 10 && minutes >= 30);
    };

    // Registered employees who have logged in today (unique personnel)
    const checkedInUserIdsToday = useMemo(() => {
        return new Set(todaysLogs.map(l => l.user?._id?.toString() || l.user?.id?.toString() || l.user?.toString()).filter(Boolean));
    }, [todaysLogs]);

    // Total Present Today: Every employee who checked in today (both on-time and late!)
    const presentTodayCount = useMemo(() => {
        return checkedInUserIdsToday.size;
    }, [checkedInUserIdsToday]);

    // Total Late Logins Today: Checked in after 10:30 AM IST
    const lateTodayCount = useMemo(() => {
        const lateUserIds = new Set(
            todaysLogs.filter(l => isRecordLate(l)).map(l => l.user?._id?.toString() || l.user?.id?.toString() || l.user?.toString()).filter(Boolean)
        );
        return lateUserIds.size;
    }, [todaysLogs]);

    // Total On-Time Logins Today: Checked in before 10:30 AM IST
    const onTimeTodayCount = useMemo(() => {
        const onTimeUserIds = new Set(
            todaysLogs.filter(l => !isRecordLate(l)).map(l => l.user?._id?.toString() || l.user?.id?.toString() || l.user?.toString()).filter(Boolean)
        );
        return onTimeUserIds.size;
    }, [todaysLogs]);

    const absentEmployeesToday = useMemo(() => {
        return employees.filter(emp => !checkedInUserIdsToday.has(emp._id?.toString()));
    }, [employees, checkedInUserIdsToday]);

    const absentTodayCount = absentEmployeesToday.length;

    // Filtered data based on search and filters
    const filteredRecords = useMemo(() => {
        return attendanceData.filter(record => {
            const userName = record.user?.name?.toLowerCase() || '';
            const location = record.locationName?.toLowerCase() || '';
            const role = record.user?.role?.toLowerCase() || '';
            const matchesSearch = userName.includes(searchTerm.toLowerCase()) || 
                                  location.includes(searchTerm.toLowerCase()) ||
                                  role.includes(searchTerm.toLowerCase());

            // Status filter
            let matchesStatus = true;
            const isLate = isRecordLate(record);
            const recDate = new Date(record.timestamp).toISOString().split('T')[0];

            if (statusFilter === 'Present') {
                // Employees who checked in today are PRESENT today (both on-time and late)
                matchesStatus = recDate === todayStr;
            } else if (statusFilter === 'Late') {
                matchesStatus = isLate;
            } else if (statusFilter === 'OnTime') {
                matchesStatus = !isLate;
            } else if (statusFilter === 'Absent') {
                matchesStatus = false; // Absent shows dedicated list
            }

            // Date filter (if status is not strictly Present-Today)
            let matchesDate = true;
            if (statusFilter !== 'Present') {
                if (dateFilter === 'Today') {
                    matchesDate = recDate === todayStr;
                } else if (dateFilter === 'Yesterday') {
                    matchesDate = recDate === yesterdayStr;
                } else if (dateFilter === 'Week') {
                    const diffTime = Math.abs(new Date() - new Date(record.timestamp));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    matchesDate = diffDays <= 7;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [attendanceData, searchTerm, statusFilter, dateFilter, todayStr, yesterdayStr]);

    // Group filtered records by date for day-by-day separation
    const groupedByDate = useMemo(() => {
        const groups = {};

        filteredRecords.forEach(record => {
            const dateObj = new Date(record.timestamp);
            const dateKey = dateObj.toISOString().split('T')[0];

            if (!groups[dateKey]) {
                const isToday = dateKey === todayStr;
                const isYesterday = dateKey === yesterdayStr;
                let label = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
                if (isToday) label = `Today — ${dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}`;
                if (isYesterday) label = `Yesterday — ${dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}`;

                groups[dateKey] = {
                    dateKey,
                    isToday,
                    isYesterday,
                    label,
                    records: []
                };
            }
            groups[dateKey].records.push(record);
        });

        // Sort descending by date
        return Object.values(groups).sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey));
    }, [filteredRecords, todayStr, yesterdayStr]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Present': return <CheckCircle2 size={15} className="text-emerald-500" />;
            case 'Late': return <AlertCircle size={15} className="text-amber-500" />;
            case 'Absent': return <XCircle size={15} className="text-rose-500" />;
            default: return <Clock size={15} className="text-slate-400" />;
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Late': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Absent': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Header & Real-Time Connection Bar - Executive Command Center Style */}
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
                {/* Subtle Decorative Ambient Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1.5">
                            <h1 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight">
                                Attendance Management
                            </h1>
                            {isLiveConnected ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Live Telemetry Stream
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                    <RefreshCw size={12} className="animate-spin text-slate-400" />
                                    Connecting Stream...
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 font-medium text-xs md:text-sm">
                            Monitor daily logs, correct anomalies, and track personnel time in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* High-Precision Live Station Clock HUD */}
                        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-slate-900/10 border border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-emerald-400">
                                <Clock size={16} />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Station Clock</p>
                                <p className="text-sm font-mono font-black text-emerald-400 tracking-wider flex items-center gap-1.5 justify-end m-0">
                                    {currentTime}
                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-1.5 py-0.2 rounded">IST</span>
                                </p>
                            </div>
                        </div>

                        {/* Telemetry Refresh Action */}
                        <button 
                            onClick={fetchData} 
                            title="Synchronize Live Telemetry"
                            className="p-3 rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-brand-primary hover:border-brand-primary/60 transition-all duration-300 shadow-sm hover:shadow-md hover:rotate-180 active:scale-95"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Executive Telemetry Filter Suite & Analytics Bar */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] border border-slate-200/80 space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Status Telemetry Pills with Interactive Counters */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* ALL LOGS */}
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`group px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 ${
                                statusFilter === 'All'
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25 ring-2 ring-slate-900/20 scale-[1.02]'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 hover:border-slate-300'
                            }`}
                        >
                            <Users size={15} className={statusFilter === 'All' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'} />
                            <span>ALL</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                                statusFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                            }`}>
                                {attendanceData.length}
                            </span>
                        </button>

                        {/* PRESENT TODAY (All Checked-in Personnel Today) */}
                        <button
                            onClick={() => { setStatusFilter('Present'); setDateFilter('Today'); }}
                            className={`group px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 ${
                                statusFilter === 'Present'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/30 scale-[1.02]'
                                    : 'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 hover:border-emerald-300'
                            }`}
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>PRESENT TODAY</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                                statusFilter === 'Present' ? 'bg-white/25 text-white' : 'bg-emerald-200/80 text-emerald-900'
                            }`}>
                                {presentTodayCount}
                            </span>
                        </button>

                        {/* LATE ESCALATIONS */}
                        <button
                            onClick={() => setStatusFilter('Late')}
                            className={`group px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 ${
                                statusFilter === 'Late'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/30 scale-[1.02]'
                                    : 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 hover:border-amber-300'
                            }`}
                        >
                            <AlertCircle size={15} className={statusFilter === 'Late' ? 'text-white' : 'text-amber-500 group-hover:scale-110 transition-transform'} />
                            <span>LATE</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                                statusFilter === 'Late' ? 'bg-white/25 text-white' : 'bg-amber-200/80 text-amber-900'
                            }`}>
                                {lateTodayCount}
                            </span>
                        </button>

                        {/* ABSENT TODAY */}
                        <button
                            onClick={() => { setStatusFilter('Absent'); setDateFilter('Today'); }}
                            className={`group px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 ${
                                statusFilter === 'Absent'
                                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-500/30 scale-[1.02]'
                                    : 'bg-rose-50/80 hover:bg-rose-100/80 text-rose-800 border border-rose-200/80 hover:border-rose-300'
                            }`}
                        >
                            <XCircle size={15} className={statusFilter === 'Absent' ? 'text-white' : 'text-rose-500 group-hover:scale-110 transition-transform'} />
                            <span>ABSENT TODAY</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                                statusFilter === 'Absent' ? 'bg-white/25 text-white' : 'bg-rose-200/80 text-rose-900'
                            }`}>
                                {absentTodayCount}
                            </span>
                        </button>
                    </div>

                    {/* Precision Date Scope Segmented Control */}
                    <div className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner self-start lg:self-auto">
                        {['All', 'Today', 'Yesterday', 'Week'].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDateFilter(d)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    dateFilter === d 
                                        ? 'bg-white text-slate-900 shadow-md shadow-slate-900/5 font-black scale-102' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                }`}
                            >
                                {d === 'All' ? 'All Dates' : d === 'Week' ? 'Past 7 Days' : d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Telemetry Search Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input 
                            type="text" 
                            placeholder="Search employee name, location/city, or role..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium placeholder:text-slate-400"
                        />
                    </div>
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Attendance Logs Separated Day-by-Day */}
            {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <RefreshCw className="animate-spin text-brand-primary mx-auto mb-3" size={28} />
                    <p className="text-slate-500 font-bold">Synchronizing real-time attendance telemetry...</p>
                </div>
            ) : statusFilter === 'Absent' ? (
                /* Dedicated View for Absent Employees */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                            <XCircle size={18} className="text-rose-500" />
                            <span>Employees Not Logged In Today ({absentEmployeesToday.length})</span>
                        </div>
                        <span className="text-xs font-bold text-rose-600 bg-rose-100/70 px-3 py-1 rounded-full">
                            Target Login Time: Before 10:00 AM IST
                        </span>
                    </div>

                    {absentEmployeesToday.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-bold">
                            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                            <p className="text-slate-700 font-black text-base">Full Personnel Attendance Today!</p>
                            <p className="text-slate-400 text-xs">All registered employees have checked in.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {absentEmployeesToday.map((emp) => (
                                <div key={emp._id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm">
                                            {emp.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                                            <p className="text-[11px] font-bold text-slate-500">{emp.role || 'Personnel'} • {emp.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                                <XCircle size={13} />
                                                Absent (No Login Recorded)
                                            </span>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Status as of {currentTime}</p>
                                        </div>

                                        <button className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-xl transition-all">
                                            Send Reminder
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : groupedByDate.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <p className="text-slate-400 font-bold text-base mb-1">No attendance records match your criteria.</p>
                    <p className="text-slate-400 text-xs">Try selecting a different status pill or clearing the search term.</p>
                </div>
            ) : (
                /* Day-by-Day Grouped Attendance Sections */
                <div className="space-y-6">
                    {groupedByDate.map((group) => (
                        <div key={group.dateKey} className="space-y-3">
                            {/* Prominent Day Divider with Date Badge and Clean Line */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                    group.isToday 
                                        ? 'bg-slate-900 text-white shadow-sm' 
                                        : group.isYesterday 
                                        ? 'bg-slate-700 text-white' 
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                    <Calendar size={14} className={group.isToday ? 'text-emerald-400' : 'text-slate-400'} />
                                    <span>{group.label}</span>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent"></div>
                                <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                                    {group.records.length} {group.records.length === 1 ? 'Login Recorded' : 'Logins Recorded'}
                                </span>
                            </div>

                            {/* Attendance Table for this specific Day */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                                <th className="p-4">Employee</th>
                                                <th className="p-4">Time Logged (Live)</th>
                                                <th className="p-4">Location / Site</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {group.records.map((record, idx) => {
                                                const recordTime = new Date(record.timestamp);
                                                const formattedTime = recordTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                                const isHighlighted = highlightId === record._id;

                                                return (
                                                    <motion.tr 
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        key={record._id} 
                                                        className={`transition-colors ${
                                                            isHighlighted 
                                                                ? 'bg-emerald-50/80 animate-pulse' 
                                                                : 'hover:bg-slate-50/60'
                                                        }`}
                                                    >
                                                        {/* Employee Info */}
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                                                                    {record.user?.name?.charAt(0) || 'U'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 text-sm">{record.user?.name || 'Unknown'}</p>
                                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
                                                                        {record.user?.role || 'Engineer'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Exact Real-Time Login Time */}
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={15} className="text-brand-primary" />
                                                                <p className="font-black text-slate-800 text-sm">{formattedTime}</p>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                                {formatTimeAgo(record.timestamp)}
                                                            </p>
                                                        </td>

                                                        {/* Location / Site */}
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                                <MapPin size={15} className="text-rose-500 shrink-0" />
                                                                <span className="truncate max-w-xs">{record.locationName || 'Unknown Location'}</span>
                                                            </div>
                                                        </td>

                                                        {/* Status Badge */}
                                                        <td className="p-4">
                                                            {(() => {
                                                                const recordDisplayStatus = isRecordLate(record) ? 'Late' : (record.status || 'Present');
                                                                return (
                                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(recordDisplayStatus)}`}>
                                                                        {getStatusIcon(recordDisplayStatus)}
                                                                        <span>{recordDisplayStatus}</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="p-4 text-right">
                                                            <button className="text-[10px] uppercase tracking-widest font-black text-brand-primary hover:text-brand-secondary bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                                                                Audit Log
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
