import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, MapPin, Map, UserMinus, Clock, Bell, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import api from '../api'; // Adjust path if needed. Let's assume standard api path

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-500`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        </div>
    </motion.div>
);

const Overview = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateLogins: 0,
        onLeaveToday: 0,
        activeSites: 0,
        attendancePercentage: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await api.get('/admin/overview');
                if (res.data && res.data.success) {
                    setStats(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Overview...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[#22223b] mb-2">Command Overview</h1>
                    <p className="text-slate-500 font-medium text-sm">Real-time telemetry and enterprise administration panel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Personnel" value={stats.totalEmployees} icon={Users} color="blue" delay={0.1} />
                <StatCard label="Present Today" value={stats.presentToday} icon={CalendarCheck} color="emerald" delay={0.2} />
                <StatCard label="Active Sites" value={stats.activeSites} icon={MapPin} color="purple" delay={0.3} />
                <StatCard label="Attendance Rate" value={`${stats.attendancePercentage}%`} icon={Clock} color="amber" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:col-span-2"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 tracking-wide">Recent Field Activity</h3>
                        <Link to="/admin/live-tracking" className="text-sm font-bold text-brand-primary flex items-center gap-2 hover:underline">
                            View Live Map <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentActivity.slice(0, 5).map((act, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        {act.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{act.user?.name || 'Unknown'}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{act.user?.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono font-bold text-slate-600">{new Date(act.timestamp).toLocaleTimeString()}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                        {act.locationName || 'Location Logged'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {stats.recentActivity.length === 0 && (
                            <div className="text-center py-8 text-slate-400 font-bold text-sm">No activity recorded today.</div>
                        )}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    {/* Quick Stats Column */}
                    <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                        <div className="flex items-center gap-3 text-rose-500 mb-2">
                            <UserMinus size={20} />
                            <h4 className="font-bold uppercase tracking-widest text-xs">Absent Today</h4>
                        </div>
                        <p className="text-4xl font-black text-rose-600">{stats.absentToday}</p>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                        <div className="flex items-center gap-3 text-amber-500 mb-2">
                            <Clock size={20} />
                            <h4 className="font-bold uppercase tracking-widest text-xs">Late Logins</h4>
                        </div>
                        <p className="text-4xl font-black text-amber-600">{stats.lateLogins}</p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center gap-3 text-blue-500 mb-2">
                            <CalendarCheck size={20} />
                            <h4 className="font-bold uppercase tracking-widest text-xs">On Leave</h4>
                        </div>
                        <p className="text-4xl font-black text-blue-600">{stats.onLeaveToday}</p>
                    </div>
                </motion.div>
            </div>

            {/* Analytics Charts Row 1 */}
            {stats.charts && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
                >
                    {/* Line Chart: Weekly Trend */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 tracking-wide mb-6">Weekly Attendance Trend</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.charts.line}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    />
                                    <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart: Location Spread */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 tracking-wide mb-6">Today's Site Distribution</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.charts.bar} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Analytics Charts Row 2 */}
            {stats.charts && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
                >
                    {/* Pie Chart: Role Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:col-span-1 flex flex-col items-center">
                        <h3 className="font-bold text-slate-800 tracking-wide w-full text-left mb-2">Role Distribution</h3>
                        <div className="h-64 w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.charts.pie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.charts.pie.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'][index % 6]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                <span className="text-2xl font-black text-slate-800">{stats.totalEmployees}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Leaves Alert Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:col-span-2 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
                        <h3 className="font-bold text-slate-800 tracking-wide mb-4 relative z-10">Administrative Action Required</h3>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                                <Bell size={28} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900 mb-1">{stats.pendingLeaves || 0}</p>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending Leave Requests</p>
                            </div>
                        </div>
                        <div className="mt-6 relative z-10">
                            <Link to="/admin/leaves" className="inline-block bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                                Review Requests
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Architecture Explanation for MD & Manager Demo */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 bg-slate-900 rounded-3xl p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-white mb-4 font-serif">Enterprise Real-Time Architecture</h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            This dashboard operates on a state-of-the-art live telemetry system. Instead of waiting for end-of-day reports, our engineers' mobile applications maintain a persistent WebSocket connection to the central servers. 
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <strong>Instant GPS Locks:</strong> Geolocation is captured and verified instantly at clock-in.
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                <strong>Zero-Latency Sync:</strong> Site data and progress updates stream live to this dashboard.
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                                <strong>Automated Escalations:</strong> Missing or late check-ins trigger automated alerts to HR and management immediately.
                            </li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/3 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Data Stream</h4>
                        <div className="space-y-2 font-mono text-[10px] text-emerald-400">
                            <p>{'>'} WSS_CONNECTION_ESTABLISHED</p>
                            <p>{'>'} AUTH_TOKEN_VERIFIED</p>
                            <p className="text-slate-500">{'>'} Awaiting incoming telemetry...</p>
                            <p className="animate-pulse text-blue-400">{'>'} [NEW] GPS_SYNC: MUMBAI_SITE</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Overview;
