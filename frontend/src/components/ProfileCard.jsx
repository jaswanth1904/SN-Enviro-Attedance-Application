import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Mail, Phone, Loader2, Save, Calendar, Clock, CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { useAuth } from './AuthContext';
import api from './api';

const ProfileCard = ({ attendanceData }) => {
    const { user, login } = useAuth(); // login or updateUser logic if AuthContext supports it
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        empId: user?.empId || '',
        role: user?.role || '',
    });

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
        
        try {
            const res = await api.put('/auth/updatedetails', formData);
            if (res.data.success) {
                setSuccess('Profile updated successfully!');
                // Wait briefly then close edit mode
                setTimeout(() => {
                    setIsEditing(false);
                    setSuccess('');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
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

            <div className="px-6 sm:px-10 pb-8 relative">
                {/* Avatar */}
                <div className="relative -mt-16 mb-4 flex justify-between items-end">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg relative">
                        <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 text-3xl font-black uppercase shadow-inner">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {metrics.status === 'Present' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        )}
                        {metrics.status === 'Offline' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-300 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                </div>

                {!isEditing ? (
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{user?.name}</h2>
                            <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-1">
                                <Briefcase size={14} /> {user?.role || 'Employee'}
                            </p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">EMP ID: {user?.empId || 'N/A'}</p>
                            <p className="text-[10px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">SYS ID: {user?._id?.substring(0, 8)}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
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
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Job Role</label>
                                <div className="relative">
                                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Employee ID</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="empId"
                                        value={formData.empId}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
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
            </div>
        </div>
    );
};

export default ProfileCard;
