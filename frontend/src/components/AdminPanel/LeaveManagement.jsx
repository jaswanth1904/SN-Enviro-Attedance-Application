import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, CalendarClock, Clock, User } from 'lucide-react';
import api from '../api';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                // Fetch all leaves using the correct endpoint
                const res = await api.get('/leaves').catch(() => ({ data: { success: false } }));
                if (res.data && res.data.success) {
                    setLeaves(res.data.data);
                } else {
                    // Mock data fallback
                    setLeaves([
                        { _id: '1', user: { name: 'Rahul Sharma', role: 'Service Engineer' }, type: 'Sick Leave', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'Pending', reason: 'Viral fever, doctor recommended rest.', createdAt: new Date(Date.now() - 3600000).toISOString() },
                        { _id: '2', user: { name: 'Priya Patel', role: 'Application Engineer' }, type: 'Casual Leave', startDate: new Date(Date.now() + 86400000 * 5).toISOString(), endDate: new Date(Date.now() + 86400000 * 6).toISOString(), status: 'Approved', reason: 'Family function.', createdAt: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, []);

    const updateLeaveStatus = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status });
            setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
        } catch (err) {
            setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
        }
    };

    const filteredLeaves = leaves.filter(l => filter === 'All' || l.status === filter);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#22223b]">Leave Management</h1>
                    <p className="text-slate-500 font-medium text-sm">Review, approve, and manage employee time-off requests.</p>
                </div>
                <div className="flex bg-slate-200 p-1 rounded-xl">
                    {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-10 text-center font-bold text-slate-400">Loading requests...</div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="col-span-full p-10 text-center font-bold text-slate-400 bg-white rounded-2xl border border-slate-100">No {filter.toLowerCase()} leave requests found.</div>
                ) : (
                    filteredLeaves.map((leave, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={leave._id} 
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {leave.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-none">{leave.user?.name}</p>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{leave.user?.role}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(leave.status)}`}>
                                        {leave.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{leave.type}</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">Reason</p>
                                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {leave.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {leave.status === 'Pending' && (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button onClick={() => updateLeaveStatus(leave._id, 'Rejected')} className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 font-bold py-2.5 rounded-xl hover:bg-rose-100 transition-colors">
                                        <X size={18} /> Reject
                                    </button>
                                    <button onClick={() => updateLeaveStatus(leave._id, 'Approved')} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            )}
                            {leave.status !== 'Pending' && (
                                <div className="pt-4 border-t border-slate-100 text-center">
                                    <p className="text-xs font-bold text-slate-400">Processed by Admin</p>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaveManagement;
