import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, CalendarDays, TrendingUp, Users, Clock } from 'lucide-react';
import api from '../api';

const ReportsAnalytics = () => {
    const [reportType, setReportType] = useState('attendance');
    const [dateRange, setDateRange] = useState('this-month');
    const [isExporting, setIsExporting] = useState(false);
    
    // State for live analytics preview
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        attendancePercentage: 0,
        lateLogins: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const res = await api.get('/admin/overview');
                if (res.data && res.data.success) {
                    setStats(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch live stats", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchLiveStats();
        // Set up real-time polling every 30 seconds for the dashboard preview
        const interval = setInterval(fetchLiveStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/admin/export?type=${reportType}&range=${dateRange}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error', error);
            alert('Failed to generate export');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-black text-[#22223b]">Reports & Analytics</h1>
                <p className="text-slate-500 font-medium text-sm">Generate compliance reports and export live data to CSV for external processing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Export Control Panel */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:col-span-1 h-fit"
                >
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <FileSpreadsheet size={18} className="text-brand-primary" /> Export Data
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Report Type</label>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary transition-all font-bold text-slate-700 bg-slate-50"
                            >
                                <option value="attendance">Detailed Attendance</option>
                                <option value="leaves">Leave History</option>
                                <option value="employees">Employee Directory</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Time Period</label>
                            <select 
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary transition-all font-bold text-slate-700 bg-slate-50"
                            >
                                <option value="today">Today (Live)</option>
                                <option value="this-week">Past 7 Days</option>
                                <option value="this-month">This Month</option>
                                <option value="custom">All Time</option>
                            </select>
                        </div>

                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-secondary transition-colors shadow-sm shadow-brand-primary/20 mt-4 disabled:opacity-50"
                        >
                            {isExporting ? 'Generating CSV...' : <><Download size={18} /> Download CSV</>}
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard Preview */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-brand-primary/5 rounded-2xl border border-brand-primary/10 p-6 flex items-start gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm text-brand-primary">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-brand-primary mb-1">Live Database Connected</h3>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                The export engine is connected directly to the live MongoDB database. Generating a CSV report will instantly compile and format all GPS telemetry, attendance statuses, and historical records up to the current second.
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10"></div>}
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Total Live Attendance</p>
                            <p className="text-3xl font-black text-slate-800">{stats.presentToday} / {stats.totalEmployees}</p>
                            <p className="text-[10px] text-emerald-500 font-bold mt-2">Active records in database today</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10"></div>}
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14}/> Late Logins Detected</p>
                            <p className="text-3xl font-black text-slate-800">{stats.lateLogins}</p>
                            <p className="text-[10px] text-rose-500 font-bold mt-2">Will be flagged in CSV export</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportsAnalytics;
