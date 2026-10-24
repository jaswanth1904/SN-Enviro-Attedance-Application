import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
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
                                    Enter your new secure password below to regain access to the attendance system.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-xs"
                                >
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span className="flex-1 leading-tight">{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Minimum 6 characters"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Re-enter new password"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/20 mt-6"
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
