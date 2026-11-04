import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Briefcase, Mail, Phone, Loader2, Save, Calendar, Clock, 
    CheckCircle, XCircle, Edit3, Lock, KeyRound, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';
import { useAuth } from './AuthContext';
import api from './api';

const ProfileCard = ({ attendanceData }) => {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Change Password State
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        empId: user?.empId || '',
        role: user?.role || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                empId: user.empId || '',
                role: user.role || '',
            });
        }
    }, [user]);

    // --- Metrics Calculation ---
    const [metrics, setMetrics] = useState({
        presentDays: 0,
        absentDays: 0,
        attendancePercent: 100,
        leaveBalance: 12, // Dummy leave balance for now
        lastCheckIn: null,
        status: 'Offline'
    });

    useEffect(() => {
        if (attendanceData && attendanceData.length > 0) {
            const latest = attendanceData[0];
            const isToday = new Date(latest.timestamp).toDateString() === new Date().toDateString();
            
            // Calculate unique days present
            const uniqueDays = new Set(attendanceData.map(record => new Date(record.timestamp).toDateString()));
            const presentDays = uniqueDays.size;
            
            // Simple assumption: 30 days in a month. If it's real data, this would be computed vs working days.
            const absentDays = Math.max(0, 30 - presentDays);
            const percent = presentDays > 0 ? Math.min(100, Math.round((presentDays / 30) * 100)) : 0;

            setMetrics({
                presentDays,
                absentDays,
                attendancePercent: percent,
                leaveBalance: 12,
                lastCheckIn: isToday ? new Date(latest.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
                status: isToday && !latest.checkOut ? 'Present' : 'Offline'
            });
        }
    }, [attendanceData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const emailChanged = formData.email && user?.email && (formData.email.toLowerCase().trim() !== user.email.toLowerCase().trim());

        try {
            const res = await updateProfile(formData);
            if (res.success) {
                if (emailChanged) {
                    setSuccess('Company email updated in database! For security, logging you out in 3 seconds... Please log in with your new company email.');
                    setTimeout(() => {
                        logout();
                    }, 3000);
                } else {
                    setSuccess('Profile updated and saved to database successfully!');
                    setTimeout(() => {
                        setIsEditing(false);
                        setSuccess('');
                    }, 1500);
                }
            } else {
                setError(res.message || 'Failed to update profile in database');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Please fill in all password fields.');
            setPasswordLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long.');
            setPasswordLoading(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New password and confirmation do not match.');
            setPasswordLoading(false);
            return;
        }

        try {
            const res = await api.put('/auth/updatepassword', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (res.data.success) {
                setPasswordSuccess('Password updated successfully in database! Logging you out in 3 seconds... Please log in with your new password.');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    logout();
                }, 3000);
            }
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all"
                    >
                        <Edit3 size={16} />
                    </button>
                )}
            </div>

            <div className="px-4 sm:px-8 md:px-10 pb-6 sm:pb-8 relative">
                {/* Avatar */}
                <div className="relative -mt-14 sm:-mt-16 mb-3 sm:mb-4 flex justify-between items-end">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-lg relative">
                        <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 text-2xl sm:text-3xl font-black uppercase shadow-inner">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {metrics.status === 'Present' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        )}
                        {metrics.status === 'Offline' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-slate-300 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                </div>

                {!isEditing ? (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Profile Info */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{user?.name}</h2>
                            <p className="text-xs sm:text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-1">
                                <Briefcase size={14} /> {user?.role || 'Employee'}
                            </p>
                            {user?.empId && (
                                <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">EMP ID: {user.empId}</p>
                            )}
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">SYS ID: {user?._id?.substring(0, 8)}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                    <Clock size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Check-In</span>
                                </div>
                                <p className="text-lg font-bold text-slate-800">{metrics.lastCheckIn || '--:--'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                    <CheckCircle size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Present</span>
                                </div>
                                <p className="text-lg font-bold text-emerald-700">{metrics.presentDays} Days</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                <div className="flex items-center gap-2 text-rose-600 mb-2">
                                    <XCircle size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Absent</span>
                                </div>
                                <p className="text-lg font-bold text-rose-700">{metrics.absentDays} Days</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                    <Calendar size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Leave Bal</span>
                                </div>
                                <p className="text-lg font-bold text-indigo-700">{metrics.leaveBalance}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attendance Health</span>
                                <span className="text-sm font-black text-slate-800">{metrics.attendancePercent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metrics.attendancePercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="bg-blue-600 h-2.5 rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <motion.form 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit} 
                        className="space-y-4 pt-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Cancel</button>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Address (Login ID)</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="yourname@snenviro.in"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1">
                                    Updating to company email updates your login credentials in the database.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="tel" 
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1">
                                    Direct database contact number for emergency & SMS telemetry.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Job Role</label>
                                    {user?.role !== 'Admin' && <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">HR Assigned</span>}
                                </div>
                                <div className="relative">
                                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="role"
                                        disabled={user?.role !== 'Admin'}
                                        value={formData.role}
                                        onChange={handleChange}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none transition-all ${user?.role !== 'Admin' ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'focus:border-blue-500 focus:bg-white'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Employee ID</label>
                                    {user?.role !== 'Admin' && <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">HR Assigned</span>}
                                </div>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="empId"
                                        disabled={user?.role !== 'Admin'}
                                        value={formData.empId}
                                        onChange={handleChange}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none transition-all ${user?.role !== 'Admin' ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'focus:border-blue-500 focus:bg-white'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* Security & Password Management Section */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-6 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Security & Password Management</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Update your account login password in the database</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordSection(!showPasswordSection);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs self-start sm:self-auto shrink-0"
                            >
                                {showPasswordSection ? 'Cancel / Close' : 'Change Password'}
                            </button>
                        </div>

                        {showPasswordSection && (
                            <form onSubmit={handlePasswordSubmit} className="mt-5 pt-5 border-t border-slate-200/70 space-y-4">
                                {passwordError && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
                                        <XCircle size={15} className="shrink-0" />
                                        <span>{passwordError}</span>
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2">
                                        <CheckCircle size={15} className="shrink-0" />
                                        <span>{passwordSuccess}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-1">Current Password</label>
                                        <div className="relative">
                                            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showCurrentPw ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPw(!showCurrentPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-1">New Password</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showNewPw ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                placeholder="Min 6 characters"
                                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPw(!showNewPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showConfirmPw ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                placeholder="Repeat new password"
                                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                                        <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                                        After saving, you will be automatically redirected to log in with your new password.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 shrink-0"
                                    >
                                        {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save New Password</>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
