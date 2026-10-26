import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    MessageSquare,
    Send,
    Check,
    RefreshCw,
    ShieldCheck,
    FileText,
    Clock,
    User,
    AlertCircle,
    Laptop
} from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

const LeaveApplication = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [leaveScope, setLeaveScope] = useState('single');
    const [formData, setFormData] = useState({
        leaveType: 'Paid Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const isTechRole = ['Software Developer', 'Embedded Engineer', 'Application Engineer', 'Office Employee'].includes(user?.role);

    const baseLeaveTypes = [
        { id: 'Sick Leave', label: 'Sick Leave', icon: Clock, desc: 'Medical emergency or illness' },
        { id: 'Casual Leave', label: 'Casual Leave', icon: User, desc: 'Personal or urgent work' },
        { id: 'Paid Leave', label: 'Paid Leave', icon: FileText, desc: 'Standard annual leave' },
        { id: 'Unpaid Leave', label: 'Unpaid Leave', icon: AlertCircle, desc: 'Non-reimbursable pause' }
    ];

    const leaveTypes = isTechRole
        ? [
            ...baseLeaveTypes,
            { id: 'Work From Home (WFH)', label: 'Work From Home (WFH)', icon: Laptop, desc: 'Authorized remote duty for software & embedded' }
          ]
        : baseLeaveTypes;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/leaves', formData);
            window.scrollTo(0, 0);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2500);
        } catch (err) {
            console.error('Leave application failed', err);
            // Handle error toast here if implemented
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-md-surface flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-8 shadow-2xl shadow-brand-primary/10">
                        <Check size={48} />
                    </div>
                    <h2 className="text-4xl font-bold text-md-on-surface tracking-tight mb-4">Protocol Decoded</h2>
                    <p className="text-md-on-surface-variant font-medium text-lg leading-relaxed">
                        Your leave request has been transmitted to HQ Command. Redirecting to control center...
                    </p>
                    <div className="mt-12 h-1 w-full bg-white rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            transition={{ duration: 2.5, ease: 'linear' }}
                            className="h-full w-full bg-brand-primary"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-md-surface pt-16 sm:pt-20 pb-12 px-3 sm:px-6 relative overflow-hidden text-left">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand-primary/5 blur-[120px] rounded-full -mr-[20vw] -mt-[20vw] pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3.5 sm:gap-6 mb-6 sm:mb-10"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 sm:w-12 sm:h-12 m3-card-elevated flex items-center justify-center text-md-on-surface-variant hover:text-brand-primary transition-colors bg-slate-50 border-0 rounded-xl sm:rounded-2xl shrink-0"
                    >
                        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                    </motion.button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={16} className="text-brand-primary shrink-0" />
                            <span className="text-brand-primary/70 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] truncate">Operational Protocol 09</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-md-on-surface tracking-tight leading-tight">
                            {formData.leaveType === 'Work From Home (WFH)' ? (
                                <>Work From Home <span className="text-brand-primary block sm:inline">(WFH) Request</span></>
                            ) : (
                                <>Leave <span className="text-brand-primary">Application</span></>
                            )}
                        </h1>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-1 gap-6 sm:gap-10">
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4 sm:space-y-7"
                    >
                        {/* Classification Selector */}
                        <div className="m3-card-elevated bg-slate-50 p-4 sm:p-7 md:p-8 border border-md-outline/5 rounded-2xl sm:rounded-[32px]">
                            <label className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] mb-4 sm:mb-6 block">Request Classification</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                                {leaveTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, leaveType: type.id })}
                                        className={`group relative p-3.5 sm:p-4 rounded-xl sm:rounded-[24px] text-left transition-all border-2 ${formData.leaveType === type.id ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/10' : 'bg-slate-50 border-md-outline/10 hover:border-brand-primary/40'}`}
                                    >
                                        <div className="flex items-center sm:block gap-3">
                                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl mb-0 sm:mb-3 flex items-center justify-center transition-colors shrink-0 ${formData.leaveType === type.id ? 'bg-white/20 text-white' : 'bg-white text-brand-primary group-hover:bg-brand-primary/10'}`}>
                                                <type.icon size={18} className="sm:w-5 sm:h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className={`font-bold text-sm sm:text-base mb-0.5 transition-colors ${formData.leaveType === type.id ? 'text-white' : 'text-md-on-surface'}`}>{type.label}</h4>
                                                <p className={`text-[10px] font-medium transition-colors line-clamp-2 ${formData.leaveType === type.id ? 'text-white/80' : 'text-md-on-surface-variant'}`}>{type.desc}</p>
                                            </div>
                                        </div>

                                        {formData.leaveType === type.id && (
                                            <motion.div layoutId="active-indicator" className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Leave Scope & Timeline */}
                        <div className="m3-card-elevated bg-slate-50 p-4 sm:p-7 md:p-8 border border-md-outline/5 rounded-2xl sm:rounded-[32px]">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                                <label className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] block">
                                    {formData.leaveType === 'Work From Home (WFH)' ? 'Remote Duty Schedule (Start & End Date)' : 'Leave Scope'}
                                </label>
                                {formData.leaveType === 'Work From Home (WFH)' && (
                                    <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                        <Laptop size={12} /> Remote Work Period
                                    </span>
                                )}
                            </div>

                            {/* Only show Single / Multiple Leave toggle for standard leaves (Hidden for WFH) */}
                            {formData.leaveType !== 'Work From Home (WFH)' && (
                                <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                                    {[
                                        { id: 'single', label: 'Single Leave' },
                                        { id: 'multiple', label: 'Multiple Leaves' }
                                    ].map((scope) => (
                                        <button
                                            key={scope.id}
                                            type="button"
                                            onClick={() => setLeaveScope(scope.id)}
                                            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${leaveScope === scope.id ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-xs' : 'bg-transparent border-md-outline/10 text-md-on-surface-variant'}`}
                                        >
                                            {scope.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="text-[9px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest ml-3 sm:ml-4">
                                        {formData.leaveType === 'Work From Home (WFH)' ? 'WFH Start Date' : 'Start Point'}
                                    </label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                                        <input
                                            type="date"
                                            className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-xl pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 text-md-on-surface font-bold text-sm focus:outline-none focus:border-brand-primary transition-all"
                                            required
                                            value={formData.startDate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    startDate: val,
                                                    endDate: formData.leaveType === 'Work From Home (WFH)'
                                                        ? (prev.endDate && prev.endDate >= val ? prev.endDate : val)
                                                        : (leaveScope === 'single' ? val : prev.endDate)
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>

                                {(formData.leaveType === 'Work From Home (WFH)' || leaveScope === 'multiple') && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-1.5 sm:space-y-2"
                                    >
                                        <label className="text-[9px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest ml-3 sm:ml-4">
                                            {formData.leaveType === 'Work From Home (WFH)' ? 'WFH End Date' : 'End Point'}
                                        </label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                                            <input
                                                type="date"
                                                min={formData.startDate}
                                                className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-xl pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 text-md-on-surface font-bold text-sm focus:outline-none focus:border-brand-primary transition-all"
                                                required
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Operational Reasoning */}
                        <div className="m3-card-elevated bg-slate-50 p-4 sm:p-7 md:p-8 border border-md-outline/5 rounded-2xl sm:rounded-[32px]">
                            <label className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] mb-4 sm:mb-6 block">
                                {formData.leaveType === 'Work From Home (WFH)' ? 'Reason for Work From Home / Deliverables' : 'Cause for the Leave'}
                            </label>
                            <div className="relative group">
                                <MessageSquare className="absolute left-4 sm:left-5 top-5 sm:top-6 text-brand-primary" size={18} />
                                <textarea
                                    className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-2xl pl-11 sm:pl-12 pr-4 sm:pr-8 py-3.5 sm:py-5 text-md-on-surface font-medium text-sm focus:outline-none focus:border-brand-primary transition-all min-h-[120px] sm:min-h-[160px] placeholder:text-md-on-surface-variant/30 leading-relaxed"
                                    placeholder={formData.leaveType === 'Work From Home (WFH)' ? 'Specify tasks, projects, development sprint, or reason for working remotely from home...' : 'Provide detailed context for this requested leave...'}
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Mobile Optimized Actions */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-6 pt-2 sm:pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-xl text-xs sm:text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant hover:text-md-on-surface hover:bg-slate-100 transition-colors text-center"
                            >
                                Cancel & Return
                            </button>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto m3-btn-filled px-8 sm:px-10 py-4 rounded-2xl text-xs sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-brand-primary text-white shadow-xl shadow-brand-primary/20 h-auto"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                                    <>
                                        <span>{formData.leaveType === 'Work From Home (WFH)' ? 'Submit WFH Request' : 'Submit Application'}</span> <Send size={18} />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </div>
    );
};

export default LeaveApplication;
