import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle, XCircle, Clock, Plus, Laptop } from 'lucide-react';
import api, { getSocketUrl } from './api';
import { io } from 'socket.io-client';

const LeaveHub = () => {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();

        const socket = io(getSocketUrl());

        socket.on('leave_status_updated', (updatedLeave) => {
            setLeaves(prev => {
                const exists = prev.find(l => l._id === updatedLeave._id);
                if (exists) {
                    return prev.map(l => l._id === updatedLeave._id ? updatedLeave : l);
                }
                return prev;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves/my');
            setLeaves(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch leave history', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
            case 'Rejected': return 'bg-md-error/10 text-md-error border-md-error/20';
            default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={13} className="shrink-0" />;
            case 'Rejected': return <XCircle size={13} className="shrink-0" />;
            default: return <Clock size={13} className="shrink-0" />;
        }
    };

    const stats = React.useMemo(() => {
        const calculateDays = (start, end) => {
            const s = new Date(start);
            const e = new Date(end);
            const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
            return diff > 0 ? diff : 1;
        };

        const approved = leaves.filter(l => l.status === 'Approved');

        let cl_used = 0;
        approved.filter(l => l.leaveType === 'Casual Leave').forEach(l => {
            cl_used += calculateDays(l.startDate, l.endDate);
        });

        let sl_used = 0;
        approved.filter(l => l.leaveType === 'Sick Leave').forEach(l => {
            sl_used += calculateDays(l.startDate, l.endDate);
        });

        const total_used = cl_used + sl_used;

        return [
            {
                label: 'Casual Leave',
                used: cl_used,
                total: 12,
                val: `${cl_used} / 12`,
                color: 'text-brand-primary',
                bg: 'bg-brand-primary'
            },
            {
                label: 'Sick Leave',
                used: sl_used,
                total: 12,
                val: `${sl_used} / 12`,
                color: 'text-blue-600',
                bg: 'bg-blue-500'
            },
            {
                label: 'In Review',
                used: leaves.filter(l => l.status === 'Pending').length,
                total: null,
                val: leaves.filter(l => l.status === 'Pending').length + ' Days',
                color: 'text-amber-500',
                bg: 'bg-amber-500'
            },
            {
                label: 'Balance',
                used: total_used,
                total: 24,
                val: (24 - total_used) + ' Credits',
                color: 'text-md-on-surface',
                bg: 'bg-md-on-surface'
            },
        ];
    }, [leaves]);

    return (
        <div className="space-y-6 sm:space-y-10 animate-fade-in">
            {/* Header + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-md-on-surface tracking-tight">Leave & WFH Hub</h3>
                    <p className="text-md-on-surface-variant font-medium text-xs sm:text-sm mt-1">Operational paused-state requests, remote duty & quota tracking</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/apply-leave')}
                    className="m3-btn-filled w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-bold uppercase tracking-wider h-auto shadow-md shrink-0"
                >
                    <span>APPLY LEAVE / WFH</span> <Plus size={18} />
                </motion.button>
            </div>

            {/* Quota Stats Grid (2-columns on mobile, 4 on desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="m3-card-filled p-4 sm:p-6 bg-white border border-md-outline/5 transition-all hover:bg-slate-100 rounded-2xl sm:rounded-3xl group">
                        <p className="text-[9px] sm:text-[10px] text-md-on-surface-variant font-bold uppercase tracking-wider sm:tracking-widest mb-2 sm:mb-4 opacity-70 truncate">{stat.label}</p>
                        <h4 className={`text-lg sm:text-2xl font-bold mb-2 sm:mb-4 ${stat.color}`}>{stat.val}</h4>

                        {stat.total && (
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stat.used / stat.total) * 100, 100)}%` }}
                                        className={`h-full ${stat.bg} opacity-80`}
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-tighter opacity-50">
                                    <span>Used: {stat.used}</span>
                                    <span>Limit: {stat.total}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Request Manifest */}
            <div className="m3-card-elevated bg-slate-50 border border-md-outline/10 overflow-hidden rounded-2xl sm:rounded-[32px]">
                <div className="p-4 sm:p-6 md:p-10">
                    <div className="flex items-center gap-3 mb-5 sm:mb-8">
                        <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-brand-primary rounded-full" />
                        <h4 className="text-lg sm:text-xl font-bold text-md-on-surface tracking-tight">Request Manifest</h4>
                    </div>

                    <div className="space-y-3.5 sm:space-y-5">
                        {loading ? (
                            <div className="py-16 sm:py-20 text-center animate-pulse text-md-on-surface-variant font-bold uppercase text-[10px] sm:text-[11px] tracking-widest">Scanning HQ records...</div>
                        ) : leaves.length > 0 ? (
                            leaves.map((leave, i) => (
                                <motion.div
                                    key={leave._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 sm:p-6 md:p-8 bg-white/70 rounded-2xl sm:rounded-[24px] border border-md-outline/5 group hover:bg-white transition-all shadow-xs"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-3 sm:mb-6">
                                        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform shrink-0 ${leave.leaveType === 'Work From Home (WFH)' ? 'bg-blue-500/10 text-blue-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                                {leave.leaveType === 'Work From Home (WFH)' ? <Laptop size={20} className="sm:w-6 sm:h-6" /> : <Calendar size={20} className="sm:w-6 sm:h-6" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-md-on-surface font-bold text-base sm:text-lg mb-0.5 truncate">{leave.leaveType}</p>
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-md-on-surface-variant font-bold uppercase tracking-wider sm:tracking-widest flex-wrap">
                                                    <span>{new Date(leave.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                    <span className="opacity-30">—</span>
                                                    <span>{new Date(leave.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest border flex items-center justify-center gap-2 self-start sm:self-center shrink-0 ${getStatusStyle(leave.status)}`}>
                                            {getStatusIcon(leave.status)} {leave.status}
                                        </div>
                                    </div>
                                    <div className="pl-0 md:pl-16 relative">
                                        <div className="absolute left-7 top-0 bottom-0 w-px bg-md-outline/10 hidden md:block" />
                                        <p className="text-xs sm:text-sm text-md-on-surface-variant font-medium leading-relaxed italic pr-2 sm:pr-4">
                                            "{leave.reason}"
                                        </p>
                                        {leave.adminRemarks && (
                                            <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-xs leading-relaxed ${leave.status === 'Approved' ? 'bg-emerald-50/80 border-emerald-200/60 text-emerald-900' : 'bg-rose-50/80 border-rose-200/60 text-rose-900'}`}>
                                                <span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] block opacity-70 mb-1">
                                                    {leave.status === 'Approved' ? 'MD Note / Approval Instruction:' : 'MD Note:'}
                                                </span>
                                                <p className="font-medium italic">"{leave.adminRemarks}"</p>
                                            </div>
                                        )}
                                        {!leave.adminRemarks && leave.rejectionReason && (
                                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-md-error/5 border border-md-error/10 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] text-md-error font-bold uppercase tracking-wide">
                                                <span className="text-md-error/60 block mb-0.5">HQ RESPONSE:</span>
                                                {leave.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-16 sm:py-24 text-center border-2 border-dashed border-md-outline/10 rounded-2xl sm:rounded-[32px] bg-white/30">
                                <AlertCircle size={40} className="mx-auto text-md-on-surface-variant mb-3 sm:mb-4 opacity-20 sm:w-12 sm:h-12" />
                                <p className="text-md-on-surface-variant font-bold uppercase tracking-widest text-[11px] sm:text-xs">Clear log. No requests detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LeaveHub;
