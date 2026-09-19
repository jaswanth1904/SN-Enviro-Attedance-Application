import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Megaphone, AlertTriangle, Info } from 'lucide-react';
import api from '../api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data && res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            // Mock data fallback
            setNotifications([
                { _id: '1', title: 'System Maintenance', message: 'The portal will be down for 10 minutes at midnight.', type: 'System', isRead: false, createdAt: new Date().toISOString() },
                { _id: '2', title: 'New Leave Request', message: 'Rahul Sharma has requested leave for tomorrow.', type: 'Important Alert', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'MD Announcement': return <Megaphone size={20} className="text-purple-500" />;
            case 'Important Alert': return <AlertTriangle size={20} className="text-rose-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch(type) {
            case 'MD Announcement': return 'bg-purple-50';
            case 'Important Alert': return 'bg-rose-50';
            default: return 'bg-blue-50';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#22223b] flex items-center gap-3">
                        Notifications 
                        {unreadCount > 0 && (
                            <span className="bg-brand-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Review system alerts and important updates.</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="flex items-center gap-2 text-brand-primary font-bold hover:underline">
                        <Check size={18} /> Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center font-bold text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-10 text-center font-bold text-slate-400">You're all caught up! No notifications.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notif, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={notif._id} 
                                className={`p-6 flex items-start gap-4 transition-colors ${notif.isRead ? 'bg-white opacity-60' : 'bg-brand-primary/5'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                                            {new Date(notif.createdAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{notif.message}</p>
                                </div>
                                {!notif.isRead && (
                                    <button 
                                        onClick={() => markAsRead(notif._id)}
                                        className="shrink-0 p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors tooltip-trigger"
                                        title="Mark as read"
                                    >
                                        <Check size={20} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
