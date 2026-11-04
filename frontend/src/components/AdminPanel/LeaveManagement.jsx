import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, CalendarClock, Clock, User, Calendar } from 'lucide-react';
import api from '../api';
import EmptyState from '../common/EmptyState';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [actionModal, setActionModal] = useState({
        isOpen: false,
        leave: null,
        status: '',
        remarks: '',
        submitting: false
    });

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const res = await api.get('/leaves').catch(() => ({ data: { success: false } }));
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    setLeaves(res.data.data);
                } else {
                    setLeaves([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, []);

    // Smart contextual MD remarks based on employee reason & leave type
    const getContextualApprovalRemark = (leave) => {
        if (!leave) return 'Approved. Request accepted by MD / Management.';
        const reason = (leave.reason || '').toLowerCase();
        const type = (leave.leaveType || leave.type || '').toLowerCase();

        // Health / Sick / Doctor / Hospital
        if (
            type.includes('sick') || 
            type.includes('medical') || 
            reason.includes('sick') || 
            reason.includes('fever') || 
            reason.includes('health') || 
            reason.includes('doctor') || 
            reason.includes('hospital') || 
            reason.includes('cold') || 
            reason.includes('ill') || 
            reason.includes('unwell') ||
            reason.includes('pain') ||
            reason.includes('treatment')
        ) {
            return 'Approved. Please take good care of your health, rest well, and get well soon.';
        }

        // Birthday celebration
        if (reason.includes('birthday') || reason.includes('bday')) {
            return 'Approved! Wishing you a very Happy Birthday! Enjoy your special day with family and friends.';
        }

        // Anniversary / Wedding / Marriage / Function
        if (reason.includes('anniversary') || reason.includes('marriage') || reason.includes('wedding') || reason.includes('function')) {
            return 'Approved! Hearty congratulations and warm wishes for the celebration.';
        }

        // Work From Home (WFH)
        if (type.includes('wfh') || type.includes('work from home') || reason.includes('wfh')) {
            return 'Approved for Work From Home duty. Please stay reachable on call and share your daily progress.';
        }

        // Family / Personal Emergency
        if (reason.includes('family') || reason.includes('emergency') || reason.includes('urgent') || reason.includes('personal')) {
            return 'Approved. Take care of your personal commitments and keep management informed.';
        }

        return 'Approved. Request accepted by MD / Management.';
    };

    const openActionModal = (leave, status) => {
        setActionModal({
            isOpen: true,
            leave,
            status,
            remarks: status === 'Approved' ? getContextualApprovalRemark(leave) : '',
            submitting: false
        });
    };

    const handleConfirmAction = async () => {
        if (!actionModal.leave) return;
        setActionModal(prev => ({ ...prev, submitting: true }));
        try {
            const payload = {
                status: actionModal.status,
                adminRemarks: actionModal.remarks.trim(),
                rejectionReason: actionModal.status === 'Rejected' ? actionModal.remarks.trim() : undefined
            };
            const res = await api.put(`/leaves/${actionModal.leave._id}`, payload);
            const updated = res.data?.data || { ...actionModal.leave, ...payload };
            setLeaves(leaves.map(l => l._id === actionModal.leave._id ? updated : l));
            setActionModal({ isOpen: false, leave: null, status: '', remarks: '', submitting: false });
        } catch (err) {
            console.error('Failed to update leave', err);
            setActionModal(prev => ({ ...prev, submitting: false }));
        }
    };

    const filteredLeaves = leaves.filter(l => filter === 'All' || l.status === filter);

    // Clean Indian business date formatting (DD MMM YYYY, e.g. 04 Nov 2026)
    const formatDateClean = (dateVal) => {
        if (!dateVal) return 'N/A';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal);
        return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
    };

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
                    <p className="text-slate-500 font-medium text-sm">Review, approve, and manage employee time-off requests with official MD remarks.</p>
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
                    <div className="col-span-full">
                        <EmptyState 
                            icon={Calendar}
                            title={`No ${filter.toLowerCase()} leave requests`}
                            description={`There are currently no leave applications matching the "${filter}" status.`}
                        />
                    </div>
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
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{leave.leaveType || leave.type}</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {formatDateClean(leave.startDate)} to {formatDateClean(leave.endDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">Reason</p>
                                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {leave.reason}
                                        </p>
                                    </div>

                                    {leave.adminRemarks && (
                                        <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/60">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">MD Note / Instruction:</p>
                                            <p className="text-xs italic text-amber-950 mt-0.5">"{leave.adminRemarks}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {leave.status === 'Pending' && (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => openActionModal(leave, 'Rejected')} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 font-bold py-2.5 rounded-xl hover:bg-rose-100 transition-colors"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                    <button 
                                        onClick={() => openActionModal(leave, 'Approved')} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl hover:bg-emerald-100 transition-colors"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            )}
                            {leave.status !== 'Pending' && (
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span className="font-semibold">Processed by Management</span>
                                    <span className="font-mono text-[10px]">
                                        {leave.status === 'Approved' 
                                            ? (leave.leaveType === 'Work From Home (WFH)' ? '🏠 Remote Duty Active' : '🔒 Check-In Locked') 
                                            : 'Unlocked'}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* MD Action & Remarks Modal */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${actionModal.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {actionModal.status === 'Approved' ? <Check size={24} /> : <X size={24} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {actionModal.status === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {actionModal.leave?.user?.name} ({formatDateClean(actionModal.leave?.startDate)} to {formatDateClean(actionModal.leave?.endDate)})
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 my-5">
                            {/* Employee's Original Leave Reason Preview */}
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                                    Employee Request ({actionModal.leave?.leaveType || actionModal.leave?.type}):
                                </p>
                                <p className="text-slate-800 font-medium italic">
                                    "{actionModal.leave?.reason}"
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    {actionModal.status === 'Approved' ? 'MD Remarks / Instructions to Employee (Optional)' : 'Rejection Reason (Required)'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={actionModal.remarks}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, remarks: e.target.value }))}
                                    placeholder={actionModal.status === 'Approved' ? 'Enter MD instructions or select a quick response below...' : 'e.g. Urgent plant commissioning requires your presence'}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Quick-Response Suggestion Chips */}
                            {actionModal.status === 'Approved' ? (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Reply Suggestions:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: '💊 Health / Get Well Soon', text: 'Approved. Please take good care of your health, rest well, and get well soon.' },
                                            { label: '🎂 Happy Birthday!', text: 'Approved! Wishing you a very Happy Birthday! Enjoy your special day with family and friends.' },
                                            { label: '🏡 Personal / Family', text: 'Approved. Take care of your personal commitments and keep management informed.' },
                                            { label: '💻 Remote / WFH Duty', text: 'Approved for Work From Home duty. Please stay reachable on call and share your daily progress.' },
                                            { label: '🤝 Standard Approval', text: 'Approved. Request accepted by MD / Management.' }
                                        ].map((chip, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActionModal(prev => ({ ...prev, remarks: chip.text }))}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-[11px] font-bold text-slate-600 transition-all text-left"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Rejection Reasons:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: '⚠️ Urgent Site Duty', text: 'Urgent plant site commissioning / CEMS analyzer duty requires your on-site presence.' },
                                            { label: '👥 Team Shortage', text: 'Cannot approve due to critical shift staffing shortage on this date.' },
                                            { label: '📞 Contact MD Sir', text: 'Please discuss directly with Managing Director before resubmitting.' }
                                        ].map((chip, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActionModal(prev => ({ ...prev, remarks: chip.text }))}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-[11px] font-bold text-slate-600 transition-all text-left"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {actionModal.status === 'Approved' && (
                                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${actionModal.leave?.leaveType === 'Work From Home (WFH)' ? 'bg-cyan-50 border-cyan-100 text-cyan-950' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                                    <span className="text-base">{actionModal.leave?.leaveType === 'Work From Home (WFH)' ? '🏠' : '🔒'}</span>
                                    <p className="leading-relaxed">
                                        {actionModal.leave?.leaveType === 'Work From Home (WFH)' ? (
                                            <>Approving will authorize <strong>Work From Home (WFH) duty</strong> for this employee from {formatDateClean(actionModal.leave?.startDate)} to {formatDateClean(actionModal.leave?.endDate)}, permitting remote check-in from home, and dispatch an official confirmation email.</>
                                        ) : (
                                            <>Approving will automatically <strong>lock attendance check-in</strong> for this employee from {formatDateClean(actionModal.leave?.startDate)} to {formatDateClean(actionModal.leave?.endDate)}, and dispatch an official confirmation email.</>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setActionModal({ isOpen: false, leave: null, status: '', remarks: '', submitting: false })}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionModal.submitting}
                                onClick={handleConfirmAction}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
                                    actionModal.status === 'Approved'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                }`}
                            >
                                {actionModal.submitting ? 'Updating...' : `Confirm ${actionModal.status}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;
