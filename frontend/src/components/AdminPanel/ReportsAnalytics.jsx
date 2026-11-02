import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Calendar, CalendarDays, TrendingUp, Users, Clock, Filter, MapPin, CheckCircle2, UserX } from 'lucide-react';
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
    const [isExporting, setIsExporting] = useState(false);

    // Live preview records
    const [previewRecords, setPreviewRecords] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Fetch matching records whenever filter changes
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
                        let data = res.data.data.filter(r => r.user && r.user.role !== 'Admin');

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
    }, [reportType, filterMode, singleDate, startDate, endDate, presetRange, roleFilter]);

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
            a.download = `SN_Enviro_${reportType.toUpperCase()}_${dateLabel}.csv`;
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
                <p className="text-slate-500 font-medium text-sm">Select dates, preview records, and export high-accuracy attendance sheets.</p>
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
                                <option value="attendance">Detailed Attendance (With Roles)</option>
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
                                    Operational window: 24 Oct 2026 to Today.
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
                                    System active since 24 Oct 2026 (prior dates disabled).
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
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary font-bold text-slate-700 bg-slate-50 text-xs"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Field Application Engineer">Field Application Engineer</option>
                                    <option value="Software Developer">Software Developer</option>
                                    <option value="Embedded Engineer">Embedded Engineer</option>
                                    <option value="Application Regional Manager">Application Regional Manager</option>
                                </select>
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
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                {reportType === 'absent' ? (
                                    <UserX size={16} className="text-rose-500" />
                                ) : (
                                    <CalendarDays size={16} className="text-brand-primary" />
                                )}
                                <h3 className="font-bold text-slate-800 text-sm">
                                    {reportType === 'absent' ? 'Absenteeism: ' : (reportType === 'attendance' ? 'Attendance: ' : `${reportType.toUpperCase()}: `)}
                                    {filterMode === 'single' ? singleDate : (filterMode === 'range' ? `${startDate} to ${endDate}` : presetRange.toUpperCase())}
                                </h3>
                            </div>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-2xs ${
                                reportType === 'absent' 
                                    ? (previewRecords.length === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200')
                                    : 'text-slate-500 bg-white border-slate-200'
                            }`}>
                                {previewRecords.length} {reportType === 'absent' ? 'Absent' : 'Records'}
                            </span>
                        </div>

                        <div className="overflow-x-auto max-h-[460px]">
                            {loadingPreview ? (
                                <div className="p-12 text-center text-slate-400 font-bold text-xs">
                                    Loading preview...
                                </div>
                            ) : previewRecords.length === 0 ? (
                                <div className="p-8">
                                    <EmptyState 
                                        title={
                                            reportType === 'absent'
                                                ? "100% Attendance Recorded!"
                                                : (isDateBeforeLaunch ? "No Records Available (Pre-Launch)" : "No attendance records")
                                        } 
                                        description={
                                            reportType === 'absent'
                                                ? "Zero employees absent for the selected period. All scheduled personnel checked in!"
                                                : (isDateBeforeLaunch 
                                                    ? `The SN Enviro Attendance Portal commenced tracking on 24 October 2026. No attendance records exist prior to this date.` 
                                                    : `No employee check-ins found for the selected date criteria.`)
                                        }
                                    />
                                </div>
                            ) : reportType === 'absent' ? (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                            <th className="p-3">Employee</th>
                                            <th className="p-3">Role</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Attendance Status</th>
                                            <th className="p-3">Leave Details</th>
                                            <th className="p-3">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {previewRecords.slice(0, 50).map((record) => {
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
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Login Time (IST)</th>
                                            <th className="p-3">Logout Time (IST)</th>
                                            <th className="p-3">Location / Site</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {previewRecords.slice(0, 50).map((record) => {
                                            const d = new Date(record.timestamp);
                                            const dateParts = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
                                            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                                            const loginTime = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                            const logoutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'Active Shift';

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
                                                    <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                                                        {logoutTime}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                            <MapPin size={13} className="text-rose-500 shrink-0" />
                                                            <span className="truncate max-w-xs">{record.locationName || 'Unknown Location'}</span>
                                                        </div>
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
