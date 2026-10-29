import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Check, AlertCircle, Phone, Briefcase, RefreshCw, ArrowRight, Eye, EyeOff, MapPin } from 'lucide-react';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const { login, register, forgotPassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRoles, setShowRoles] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        empId: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: ''
    });

    const roles = ['Software', 'Application Engineer', 'Admin'];

    const handleSuccessfulAuth = () => {
        onClose();
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        // Use hard-redirects instead of SPA navigation to completely flush
        // the React tree and force a fresh mount with the new session.
        if (storedUser?.role === 'Admin' || storedUser?.role === 'Application Engineer') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'forgot') {
            const result = await forgotPassword(formData.email);
            if (result.success) {
                setForgotSent(true);
            } else {
                setError(result.message);
            }
            setLoading(false);
            return;
        }

        if (mode === 'login') {
            const result = await login(formData.email.trim(), formData.password);
            if (result.success) {
                handleSuccessfulAuth();
            } else {
                setError(result.message);
            }
        } else { 
            const result = await register(formData);
            if (result.success) {
                setSuccess(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#2563EB', '#0ea5e9', '#10b981', '#ffffff']
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-full max-w-md bg-white sm:rounded-[24px] rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Handle bar for mobile */}
                <div className="w-full flex justify-center pt-4 pb-2 sm:hidden">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                <div className="px-6 pb-6 pt-2 sm:p-8 overflow-y-auto custom-scrollbar relative flex-1">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 hidden sm:flex items-center justify-center text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-16 text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-sm border border-emerald-100">
                                    <Check size={40} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-3xl font-bold text-[#22223b] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>Verified!</h2>
                                <p className="text-slate-500 font-light text-sm">Authentication complete. Redirecting...</p>
                            </motion.div>
                        ) : mode === 'forgot' && forgotSent ? (
                            <motion.div
                                key="forgot-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10 text-center"
                            >
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                                    <Mail size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h3>
                                <p className="text-slate-500 text-xs leading-relaxed max-w-xs mb-6">
                                    We've dispatched a secure password reset link to <strong>{formData.email}</strong>. Please check your inbox and click the link to reset your password.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setMode('login'); setForgotSent(false); setError(''); }}
                                    className="px-6 py-3 rounded-full bg-slate-900 text-white hover:bg-black text-xs font-bold transition-all shadow-sm"
                                >
                                    Back to Sign In
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" className="animate-fade-in pt-4 sm:pt-0">
                                
                                <div className="flex flex-col mb-8">
                                    <h2 className="text-3xl sm:text-4xl font-medium text-[#22223b] tracking-tight mb-2" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>
                                        {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Create account.' : 'Reset Password.'}
                                    </h2>
                                    <p className="text-slate-500 font-light text-sm">
                                        {mode === 'forgot' 
                                            ? 'Enter your registered email to receive an instant reset link.'
                                            : 'Enter your credentials to access the SN Enviro portal.'}
                                    </p>
                                </div>

                                {mode !== 'forgot' && (
                                    <div className="flex p-1 bg-slate-50 rounded-full mb-8 border border-slate-100 relative overflow-hidden">
                                        <motion.div
                                            layoutId="auth-pill"
                                            className="absolute inset-y-1 w-[calc(50%-4px)] h-[calc(100%-8px)] rounded-full bg-white shadow-sm z-0"
                                            style={{ left: mode === 'login' ? '4px' : 'calc(50%)' }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMode('login')}
                                            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors relative z-10 ${mode === 'login' ? 'text-slate-900' : 'text-slate-400'}`}
                                        >
                                            Login
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('signup')}
                                            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors relative z-10 ${mode === 'signup' ? 'text-slate-900' : 'text-slate-400'}`}
                                        >
                                            Register
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-[13px]"
                                    >
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <span className="flex-1 leading-tight">{Array.isArray(error) ? error.join(', ') : error}</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {mode === 'signup' && (
                                        <>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={1.5} />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={1.5} />
                                                <input
                                                    type="tel"
                                                    placeholder="Mobile Number"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                    required={mode === 'signup'}
                                                    pattern="[0-9]{10}"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={18} strokeWidth={1.5} />
                                                <select
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-4 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                                    required
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                >
                                                    <option value="" disabled>Select Designation / Role</option>
                                                    <option value="Software Developer">Software Developer</option>
                                                    <option value="Embedded Engineer">Embedded Engineer</option>
                                                    <option value="Field Application Engineer">Field Application Engineer</option>
                                                    <option value="Application Regional Manager">Application Regional Manager</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={1.5} />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    {mode !== 'forgot' && (
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={1.5} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck="false"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-4 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                required={mode !== 'forgot'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                            </button>
                                        </div>
                                    )}

                                    {mode === 'login' && (
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                type="button"
                                                onClick={() => { setMode('forgot'); setError(''); setForgotSent(false); }}
                                                className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-[#22223b] text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all shadow-md mt-6"
                                    >
                                        {loading ? (
                                            <RefreshCw className="animate-spin" size={18} />
                                        ) : (
                                            <>
                                                {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'} <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    {mode === 'forgot' && (
                                        <div className="text-center pt-2">
                                            <button
                                                type="button"
                                                onClick={() => { setMode('login'); setError(''); setForgotSent(false); }}
                                                className="text-xs font-bold text-blue-600 hover:underline"
                                            >
                                                Back to Sign In
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
