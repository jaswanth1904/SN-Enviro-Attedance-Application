import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, Calendar, Plus, Save, MapPin, Search, ArrowRight, Loader2, X } from 'lucide-react';

const PlantSiteLogger = () => {
    const [entries, setEntries] = useState([
        { id: 1, date: '2026-09-05', plantName: 'Reliance Jamnagar Refinery', location: 'Gujarat', notes: 'Completed site inspection and calibration of sensors.' },
        { id: 2, date: '2026-09-06', plantName: 'Tata Steel Plant', location: 'Jamshedpur', notes: 'Routine maintenance check.' }
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newEntry, setNewEntry] = useState({ date: new Date().toISOString().split('T')[0], plantName: '', location: '', notes: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            const entry = {
                id: Date.now(),
                ...newEntry
            };
            setEntries([entry, ...entries].sort((a, b) => new Date(b.date) - new Date(a.date)));
            setIsAdding(false);
            setNewEntry({ date: new Date().toISOString().split('T')[0], plantName: '', location: '', notes: '' });
            setIsSaving(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-medium text-slate-900 mb-2 font-serif tracking-tight">Site Visit Log</h1>
                    <p className="text-slate-500 font-light text-sm">Record your daily plant inspections and field progress.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!isAdding ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-4"
                        >
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full bg-black text-white p-5 rounded-[24px] flex items-center justify-between group shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] mb-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Plus size={24} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold uppercase tracking-widest mb-0.5">New Entry</span>
                                        <span className="block text-xs text-white/60 font-medium">Log a recent site visit</span>
                                    </div>
                                </div>
                                <ArrowRight size={20} className="text-white/40 group-hover:text-white transition-colors" />
                            </button>

                            <div className="flex items-center justify-between px-2 mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Logs</h3>
                                <div className="text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{entries.length} Entries</div>
                            </div>

                            {entries.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-8 -mt-8" />
                                    
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-blue-600">
                                                <Factory size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 leading-tight">{entry.plantName}</h4>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{entry.location}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase font-bold tracking-widest text-blue-600 mb-0.5">{new Date(entry.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="block text-xl font-bold text-slate-900 leading-none">{new Date(entry.date).getDate()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 relative z-10">
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">"{entry.notes}"</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <form onSubmit={handleAdd} className="bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Log Visit Details</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAdding(false)}
                                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5 ml-1">
                                            <MapPin size={12} /> Detected Location
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Kanigiri"
                                            value={newEntry.location}
                                            onChange={e => setNewEntry({ ...newEntry, location: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5 ml-1">
                                            <Calendar size={12} /> Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={newEntry.date}
                                            onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                            Days Staying At Site <span className="text-slate-300 normal-case font-medium">(Not mandatory for office staff)</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            value={newEntry.days || ''}
                                            onChange={e => setNewEntry({ ...newEntry, days: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                            Field Progress / Notes <span className="text-slate-300 normal-case font-medium">(e.g., Software team enter NA)</span>
                                        </label>
                                        <textarea
                                            placeholder="Describe tasks completed or issues found..."
                                            value={newEntry.notes}
                                            onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
                                            className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full mt-8 bg-black hover:bg-slate-800 text-white rounded-full py-5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} /> Submit Entry
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlantSiteLogger;
