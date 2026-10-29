import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, CheckCircle2, Clock, Search, Filter, 
    RefreshCw, User, Mail, MessageSquare, Check, Sparkles, 
    ShieldCheck, Calendar, ArrowUpRight
} from 'lucide-react';
import api from '../api';

const AbsenceExplanations = () => {
    const [explanations, setExplanations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchExplanations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/escalations');
            if (res.data && res.data.success && Array.isArray(res.data.data)) {
                setExplanations(res.data.data);
            } else {
                setExplanations([]);
            }
        } catch (err) {
            console.error('Failed to fetch explanations:', err);
            setExplanations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExplanations();
    }, []);

    const handleAcknowledge = async (id, currentNotes = '') => {
        try {
            setActionLoadingId(id);
            const res = await api.put(`/escalations/${id}/review`, {
                status: 'Reviewed',
                adminNotes: currentNotes || 'Acknowledged and noted by Managing Director.'
            });

            if (res.data && res.data.success) {
                setExplanations(prev => prev.map(item => item._id === id ? {
                    ...item,
                    status: 'Reviewed',
                    adminNotes: currentNotes || 'Acknowledged and noted by Managing Director.',
                    reviewedAt: new Date()
                } : item));

                setSuccessMsg('Explanation acknowledged successfully.');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        } catch (err) {
            console.error('Failed to acknowledge explanation:', err);
            alert(err.response?.data?.error || 'Failed to acknowledge explanation.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filtered data
    const filteredExplanations = useMemo(() => {
        return explanations.filter(item => {
            const empName = item.user?.name || '';
            const empEmail = item.user?.email || '';
            const empRole = item.user?.role || '';
            const reason = item.reason || '';

            const matchesSearch = 
                empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                empEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                empRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reason.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter === 'All') return true;
            if (statusFilter === 'Needs Review') return item.status === 'Submitted' || item.status === 'Pending Review';
            return item.status === statusFilter;
        });
    }, [explanations, searchTerm, statusFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = explanations.length;
        const needsReview = explanations.filter(e => e.status === 'Submitted' || e.status === 'Pending Review').length;
        const reviewed = explanations.filter(e => e.status === 'Reviewed' || e.status === 'Acknowledged').length;
        return { total, needsReview, reviewed };
    }, [explanations]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                            <AlertTriangle size={12} /> Escalation Logs
                        </span>
                        <span className="text-xs font-bold text-slate-400">• 10:30 AM Daily Automation</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#22223b]">Late & Absence Explanations</h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
                        Review reasons and justifications submitted by personnel for delayed check-ins or skipped attendance.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchExplanations}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Success Alert Banner */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
                    >
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Executive Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Escalations</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{stats.total}</h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">Logged tickets</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <MessageSquare size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Needs Review</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-amber-600">{stats.needsReview}</h3>
                        <p className="text-[11px] font-medium text-amber-600/80 mt-1">Awaiting MD review</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Clock size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reviewed & Noted</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.reviewed}</h3>
                        <p className="text-[11px] font-medium text-emerald-600/80 mt-1">Acknowledged by MD</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ShieldCheck size={22} />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search employee, email, role, or keywords..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-primary transition-all bg-slate-50/50"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Needs Review', 'Reviewed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                statusFilter === tab 
                                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Explanations List */}
            {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Explanations...</p>
                </div>
            ) : filteredExplanations.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">No Explanations Found</h3>
                    <p className="text-slate-400 text-xs max-w-sm mt-1">
                        {statusFilter === 'Needs Review' 
                            ? 'Great news! There are no pending absence explanations waiting for review.' 
                            : 'No explanation tickets match your current filters.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredExplanations.map((item, idx) => {
                        const isReviewed = item.status === 'Reviewed' || item.status === 'Acknowledged';
                        const incidentDate = item.date ? new Date(item.date).toLocaleDateString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'Today';

                        const submitDate = item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit', hour12: true
                        }) : '';

                        return (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm shrink-0">
                                            {item.user?.name?.charAt(0) || 'E'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800 text-sm">{item.user?.name || 'Unknown Employee'}</h4>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                    {item.user?.role || 'Staff'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                <span>{item.user?.email}</span>
                                                {item.user?.phoneNumber && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{item.user?.phoneNumber}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <Calendar size={13} className="text-slate-400" />
                                            <span>Incident Date: <strong>{incidentDate}</strong></span>
                                        </div>

                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                            isReviewed 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : item.status === 'Submitted'
                                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {isReviewed ? <Check size={12} /> : <Clock size={12} />}
                                            {isReviewed ? 'Reviewed' : item.status === 'Submitted' ? 'Submitted' : 'Pending Response'}
                                        </span>
                                    </div>
                                </div>

                                {/* Explanation / Reason Box */}
                                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        <MessageSquare size={12} /> Reason Provided by Employee:
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                                        "{item.reason || 'No explanation details entered yet.'}"
                                    </p>
                                    {submitDate && (
                                        <p className="text-[10px] text-slate-400 mt-2 text-right">
                                            Submitted at {submitDate}
                                        </p>
                                    )}
                                </div>

                                {/* Admin Action Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                    <div className="text-xs text-slate-500">
                                        {item.adminNotes ? (
                                            <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                                                <ShieldCheck size={14} className="text-emerald-600" />
                                                <strong>Note:</strong> {item.adminNotes}
                                            </p>
                                        ) : (
                                            <span className="text-slate-400 text-[11px]">No executive remarks recorded yet.</span>
                                        )}
                                    </div>

                                    {!isReviewed ? (
                                        <button
                                            onClick={() => handleAcknowledge(item._id)}
                                            disabled={actionLoadingId === item._id}
                                            className="px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary font-bold text-xs transition-all shadow-sm shadow-brand-primary/20 flex items-center justify-center gap-1.5 shrink-0"
                                        >
                                            {actionLoadingId === item._id ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Acknowledging...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={14} /> Acknowledge Explanation
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                            <CheckCircle2 size={14} /> Acknowledged by MD
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AbsenceExplanations;
