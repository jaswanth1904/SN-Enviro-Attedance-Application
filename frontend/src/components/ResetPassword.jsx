import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [blockedNotice, setBlockedNotice] = useState('');
    const [success, setSuccess] = useState(false);

    // Strict validation rules
    const criteria = [
        { id: 'length', label: 'At least 8 characters', valid: password.length >= 8 },
        { id: 'upper', label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
        { id: 'lower', label: 'At least one lowercase letter (a-z)', valid: /[a-z]/.test(password) },
        { id: 'number', label: 'At least one number (0-9)', valid: /[0-9]/.test(password) },
        { id: 'special', label: 'At least one special character (!@#$%^&*)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
        { id: 'match', label: 'Passwords match', valid: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword }
    ];

    const complexityPassedCount = criteria.slice(0, 5).filter(c => c.valid).length;
    const allComplexityMet = complexityPassedCount === 5;
    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const isFormValid = allComplexityMet && passwordsMatch;

    // Strength calculation
    const getStrength = () => {
        if (!password) return { label: 'None', score: 0, color: 'bg-slate-200', text: 'text-slate-400' };
        if (complexityPassedCount <= 2) return { label: 'Weak', score: 25, color: 'bg-rose-500', text: 'text-rose-500' };
        if (complexityPassedCount <= 4) return { label: 'Moderate', score: 60, color: 'bg-amber-500', text: 'text-amber-500' };
        if (complexityPassedCount === 5 && password.length < 12) return { label: 'Strong', score: 85, color: 'bg-blue-600', text: 'text-blue-600' };
        return { label: 'Very Secure', score: 100, color: 'bg-emerald-500', text: 'text-emerald-500' };
    };

    const strength = getStrength();

    // Block copy, paste, cut, drop with feedback
    const handleBlockedAction = (e, actionType) => {
        e.preventDefault();
        setBlockedNotice(`⚠️ ${actionType.charAt(0).toUpperCase() + actionType.slice(1)} is disabled for security. Please type manually.`);
        setTimeout(() => {
            setBlockedNotice('');
        }, 3500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBlockedNotice('');

        if (!allComplexityMet) {
            setError('Please satisfy all password complexity requirements.');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match. Please re-enter.');
            return;
        }

        setLoading(true);
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563EB', '#0ea5e9', '#10b981', '#ffffff']
            });

            setTimeout(() => {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.role === 'Admin' || storedUser?.role === 'Application Engineer') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            }, 2500);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden"
            >
                {/* Logo section */}
                <div className="text-center mb-6">
                    <span className="text-2xl font-black text-[#22223b] tracking-tight" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>
                        SN Enviro<span className="text-blue-600">.</span>
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                        Enterprise Access Recovery
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-6 text-center"
                        >
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 shadow-sm">
                                <Check size={36} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h2>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mb-6">
                                Your new password has been saved successfully. Redirecting you to your portal...
                            </p>
                            <Link
                                to="/dashboard"
                                className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                            >
                                Continue to Portal <ArrowRight size={14} />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div key="form">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
                                    Set New Password
                                </h2>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Create a strict, high-security password. For security compliance, pasting and old password reuse are disabled.
                                </p>
                            </div>

                            {/* Blocked action notice */}
                            <AnimatePresence>
                                {blockedNotice && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs shadow-sm"
                                    >
                                        <ShieldAlert size={16} className="shrink-0 text-amber-600" />
                                        <span className="font-semibold leading-tight">{blockedNotice}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Backend / Submission error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-xs shadow-sm"
                                >
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span className="flex-1 font-medium leading-relaxed">{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password Field */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Password</label>
                                        {password && (
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.text}`}>
                                                {strength.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Type new secure password"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all select-none"
                                            required
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onPaste={(e) => handleBlockedAction(e, 'paste')}
                                            onCopy={(e) => handleBlockedAction(e, 'copy')}
                                            onCut={(e) => handleBlockedAction(e, 'cut')}
                                            onDrop={(e) => handleBlockedAction(e, 'drag & drop')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Strength bar indicator */}
                                    {password && (
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
                                            <div
                                                className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                                                style={{ width: `${strength.score}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Confirm New Password Field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-type new password"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all select-none"
                                            required
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onPaste={(e) => handleBlockedAction(e, 'paste')}
                                            onCopy={(e) => handleBlockedAction(e, 'copy')}
                                            onCut={(e) => handleBlockedAction(e, 'cut')}
                                            onDrop={(e) => handleBlockedAction(e, 'drag & drop')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Live Password Policy Checklist */}
                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 mt-3">
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                                        Security Requirements
                                    </span>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {criteria.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-2 text-[11px] transition-colors ${
                                                    item.valid ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                                    item.valid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-transparent'
                                                }`}>
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                                <span>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !isFormValid}
                                    className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md mt-5 ${
                                        !isFormValid
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-blue-500/20'
                                    }`}
                                >
                                    {loading ? (
                                        <RefreshCw className="animate-spin" size={16} />
                                    ) : (
                                        <>
                                            Update Password &amp; Login <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>

                                <div className="text-center pt-2">
                                    <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                        Back to Home / Login
                                    </Link>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
