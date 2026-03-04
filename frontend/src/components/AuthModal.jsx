import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Check, AlertCircle, Phone, Briefcase, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showRoles, setShowRoles] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'Staff'
    });

    const roles = ['Staff', 'Senior', 'Accountant', 'Admin', 'Application Engineer', 'Office Employee'];

    const handleSuccessfulAuth = () => {
        onClose();
        // Conditional redirection based on authorization level
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.role === 'Admin' || storedUser?.role === 'Application Engineer') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'login') {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                handleSuccessfulAuth();
            } else {
                setError(result.message);
            }
        } else { // mode === 'signup'
            const result = await register(formData);
            if (result.success) {
                setSuccess(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#5c6bc0', '#26a69a', '#ec407a', '#ffffff']
                });
                setTimeout(() => {
                    setSuccess(false);
                    setMode('login');
                    handleSuccessfulAuth();
                }, 2000);
            } else {
                setError(result.message);
            }
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-md-surface/90 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative w-full max-w-md m3-card-elevated bg-md-surface-container-high p-1 shadow-2xl overflow-hidden max-h-[92vh] rounded-[28px]"
            >
                <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-teal-500 to-rose-500 rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/30">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <h2 className="text-3xl font-bold text-md-on-surface mb-3 tracking-tight">Identity Verified!</h2>
                                <p className="text-md-on-surface-variant font-medium">Authentication sequence complete. Synchronizing...</p>
                            </motion.div>
                        ) : (
                            <motion.div key="form" className="animate-fade-in">
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-md-on-surface-variant hover:text-md-on-surface bg-md-surface-container rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="flex flex-col items-center mb-4 text-center">
                                    <motion.div
                                        animate={{ rotate: [0, 90, 0] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="w-12 h-12 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-tertiary text-white rounded-[16px] flex items-center justify-center shadow-2xl mb-3 shadow-brand-primary/20"
                                    >
                                        <Zap size={24} fill="currentColor" strokeWidth={0} />
                                    </motion.div>
                                    <h2 className="text-xl font-black text-md-on-surface tracking-tighter mb-1">
                                        {mode === 'login' ? 'SN Enviro Employee Portal' : 'Account Enrollment'}
                                    </h2>
                                    <p className="text-[8px] text-brand-primary font-black uppercase tracking-[0.3em]">
                                        {mode === 'login' ? 'Login Portal' : 'Identity Setup'}
                                    </p>
                                </div>

                                <div className="flex p-0.5 bg-md-surface-container rounded-xl mb-4 border border-md-outline/5 relative overflow-hidden group">
                                    <motion.div
                                        layoutId="auth-pill"
                                        className={`absolute inset-y-0.5 w-[calc(50%-2px)] h-[calc(100%-4px)] rounded-lg shadow-lg z-0 transition-colors duration-500 ${mode === 'login' ? 'left-0.5 bg-brand-primary' : 'left-[calc(50%+1px)] bg-brand-secondary'}`}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMode('login')}
                                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${mode === 'login' ? 'text-white' : 'text-md-on-surface-variant group-hover:text-md-on-surface'}`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('signup')}
                                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${mode === 'signup' ? 'text-white' : 'text-md-on-surface-variant group-hover:text-md-on-surface'}`}
                                    >
                                        Register
                                    </button>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-3 bg-md-error/10 border border-md-error/20 rounded-xl flex items-center gap-3 text-md-error text-[12px] font-bold"
                                    >
                                        <AlertCircle size={16} />
                                        <span className="flex-1">{Array.isArray(error) ? error.join(', ') : error}</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {mode === 'signup' && (
                                        <>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Full Identity Name"
                                                    className="w-full bg-md-surface-container border-2 border-md-outline/10 rounded-xl pl-12 pr-4 py-2.5 text-md-on-surface font-bold text-[12px] tracking-wide focus:outline-none focus:border-brand-primary transition-all"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={16} />
                                                <input
                                                    type="tel"
                                                    placeholder="Operational Frequency (Mobile)"
                                                    className="w-full bg-md-surface-container border-2 border-md-outline/10 rounded-xl pl-12 pr-4 py-2.5 text-md-on-surface font-bold text-[12px] tracking-wide focus:outline-none focus:border-brand-primary transition-all"
                                                    required={mode === 'signup'}
                                                    pattern="[0-9]{10}"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary z-10" size={16} />
                                                <div
                                                    className={`w-full h-11 pl-12 pr-4 bg-md-surface-container border-2 border-md-outline/10 rounded-xl flex items-center justify-between cursor-pointer transition-all ${showRoles ? 'border-brand-primary bg-md-surface-container-high' : 'hover:border-brand-primary/30'}`}
                                                    onClick={() => setShowRoles(!showRoles)}
                                                    tabIndex={0}
                                                >
                                                    <span className={`text-[12px] font-bold tracking-wide ${formData.role ? 'text-md-on-surface' : 'text-md-on-surface-variant/40'}`}>
                                                        {formData.role || 'Sector Assignment'}
                                                    </span>
                                                    <motion.div
                                                        animate={{ rotate: showRoles ? 180 : 0 }}
                                                        className="text-brand-primary"
                                                    >
                                                        <Check size={12} className="rotate-45" />
                                                    </motion.div>
                                                </div>

                                                <AnimatePresence>
                                                    {showRoles && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 5, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                            className="absolute top-full left-0 right-0 z-[110] bg-md-surface-container-high border border-md-outline/10 rounded-2xl shadow-2xl p-2 overflow-hidden backdrop-blur-2xl"
                                                        >
                                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                                {roles.map((role) => (
                                                                    <button
                                                                        key={role}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, role });
                                                                            setShowRoles(false);
                                                                        }}
                                                                        className={`w-full text-left px-4 py-3.5 rounded-xl text-[13px] font-bold tracking-wide transition-all flex items-center justify-between group ${formData.role === role ? 'bg-brand-primary/10 text-brand-primary' : 'text-md-on-surface-variant hover:bg-md-surface-container'}`}
                                                                    >
                                                                        {role}
                                                                        {formData.role === role && <Check size={14} />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </>
                                    )}

                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={16} />
                                        <input
                                            type="email"
                                            placeholder="Digital Identity (Email)"
                                            className="w-full bg-md-surface-container border-2 border-md-outline/10 rounded-xl pl-12 pr-4 py-2.5 text-md-on-surface font-bold text-[12px] tracking-wide focus:outline-none focus:border-brand-primary transition-all"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={16} />
                                        <input
                                            type="password"
                                            placeholder="Access Credential"
                                            className="w-full bg-md-surface-container border-2 border-md-outline/10 rounded-xl pl-12 pr-4 py-2.5 text-md-on-surface font-bold text-[12px] tracking-wide focus:outline-none focus:border-brand-primary transition-all"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileTap={{ scale: 0.98 }}
                                        className="m3-btn-filled w-full py-3.5 rounded-[16px] text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/10 h-auto mt-2"
                                    >
                                        {loading ? (
                                            <RefreshCw className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                {mode === 'login' ? 'Submit Authentication' : 'Create Account'} <ArrowRight size={16} />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <div className="mt-5 text-center pt-4 border-t border-md-outline/5">
                                    <p className="text-md-on-surface-variant text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                        {mode === 'login' ? "New Operative?" : "Already Registered?"}
                                        <button
                                            onClick={() => {
                                                setMode(mode === 'login' ? 'signup' : 'login');
                                                setError('');
                                            }}
                                            className="ml-2 text-brand-primary font-black hover:opacity-80 transition-opacity"
                                        >
                                            {mode === 'login' ? 'Create Account' : 'Back to Login'}
                                        </button>
                                    </p>
                                </div>

                                {/* High-Alert Team Directive */}
                                <div className="mt-5 p-5 bg-md-error/10 rounded-[24px] border-2 border-md-error/30 shadow-lg shadow-md-error/5">
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className="w-12 h-12 bg-md-error/20 rounded-full flex items-center justify-center text-md-error mb-1">
                                            <AlertCircle size={28} strokeWidth={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[12px] text-md-error font-black uppercase tracking-[0.25em]">CRITICAL TEAM DIRECTIVE</p>
                                            <p className="text-[11px] text-md-on-surface font-black leading-relaxed tracking-wide">
                                                MUST READ: Finalize your work shift ONLY ONCE. Your first login and final logout are the only data points saved per day. Multiple login/logout cycles are strictly prohibited for data integrity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
