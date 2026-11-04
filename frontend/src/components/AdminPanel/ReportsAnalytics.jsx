import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Calendar, CalendarDays, TrendingUp, Users, Clock, Filter, MapPin, CheckCircle2, UserX, UserCheck, Search, X } from 'lucide-react';
import api, { getBaseApiUrl } from '../api';
import EmptyState from '../common/EmptyState';

const ReportsAnalytics = () => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const LAUNCH_DATE = '2026-10-24'; // System officially commenced tracking on 24 Oct 2026
    
    const [reportType, setReportType] = useState('attendance');
    const [filterMode, setFilterMode] = useState('single'); // 'single', 'range', 'preset'
    const [singleDate, setSingleDate] = useState(todayStr);
    const [startDate, setStartDate] = useState(LAUNCH_DATE);
    const [endDate, setEndDate] = useState(todayStr);
    const [presetRange, setPresetRange] = useState('today');
    const [roleFilter, setRoleFilter] = useState('All');
    const [employeeFilter, setEmployeeFilter] = useState('All');
    const [employees, setEmployees] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    // Search filters & dropdown toggle
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [empSearchQuery, setEmpSearchQuery] = useState('');
    const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
    const empDropdownRef = useRef(null);

    // Live preview records
    const [previewRecords, setPreviewRecords] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Fetch registered employees for filter dropdown
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/users');
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    const cleanStaff = res.data.data.filter(u => 
                        u.role !== 'Admin' && 
                        u.role !== 'SuperAdmin' && 
                        u.name !== 'Managing Director' && 
                        u.email !== 'md@snenviro.in'
                    );
                    setEmployees(cleanStaff);
                }
            } catch (err) {
                console.error('Failed to load employees for report filter', err);
            }
        };
        fetchEmployees();
    }, []);

    // Close employee dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (empDropdownRef.current && !empDropdownRef.current.contains(e.target)) {
                setIsEmpDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered employee options based on role filter
    const availableEmployees = useMemo(() => {
        if (roleFilter === 'All') return employees;
        return employees.filter(emp => emp.role === roleFilter);
    }, [employees, roleFilter]);

    // Fast search filter across 30+ staff for dropdown
    const displayedEmployees = useMemo(() => {
        if (!empSearchQuery.trim()) return availableEmployees;
        const q = empSearchQuery.toLowerCase();
        return availableEmployees.filter(emp => 
            (emp.name && emp.name.toLowerCase().includes(q)) ||
            (emp.role && emp.role.toLowerCase().includes(q)) ||
            (emp.empId && emp.empId.toLowerCase().includes(q)) ||
            (emp.email && emp.email.toLowerCase().includes(q))
        );
    }, [availableEmployees, empSearchQuery]);

    // Format dates to DD-MM-YYYY (eliminates any US/Indian month confusion)
    const formatDateDMY = (dateInput) => {
        if (!dateInput) return 'N/A';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        const parts = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    // Readable label like "04 Nov 2026"
    const formatDateReadable = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(`${dateStr}T00:00:00.000+05:30`);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Fetch matching records whenever filters change
    useEffect(() => {
        const fetchPreview = async () => {
            if (reportType !== 'attendance' && reportType !== 'absent') {
                setPreviewRecords([]);
                return;
            }
            setLoadingPreview(true);
            try {
                if (reportType === 'attendance') {
                    const res = await api.get('/attendance/reports');
                    if (res.data && res.data.success) {
                        let data = res.data.data.filter(r => 
                            r.user && 
                            r.user.role !== 'Admin' && 
                            r.user.role !== 'SuperAdmin' && 
                            r.user.name !== 'Managing Director' && 
                            r.user.email !== 'md@snenviro.in'
                        );

                        // Filter by date
                        let startBoundary, endBoundary;
                        if (filterMode === 'single') {
                            startBoundary = new Date(`${singleDate}T00:00:00.000+05:30`);
                            endBoundary = new Date(`${singleDate}T23:59:59.999+05:30`);
                            data = data.filter(r => {
                                const d = new Date(r.timestamp);
                                return d >= startBoundary && d <= endBoundary;
                            });
                        } else if (filterMode === 'range') {
                            startBoundary = new Date(`${startDate}T00:00:00.000+05:30`);
                            endBoundary = new Date(`${endDate}T23:59:59.999+05:30`);
                            data = data.filter(r => {
                                const d = new Date(r.timestamp);
                                return d >= startBoundary && d <= endBoundary;
                            });
                        } else if (filterMode === 'preset') {
                            const now = new Date();
                            if (presetRange === 'today') {
                                const tStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                                startBoundary = new Date(`${tStr}T00:00:00.000+05:30`);
                                endBoundary = new Date(`${tStr}T23:59:59.999+05:30`);
                                data = data.filter(r => {
                                    const d = new Date(r.timestamp);
                                    return d >= startBoundary && d <= endBoundary;
                                });
                            } else if (presetRange === 'yesterday') {
                                const y = new Date(now);
                                y.setDate(y.getDate() - 1);
                                const yStr = y.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                                startBoundary = new Date(`${yStr}T00:00:00.000+05:30`);
                                endBoundary = new Date(`${yStr}T23:59:59.999+05:30`);
                                data = data.filter(r => {
                                    const d = new Date(r.timestamp);
                                    return d >= startBoundary && d <= endBoundary;
                                });
                            } else if (presetRange === 'this-week') {
                                const w = new Date(now);
                                w.setDate(w.getDate() - 7);
                                const launchBoundary = new Date(`${LAUNCH_DATE}T00:00:00.000+05:30`);
                                const effectiveStart = w < launchBoundary ? launchBoundary : w;
                                data = data.filter(r => new Date(r.timestamp) >= effectiveStart);
                            } else if (presetRange === 'this-month') {
                                const m = new Date(now);
                                m.setMonth(m.getMonth() - 1);
                                const launchBoundary = new Date(`${LAUNCH_DATE}T00:00:00.000+05:30`);
                                const effectiveStart = m < launchBoundary ? launchBoundary : m;
                                data = data.filter(r => new Date(r.timestamp) >= effectiveStart);
                            }
                        }

                        // Role filter
                        if (roleFilter !== 'All') {
                            data = data.filter(r => r.user?.role === roleFilter);
                        }

                        // Employee filter
                        if (employeeFilter !== 'All') {
                            data = data.filter(r => 
                                r.user?.name === employeeFilter || 
                                r.user?._id?.toString() === employeeFilter
                            );
                        }

                        setPreviewRecords(data);
                    }
                } else if (reportType === 'absent') {
                    let params = '';
                    if (filterMode === 'single') {
                        params = `startDate=${singleDate}&endDate=${singleDate}`;
                    } else if (filterMode === 'range') {
                        params = `startDate=${startDate}&endDate=${endDate}`;
                    } else {
                        params = `range=${presetRange}`;
                    }
                    if (roleFilter !== 'All') {
                        params += `&role=${encodeURIComponent(roleFilter)}`;
                    }
                    if (employeeFilter !== 'All') {
                        params += `&employee=${encodeURIComponent(employeeFilter)}`;
                    }

                    const res = await api.get(`/admin/absent-report?${params}`);
                    if (res.data && res.data.success) {
                        setPreviewRecords(res.data.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load preview records', err);
            } finally {
                setLoadingPreview(false);
            }
        };

        fetchPreview();
    }, [reportType, filterMode, singleDate, startDate, endDate, presetRange, roleFilter, employeeFilter]);

    // Compute stats for individual employee movement banner
    const employeeMovementStats = useMemo(() => {
        if (employeeFilter === 'All' || reportType !== 'attendance' || previewRecords.length === 0) {
            return null;
        }

        const distinctDays = new Set(previewRecords.map(r => new Date(r.timestamp).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }))).size;
        const locations = Array.from(new Set(previewRecords.map(r => r.locationName).filter(Boolean)));
        
        let onTimeCount = 0;
        let lateCount = 0;
        previewRecords.forEach(r => {
            const d = new Date(r.timestamp);
            const ist = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const isLate = r.status === 'Late' || ist.getHours() > 10 || (ist.getHours() === 10 && ist.getMinutes() >= 30);
            if (isLate) lateCount++;
            else onTimeCount++;
        });

        const selectedEmpObj = employees.find(e => e.name === employeeFilter);

        return {
            name: employeeFilter,
            role: selectedEmpObj?.role || previewRecords[0]?.user?.role || 'Staff',
            empId: selectedEmpObj?.empId || previewRecords[0]?.user?.empId || 'N/A',
            totalCheckIns: previewRecords.length,
            distinctDays,
            locations,
            onTimeCount,
            lateCount
        };
    }, [employeeFilter, reportType, previewRecords, employees]);

    // Live search filter across preview table records
    const filteredPreviewRecords = useMemo(() => {
        if (!tableSearchTerm.trim()) return previewRecords;
        const term = tableSearchTerm.toLowerCase();
        return previewRecords.filter(r => {
            const name = (r.user?.name || '').toLowerCase();
            const role = (r.user?.role || '').toLowerCase();
            const empId = (r.user?.empId || '').toLowerCase();
            const location = (r.locationName || '').toLowerCase();
            const status = (r.status || '').toLowerCase();
            const leave = (r.leaveDetails || '').toLowerCase();
            return name.includes(term) || role.includes(term) || empId.includes(term) || location.includes(term) || status.includes(term) || leave.includes(term);
        });
    }, [previewRecords, tableSearchTerm]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem('token');
            let queryParams = `type=${reportType}`;

            if (filterMode === 'single') {
                queryParams += `&startDate=${singleDate}&endDate=${singleDate}`;
            } else if (filterMode === 'range') {
                queryParams += `&startDate=${startDate}&endDate=${endDate}`;
            } else {
                queryParams += `&range=${presetRange}`;
            }

            if (roleFilter !== 'All') {
                queryParams += `&role=${encodeURIComponent(roleFilter)}`;
            }

            if (employeeFilter !== 'All') {
                queryParams += `&employee=${encodeURIComponent(employeeFilter)}`;
            }

            const url = `${getBaseApiUrl()}/admin/export?${queryParams}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            const dateLabel = filterMode === 'single' ? singleDate : (filterMode === 'range' ? `${startDate}_to_${endDate}` : presetRange);
            const empSuffix = employeeFilter !== 'All' ? `_${employeeFilter.replace(/\s+/g, '_')}` : '';
            a.download = `SN_Enviro_${reportType.toUpperCase()}${empSuffix}_${dateLabel}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error', error);
            alert('Failed to generate export file. Please check permissions.');
        } finally {
            setIsExporting(false);
        }
    };

    const isDateBeforeLaunch = (filterMode === 'single' && singleDate < LAUNCH_DATE) ||
                               (filterMode === 'range' && endDate < LAUNCH_DATE);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-black text-[#22223b]">Reports & Analytics</h1>
                <p className="text-slate-500 font-medium text-sm">Select dates, filter by employee or role, preview real-time telemetry, and export high-accuracy attendance sheets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Export Control Panel */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1 h-fit"
                >
                    <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <FileSpreadsheet size={18} className="text-brand-primary" /> Export Parameters
                    </h3>

                    <div className="space-y-4">
                        {/* Report Type */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Report Type</label>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                            >
                                <option value="attendance">Detailed Attendance (With Roles & Sites)</option>
                                <option value="absent">Daily Absenteeism (Absent List)</option>
                                <option value="leaves">Leave History</option>
                                <option value="employees">Employee Directory</option>
                            </select>
                        </div>

                        {/* Date Selection Mode Tabs */}
                        {(reportType === 'attendance' || reportType === 'absent') && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date Filter Mode</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                                    <button 
                                        type="button"
                                        onClick={() => setFilterMode('single')}
                                        className={`py-1.5 rounded-lg transition-colors ${filterMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Specific Day
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFilterMode('range')}
                                        className={`py-1.5 rounded-lg transition-colors ${filterMode === 'range' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Date Range
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFilterMode('preset')}
                                        className={`py-1.5 rounded-lg transition-colors ${filterMode === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Quick Range
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Single Date Picker */}
                        {filterMode === 'single' && (reportType === 'attendance' || reportType === 'absent') && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Date</label>
                                <input 
                                    type="date"
                                    min={LAUNCH_DATE}
                                    max={todayStr}
                                    value={singleDate}
                                    onChange={(e) => setSingleDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Operational window: 24-10-2026 to Today.
                                </p>
                            </div>
                        )}

                        {/* Date Range Pickers */}
                        {filterMode === 'range' && (reportType === 'attendance' || reportType === 'absent') && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">From Date</label>
                                    <input 
                                        type="date"
                                        min={LAUNCH_DATE}
                                        max={todayStr}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">To Date</label>
                                    <input 
                                        type="date"
                                        min={startDate || LAUNCH_DATE}
                                        max={todayStr}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Commenced 24-10-2026 (prior dates disabled).
                                </p>
                            </div>
                        )}

                        {/* Preset Range Selector */}
                        {filterMode === 'preset' && (reportType === 'attendance' || reportType === 'absent') && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preset Duration</label>
                                <select 
                                    value={presetRange}
                                    onChange={(e) => setPresetRange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                                >
                                    <option value="today">Today (Live)</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="this-week">Past 7 Days</option>
                                    <option value="this-month">This Month (Active Period)</option>
                                </select>
                            </div>
                        )}

                        {/* Role Filter */}
                        {(reportType === 'attendance' || reportType === 'absent') && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Filter by Role</label>
                                <select 
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setEmployeeFilter('All'); // reset employee filter when role changes
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Field Application Engineer">Field Application Engineer</option>
                                    <option value="Software Developer">Software Developer</option>
                                    <option value="Embedded Engineer">Embedded Engineer</option>
                                    <option value="Application Regional Manager">Application Regional Manager</option>
                                    <option value="Service Engineer">Service Engineer</option>
                                    <option value="Office Employee">Office Employee</option>
                                </select>
                            </div>
                        )}

                        {/* Employee Filter with Interactive Autocomplete Dropdown */}
                        {(reportType === 'attendance' || reportType === 'absent') && (
                            <div className="relative" ref={empDropdownRef}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter by Employee</label>
                                    {(employeeFilter !== 'All' || empSearchQuery) && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setEmployeeFilter('All'); setEmpSearchQuery(''); setIsEmpDropdownOpen(false); }}
                                            className="text-[10px] text-brand-primary hover:underline font-bold"
                                        >
                                            Reset to All
                                        </button>
                                    )}
                                </div>

                                {/* Search Input with Instant Dropdown on focus/type */}
                                <div className="relative">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input 
                                        type="text"
                                        value={empSearchQuery}
                                        onFocus={() => setIsEmpDropdownOpen(true)}
                                        onChange={(e) => {
                                            setEmpSearchQuery(e.target.value);
                                            setIsEmpDropdownOpen(true);
                                        }}
                                        placeholder="Search employee name (e.g. Jaswanth)..."
                                        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary bg-slate-50 focus:bg-white transition-all shadow-2xs"
                                    />
                                    {empSearchQuery && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setEmpSearchQuery('');
                                                setEmployeeFilter('All');
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* Interactive Dropdown List showing all matching employee names */}
                                {isEmpDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {/* Option to show all employees */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEmployeeFilter('All');
                                                setEmpSearchQuery('');
                                                setIsEmpDropdownOpen(false);
                                            }}
                                            className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${employeeFilter === 'All' ? 'bg-blue-50/70 font-bold text-brand-primary' : 'text-slate-700'}`}
                                        >
                                            <span className="font-semibold">👥 All Employees ({availableEmployees.length} Total)</span>
                                            {employeeFilter === 'All' && <CheckCircle2 size={14} className="text-brand-primary shrink-0" />}
                                        </button>

                                        {displayedEmployees.length === 0 ? (
                                            <div className="p-3.5 text-center text-xs text-slate-400 font-medium">
                                                No employee matches "{empSearchQuery}"
                                            </div>
                                        ) : (
                                            displayedEmployees.map(emp => {
                                                const isSelected = employeeFilter === emp.name;
                                                return (
                                                    <button
                                                        key={emp._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setEmployeeFilter(emp.name);
                                                            setEmpSearchQuery(emp.name);
                                                            setIsEmpDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 text-xs hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/80 font-bold text-brand-primary' : 'text-slate-700'}`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 truncate leading-tight">{emp.name}</p>
                                                                <p className="text-[10px] text-slate-400 truncate">{emp.role || 'Staff'}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                                            {emp.role?.split(' ')[0] || 'Staff'}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                )}

                                {/* Active Filter Pill */}
                                {employeeFilter !== 'All' && (
                                    <div className="mt-2 p-2 bg-blue-50/80 rounded-xl border border-blue-200/60 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[10px] uppercase font-black text-blue-700 tracking-wider">Filtered:</span>
                                            <span className="font-bold text-blue-900 truncate">{employeeFilter}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEmployeeFilter('All');
                                                setEmpSearchQuery('');
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-[11px] font-bold underline shrink-0 ml-2"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Export Button */}
                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-secondary transition-colors shadow-sm shadow-brand-primary/20 mt-4 disabled:opacity-50 text-xs uppercase tracking-wider"
                        >
                            {isExporting ? 'Generating Report...' : <><Download size={16} /> Download Excel / CSV</>}
                        </button>
                    </div>
                </motion.div>

                {/* Live Preview Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
                            <div className="flex items-center gap-2">
                                {reportType === 'absent' ? (
                                    <UserX size={16} className="text-rose-500" />
                                ) : (
                                    <CalendarDays size={16} className="text-brand-primary" />
                                )}
                                <h3 className="font-bold text-slate-800 text-sm">
                                    {reportType === 'absent' ? 'Absenteeism: ' : (reportType === 'attendance' ? 'Attendance: ' : `${reportType.toUpperCase()}: `)}
                                    <span className="font-semibold text-slate-600">
                                        {filterMode === 'single' ? formatDateReadable(singleDate) : (filterMode === 'range' ? `${formatDateReadable(startDate)} to ${formatDateReadable(endDate)}` : presetRange.toUpperCase())}
                                    </span>
                                </h3>
                            </div>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-2xs ${
                                reportType === 'absent' 
                                    ? (filteredPreviewRecords.length === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200')
                                    : 'text-slate-600 bg-white border-slate-200'
                            }`}>
                                {filteredPreviewRecords.length} {tableSearchTerm ? `of ${previewRecords.length}` : ''} {reportType === 'absent' ? 'Absent' : 'Logs'}
                            </span>
                        </div>

                        {/* Live Table Search Bar */}
                        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text"
                                    value={tableSearchTerm}
                                    onChange={(e) => setTableSearchTerm(e.target.value)}
                                    placeholder="Search records by employee name, role, plant site / location..."
                                    className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary bg-slate-50/70 focus:bg-white transition-all"
                                />
                                {tableSearchTerm && (
                                    <button 
                                        type="button"
                                        onClick={() => setTableSearchTerm('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Individual Employee Movement Banner (When an employee is selected) — Clean Light Theme */}
                        {employeeMovementStats && (
                            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-sm shadow-sm shadow-brand-primary/20 shrink-0">
                                            {employeeMovementStats.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-black text-base text-slate-900 leading-tight">
                                                    {employeeMovementStats.name}
                                                </span>
                                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0 inline-flex items-center">
                                                    {employeeMovementStats.role}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">ID: {employeeMovementStats.empId} • Individual Movement Track</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                            {employeeMovementStats.distinctDays} Logged Days
                                        </span>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                                            {employeeMovementStats.lateCount} Late / {employeeMovementStats.onTimeCount} On-Time
                                        </span>
                                    </div>
                                </div>

                                {/* Plant sites / Locations Visited */}
                                <div className="pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                        <MapPin size={12} className="text-rose-500" /> Plant Sites Visited:
                                    </span>
                                    {employeeMovementStats.locations.length === 0 ? (
                                        <span className="text-slate-400 text-[11px]">No GPS plant location logged</span>
                                    ) : (
                                        employeeMovementStats.locations.slice(0, 4).map((loc, i) => (
                                            <span key={i} className="px-2.5 py-0.5 rounded-md bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-2xs">
                                                {loc.split(',')[0]}
                                            </span>
                                        ))
                                    )}
                                    {employeeMovementStats.locations.length > 4 && (
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            +{employeeMovementStats.locations.length - 4} more sites
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto max-h-[460px]">
                            {loadingPreview ? (
                                <div className="p-12 text-center text-slate-400 font-bold text-xs">
                                    Loading preview records...
                                </div>
                            ) : filteredPreviewRecords.length === 0 ? (
                                <div className="p-8">
                                    <EmptyState 
                                        title={
                                            tableSearchTerm
                                                ? "No Matching Records Found"
                                                : (reportType === 'absent'
                                                    ? "100% Attendance Recorded!"
                                                    : (isDateBeforeLaunch ? "No Records Available (Pre-Launch)" : "No attendance records found"))
                                        } 
                                        description={
                                            tableSearchTerm
                                                ? `No telemetry records match your search query "${tableSearchTerm}". Try searching for another employee name or plant site.`
                                                : (reportType === 'absent'
                                                    ? (employeeFilter !== 'All' 
                                                        ? `${employeeFilter} was NOT absent during the selected dates. Regular attendance logged!` 
                                                        : "Zero employees absent for the selected period. All scheduled personnel checked in!")
                                                    : (isDateBeforeLaunch 
                                                        ? `The SN Enviro Attendance Portal commenced tracking on 24 October 2026. No records exist prior to this date.` 
                                                        : `No employee check-ins match the selected date or employee filter criteria.`))
                                        }
                                    />
                                    {tableSearchTerm && (
                                        <div className="mt-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setTableSearchTerm('')}
                                                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                            >
                                                Clear Search Filter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : reportType === 'absent' ? (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                            <th className="p-3">Employee</th>
                                            <th className="p-3">Role</th>
                                            <th className="p-3">Date (DD-MM-YYYY)</th>
                                            <th className="p-3">Attendance Status</th>
                                            <th className="p-3">Leave Details</th>
                                            <th className="p-3">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPreviewRecords.slice(0, 50).map((record) => {
                                            const isLeave = record.status === 'On Approved Leave';
                                            return (
                                                <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="p-3">
                                                        <p className="font-bold text-slate-900">{record.user?.name || 'N/A'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">ID: {record.user?.empId || 'N/A'}</p>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100 whitespace-nowrap">
                                                            {record.user?.role || 'Engineer'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                                                        {record.date}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                                                            isLeave 
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-slate-600 font-medium max-w-xs truncate">
                                                        {record.leaveDetails}
                                                    </td>
                                                    <td className="p-3 text-[11px]">
                                                        <p className="font-medium text-slate-700 truncate max-w-[140px]">{record.user?.email || 'N/A'}</p>
                                                        <p className="text-[10px] text-slate-400">{record.user?.phoneNumber || ''}</p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                            <th className="p-3">Employee</th>
                                            <th className="p-3">Role</th>
                                            <th className="p-3">Date (DD-MM-YYYY)</th>
                                            <th className="p-3">Login Time (IST)</th>
                                            <th className="p-3">Location / Plant Site</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPreviewRecords.slice(0, 50).map((record) => {
                                            const d = new Date(record.timestamp);
                                            const dateParts = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
                                            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                                            const loginTime = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                            
                                            const istTime = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
                                            const isLate = record.status === 'Late' || istTime.getHours() > 10 || (istTime.getHours() === 10 && istTime.getMinutes() >= 30);

                                            return (
                                                <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="p-3">
                                                        <p className="font-bold text-slate-900">{record.user?.name || 'N/A'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">ID: {record.user?.empId || 'N/A'}</p>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100 whitespace-nowrap">
                                                            {record.user?.role || 'Engineer'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                                                        {formattedDate}
                                                    </td>
                                                    <td className="p-3 font-black text-brand-primary whitespace-nowrap">
                                                        {loginTime}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                            <MapPin size={13} className="text-rose-500 shrink-0" />
                                                            <span className="truncate max-w-xs">{record.locationName || 'Unknown Location'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        {isLate ? (
                                                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                                                Late (After 10:30 AM)
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Present (On-Time)
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportsAnalytics;
