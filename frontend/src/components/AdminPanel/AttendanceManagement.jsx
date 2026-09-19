import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../api';

const AttendanceManagement = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/attendance/reports');
                if (res.data && res.data.success) {
                    setAttendanceData(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
                
                // Fallback to mock data for presentation
                const now = new Date();
                setAttendanceData([
                    { _id: '1', user: { name: 'Rahul Sharma', role: 'Service Engineer' }, timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), locationName: 'Mumbai Site A', status: 'Present' },
                    { _id: '2', user: { name: 'Priya Patel', role: 'Application Engineer' }, timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), locationName: 'Ahmedabad Plant', status: 'Late' },
                    { _id: '3', user: { name: 'Sanjay Kumar', role: 'Office Staff' }, timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), locationName: 'HQ', status: 'Absent' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const filteredData = attendanceData.filter(record => {
        const matchesSearch = record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              record.locationName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Present': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'Late': return <AlertCircle size={16} className="text-amber-500" />;
            case 'Absent': return <XCircle size={16} className="text-rose-500" />;
            default: return <Clock size={16} className="text-slate-400" />;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#22223b]">Attendance Management</h1>
                    <p className="text-slate-500 font-medium text-sm">Monitor daily logs, correct anomalies, and track time.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search employee or location..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary cursor-pointer bg-white"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400">
                                <th className="p-4 font-bold">Employee</th>
                                <th className="p-4 font-bold">Time Logged</th>
                                <th className="p-4 font-bold">Location / Site</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Correction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-bold">Loading records...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-bold">No attendance records found.</td></tr>
                            ) : (
                                filteredData.map((record, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={record._id} 
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {record.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{record.user?.name}</p>
                                                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{record.user?.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-700 text-sm">{new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                                                {new Date(record.timestamp).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <MapPin size={14} className="text-brand-primary" />
                                                {record.locationName || 'Unknown Location'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(record.status || 'Present')}`}>
                                                {getStatusIcon(record.status || 'Present')}
                                                {record.status || 'Present'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-[10px] uppercase tracking-widest font-bold text-brand-primary hover:text-brand-secondary bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                                                Edit Log
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceManagement;
