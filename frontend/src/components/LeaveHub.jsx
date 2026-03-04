import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import api from './api';

const LeaveHub = () => {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
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
            case 'Approved': return <CheckCircle size={14} />;
            case 'Rejected': return <XCircle size={14} />;
            default: return <Clock size={14} />;
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
                label: 'Casual Leave Quota',
                used: cl_used,
                total: 12,
                val: `${cl_used} used out of 12`,
                color: 'text-brand-primary',
                bg: 'bg-brand-primary'
            },
            {
                label: 'Sick Leave Quota',
                used: sl_used,
                total: 12,
                val: `${sl_used} used out of 12`,
                color: 'text-md-secondary',
                bg: 'bg-md-secondary'
            },
            {
                label: 'In Review Leaves',
                used: leaves.filter(l => l.status === 'Pending').length,
                total: null,
                val: leaves.filter(l => l.status === 'Pending').length + ' Days',
                color: 'text-amber-500',
                bg: 'bg-amber-500'
            },
            {
                label: 'Combined Balance',
                used: total_used,
                total: 24,
                val: (24 - total_used) + ' Credits',
                color: 'text-md-on-surface',
                bg: 'bg-md-on-surface'
            },
        ];
    }, [leaves]);

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-bold text-md-on-surface tracking-tight">Leave Management</h3>
                    <p className="text-md-on-surface-variant font-medium text-sm mt-1">Operational paused-state requests & quota tracking</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/apply-leave')}
                    className="m3-btn-filled px-8 py-4 flex items-center justify-center gap-3 h-auto"
                >
                    REQUEST FOR LEAVE <Plus size={20} />
                </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="m3-card-filled p-6 bg-md-surface-container border border-md-outline/5 transition-all hover:bg-md-surface-container-high group">
                        <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-4 opacity-60">{stat.label}</p>
                        <h4 className={`text-xl font-bold mb-4 ${stat.color}`}>{stat.val}</h4>

                        {stat.total && (
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-md-surface-container-highest rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stat.used / stat.total) * 100, 100)}%` }}
                                        className={`h-full ${stat.bg} opacity-80`}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter opacity-40">
                                    <span>Used: {stat.used}</span>
                                    <span>Limit: {stat.total}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="m3-card-elevated bg-md-surface-container-low border border-md-outline/10 overflow-hidden">
                <div className="p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-brand-primary rounded-full" />
                        <h4 className="text-xl font-bold text-md-on-surface tracking-tight">Request Manifest</h4>
                    </div>

                    <div className="space-y-5">
                        {loading ? (
                            <div className="py-20 text-center animate-pulse text-md-on-surface-variant font-bold uppercase text-[11px] tracking-widest">Scanning HQ records...</div>
                        ) : leaves.length > 0 ? (
                            leaves.map((leave, i) => (
                                <motion.div
                                    key={leave._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-6 md:p-8 bg-md-surface-container-lowest/50 rounded-[24px] border border-md-outline/5 group hover:bg-md-surface-container transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-md-on-surface font-bold text-lg mb-0.5">{leave.leaveType}</p>
                                                <div className="flex items-center gap-2 text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest">
                                                    <span>{new Date(leave.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                    <span className="opacity-30">—</span>
                                                    <span>{new Date(leave.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center justify-center gap-2.5 w-fit ${getStatusStyle(leave.status)}`}>
                                            {getStatusIcon(leave.status)} {leave.status}
                                        </div>
                                    </div>
                                    <div className="pl-0 md:pl-16 relative">
                                        <div className="absolute left-7 top-0 bottom-0 w-px bg-md-outline/10 hidden md:block" />
                                        <p className="text-sm text-md-on-surface-variant font-medium leading-relaxed italic pr-4">
                                            "{leave.reason}"
                                        </p>
                                        {leave.rejectionReason && (
                                            <div className="mt-5 p-5 bg-md-error/5 border border-md-error/10 rounded-2xl text-[11px] text-md-error font-bold uppercase tracking-wide">
                                                <span className="text-md-error/60 block mb-1">HQ RESPONSE:</span>
                                                {leave.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-24 text-center border-2 border-dashed border-md-outline/10 rounded-[32px] bg-md-surface-container-lowest/30">
                                <AlertCircle size={48} className="mx-auto text-md-on-surface-variant mb-4 opacity-10" />
                                <p className="text-md-on-surface-variant font-bold uppercase tracking-widest text-xs">Clear log. No requests detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LeaveHub;
