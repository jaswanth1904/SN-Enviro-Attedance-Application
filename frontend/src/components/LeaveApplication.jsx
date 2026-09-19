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
    AlertCircle
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

    const leaveTypes = [
        { id: 'Sick Leave', label: 'Sick Leave', icon: Clock, desc: 'Medical emergency or illness' },
        { id: 'Casual Leave', label: 'Casual Leave', icon: User, desc: 'Personal or urgent work' },
        { id: 'Paid Leave', label: 'Paid Leave', icon: FileText, desc: 'Standard annual leave' },
        { id: 'Unpaid Leave', label: 'Unpaid Leave', icon: AlertCircle, desc: 'Non-reimbursable pause' }
    ];

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
        <div className="min-h-screen bg-md-surface pt-20 pb-12 px-6 relative overflow-hidden text-center sm:text-left">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand-primary/5 blur-[120px] rounded-full -mr-[20vw] -mt-[20vw] pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-6 mb-12"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-12 h-12 m3-card-elevated flex items-center justify-center text-md-on-surface-variant hover:text-brand-primary transition-colors bg-slate-50 border-0"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck size={18} className="text-brand-primary" />
                            <span className="text-brand-primary/60 font-bold text-[10px] uppercase tracking-[0.3em]">Operational Protocol 09</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-md-on-surface tracking-tight">
                            Leave <span className="text-brand-primary">Application</span>
                        </h1>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-1 gap-12">
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        {/* Classification Selector */}
                        <div className="m3-card-elevated bg-slate-50 p-8 border border-md-outline/5 rounded-[32px]">
                            <label className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] mb-8 block">Request Classification</label>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {leaveTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, leaveType: type.id })}
                                        className={`group relative p-4 rounded-[24px] text-left transition-all border-2 ${formData.leaveType === type.id ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/10 scale-[1.01]' : 'bg-slate-50 border-md-outline/10 hover:border-brand-primary/40'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center transition-colors ${formData.leaveType === type.id ? 'bg-white/20 text-white' : 'bg-white text-brand-primary group-hover:bg-brand-primary/10'}`}>
                                            <type.icon size={20} />
                                        </div>
                                        <h4 className={`font-bold text-base mb-0.5 transition-colors ${formData.leaveType === type.id ? 'text-white' : 'text-md-on-surface'}`}>{type.label}</h4>
                                        <p className={`text-[10px] font-medium transition-colors ${formData.leaveType === type.id ? 'text-white/70' : 'text-md-on-surface-variant'}`}>{type.desc}</p>

                                        {formData.leaveType === type.id && (
                                            <motion.div layoutId="active-indicator" className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Leave Scope & Timeline */}
                        <div className="m3-card-elevated bg-slate-50 p-8 border border-md-outline/5 rounded-[32px]">
                            <label className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] mb-8 block">Leave Scope</label>

                            <div className="flex flex-wrap gap-3 mb-10">
                                {[
                                    { id: 'single', label: 'Single Leave' },
                                    { id: 'multiple', label: 'Multiple Leaves' }
                                ].map((scope) => (
                                    <button
                                        key={scope.id}
                                        type="button"
                                        onClick={() => setLeaveScope(scope.id)}
                                        className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${leaveScope === scope.id ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-sm' : 'bg-transparent border-md-outline/10 text-md-on-surface-variant'}`}
                                    >
                                        {scope.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest ml-4">Start Point</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                                        <input
                                            type="date"
                                            className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-xl pl-12 pr-6 py-4 text-md-on-surface font-bold text-sm focus:outline-none focus:border-brand-primary transition-all"
                                            required
                                            value={formData.startDate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    startDate: val,
                                                    endDate: leaveScope === 'single' ? val : prev.endDate
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>

                                {leaveScope === 'multiple' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[9px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest ml-4">End Point</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                                            <input
                                                type="date"
                                                className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-xl pl-12 pr-6 py-4 text-md-on-surface font-bold text-sm focus:outline-none focus:border-brand-primary transition-all"
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
                        <div className="m3-card-elevated bg-slate-50 p-8 border border-md-outline/5 rounded-[32px]">
                            <label className="text-[10px] text-md-on-surface-variant font-black uppercase tracking-[0.2em] mb-8 block">Cause for the Leave</label>
                            <div className="relative group">
                                <MessageSquare className="absolute left-5 top-6 text-brand-primary" size={18} />
                                <textarea
                                    className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-2xl pl-12 pr-8 py-5 text-md-on-surface font-medium text-sm focus:outline-none focus:border-brand-primary transition-all min-h-[160px] placeholder:text-md-on-surface-variant/20"
                                    placeholder="Provide detailed context for this requested leave..."
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant hover:text-md-on-surface transition-colors"
                            >
                                Abandon
                            </button>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className="m3-btn-filled px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-brand-primary text-white shadow-xl shadow-brand-primary/20 h-auto"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                                    <>
                                        Submit <Send size={20} />
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
