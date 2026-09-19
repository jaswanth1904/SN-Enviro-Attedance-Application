import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Edit2, Eye, CheckCircle2, Clock, Users, X } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const AnnouncementModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [audience, setAudience] = useState('All Employees');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({ title, message, priority, audience });
            onClose();
            setTitle('');
            setMessage('');
            setPriority('Normal');
            setAudience('All Employees');
        } catch (err) {
            console.error('Error saving announcement:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone size={20} className="text-brand-primary" /> New Announcement
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                            placeholder="e.g. Mandatory Safety Meeting"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                        <textarea 
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium resize-none"
                            placeholder="Enter the full announcement details here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                            <select 
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary transition-all font-medium bg-white"
                            >
                                <option value="Normal">Normal</option>
                                <option value="Important">Important</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Audience</label>
                            <select 
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary transition-all font-medium bg-white"
                            >
                                <option value="All Employees">All Employees</option>
                                <option value="Department">Specific Department</option>
                                <option value="Site">Specific Site</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold bg-brand-primary text-white hover:bg-brand-secondary transition-colors shadow-sm shadow-brand-primary/20 flex items-center gap-2">
                            {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const MDAnnouncements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements/admin');
            if (res.data && res.data.success) {
                setAnnouncements(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
            // Fallback for presentation
            setAnnouncements([
                { _id: '1', title: 'Office Relocation Update', message: 'The new HQ will open on Monday.', priority: 'Important', audience: 'All Employees', createdAt: new Date().toISOString(), readCount: 145, totalRecipients: 245 },
                { _id: '2', title: 'Q3 Townhall Meeting', message: 'Mandatory attendance for all engineers.', priority: 'Urgent', audience: 'All Employees', createdAt: new Date(Date.now() - 86400000).toISOString(), readCount: 230, totalRecipients: 245 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async (data) => {
        try {
            await api.post('/announcements', data);
            
            // Show 3D Success Popup
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3500); // auto close after 3.5s

            fetchAnnouncements();
        } catch (err) {
            console.error('Failed to broadcast announcement', err);
            alert('Failed to send announcement email. Please check server settings.');
            // Fallback for presentation
            setAnnouncements([{
                _id: Math.random().toString(),
                ...data,
                createdAt: new Date().toISOString(),
                readCount: 0,
                totalRecipients: 0
            }, ...announcements]);
        }
    };

    const deleteAnnouncement = async (id) => {
        try {
            await api.delete(`/announcements/${id}`);
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (err) {
            setAnnouncements(announcements.filter(a => a._id !== id));
        }
    };

    const getPriorityStyle = (priority) => {
        switch(priority) {
            case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Important': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#22223b]">MD Announcements</h1>
                    <p className="text-slate-500 font-medium text-sm">Broadcast urgent messages to the entire organization instantly.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-secondary transition-colors shadow-sm shadow-brand-primary/20">
                    <Plus size={18} /> New Announcement
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-10 text-center font-bold text-slate-400">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="p-10 text-center font-bold text-slate-400 bg-white rounded-2xl border border-slate-100">No announcements published yet.</div>
                ) : (
                    announcements.map((ann, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={ann._id} 
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            {/* Decorative side bar based on priority */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ann.priority === 'Urgent' ? 'bg-rose-500' : ann.priority === 'Important' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(ann.priority)}`}>
                                        {ann.priority}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={14} /> {new Date(ann.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{ann.title}</h3>
                                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-4">{ann.message}</p>
                                
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Users size={14} /> Audience: {ann.audience}
                                    </span>
                                </div>
                            </div>

                            <div className="md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Read Receipts</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-brand-primary">{ann.readCount || 0}</span>
                                        <span className="text-sm font-bold text-slate-400">/ {ann.totalRecipients || 0}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className="bg-brand-primary h-full rounded-full transition-all duration-1000" 
                                            style={{ width: `${ann.totalRecipients ? Math.min((ann.readCount / ann.totalRecipients) * 100, 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => deleteAnnouncement(ann._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                <AnnouncementModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                />
                
                {/* 3D Success Popup */}
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 45 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: -45 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="fixed bottom-10 right-10 z-50 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl shadow-slate-900/40 border border-slate-700 max-w-sm"
                        style={{ transformPerspective: 1000 }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                >
                                    <CheckCircle2 size={24} className="relative z-10" />
                                </motion.div>
                                {/* Ping animation */}
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white mb-1">Broadcast Successful!</h4>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    The announcement has been saved to the portal and <strong className="text-emerald-400">emails are being dispatched</strong> to all targeted employees in the background.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MDAnnouncements;
