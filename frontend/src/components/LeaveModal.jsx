import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MessageSquare, List, Send, Check, RefreshCw } from 'lucide-react';
import api from './api';

const LeaveModal = ({ isOpen, onClose, onApplySuccess }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'Paid Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [leaveScope, setLeaveScope] = useState('single');

    const leaveTypes = ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/leaves', formData);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onApplySuccess();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Leave application failed', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-md-surface/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-lg m3-card-elevated bg-slate-100 p-1 shadow-2xl overflow-hidden rounded-[32px]"
            >
                <div className="p-8 md:p-10">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-6 shadow-sm">
                                    <Check size={40} />
                                </div>
                                <h3 className="text-3xl font-bold text-md-on-surface tracking-tight">Protocol Sent</h3>
                                <p className="text-md-on-surface-variant font-medium mt-2">Leave request is being verified by HQ command.</p>
                            </motion.div>
                        ) : (
                            <motion.div key="form" className="animate-fade-in">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-2xl font-bold text-md-on-surface tracking-tight">Leave Protocol</h3>
                                        <p className="text-md-on-surface-variant font-medium text-sm mt-1">Initialize authorization request</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 flex items-center justify-center text-md-on-surface-variant hover:text-md-on-surface bg-white rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div>
                                        <label className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-4 block">Classification</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {leaveTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, leaveType: type })}
                                                    className={`py-3.5 px-4 rounded-2xl text-[11px] font-bold transition-all border-2 uppercase tracking-widest ${formData.leaveType === type ? 'bg-brand-primary text-md-on-primary border-brand-primary shadow-md' : 'bg-slate-50 border-md-outline/10 text-md-on-surface-variant hover:border-brand-primary/30'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-4 block">Operational Scope</label>
                                        <div className="flex gap-3 mb-8">
                                            {[
                                                { id: 'single', label: 'Single Day' },
                                                { id: 'multiple', label: 'Multiple Days' }
                                            ].map((scope) => (
                                                <button
                                                    key={scope.id}
                                                    type="button"
                                                    onClick={() => setLeaveScope(scope.id)}
                                                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2 ${leaveScope === scope.id ? 'bg-blue-100 text-blue-700 border-blue-300/30 shadow-sm' : 'bg-transparent border-md-outline/10 text-md-on-surface-variant'}`}
                                                >
                                                    {scope.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-4 block">
                                                    {leaveScope === 'single' ? 'Deployment Date' : 'Inception'}
                                                </label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                                                    <input
                                                        type="date"
                                                        className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-2xl pl-12 pr-4 py-4 text-md-on-surface font-bold text-[11px] uppercase tracking-widest focus:outline-none focus:border-brand-primary transition-all"
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
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    <label className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-4 block">Conclusion</label>
                                                    <div className="relative group">
                                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                                                        <input
                                                            type="date"
                                                            className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-2xl pl-12 pr-4 py-4 text-md-on-surface font-bold text-[11px] uppercase tracking-widest focus:outline-none focus:border-brand-primary transition-all"
                                                            required
                                                            value={formData.endDate}
                                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-4 block">Justification</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-4 top-5 text-brand-primary" size={18} />
                                            <textarea
                                                className="w-full bg-slate-100 border-2 border-md-outline/10 rounded-2xl pl-12 pr-6 py-5 text-md-on-surface font-medium text-sm focus:outline-none focus:border-brand-primary transition-all min-h-[140px] placeholder:text-md-on-surface-variant/30"
                                                placeholder="Describe the operational reasoning for requested pause..."
                                                required
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileTap={{ scale: 0.98 }}
                                        className="m3-btn-filled w-full py-5 rounded-3xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl shadow-brand-primary/20 h-auto mt-4"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                                            <>
                                                TRANSMIT PROTOCOL <Send size={20} />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default LeaveModal;
