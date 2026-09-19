import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api';

const DepartmentsSites = () => {
    const [departments, setDepartments] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Sites
                const sitesRes = await api.get('/sites').catch(() => ({ data: { success: false } }));
                if (sitesRes.data && sitesRes.data.success) {
                    setSites(sitesRes.data.data);
                } else {
                    setSites([
                        { _id: '1', name: 'Mumbai HQ', radius: 200, location: { address: 'Bandra, Mumbai' } },
                        { _id: '2', name: 'Ahmedabad Plant', radius: 500, location: { address: 'Sanand, Ahmedabad' } }
                    ]);
                }

                // Mock Departments since we don't have an endpoint for it yet
                setDepartments([
                    { _id: '1', name: 'Engineering', description: 'Core application and systems engineering.' },
                    { _id: '2', name: 'Field Operations', description: 'On-site service technicians and managers.' },
                    { _id: '3', name: 'HR & Admin', description: 'Human resources and administrative staff.' }
                ]);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-[#22223b]">Departments & Sites</h1>
                <p className="text-slate-500 font-medium text-sm">Manage organizational structure and authorized field locations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Departments Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Building2 size={20} className="text-brand-primary" /> Departments
                        </h2>
                        <button className="text-sm font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Dept
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-6 text-center text-slate-400 font-bold">Loading...</div>
                        ) : departments.map((dept, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={dept._id}
                                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                            >
                                <div>
                                    <h3 className="font-bold text-slate-800">{dept.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{dept.description}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sites Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <MapPin size={20} className="text-brand-primary" /> Geo-Fenced Sites
                        </h2>
                        <button className="text-sm font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Site
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-6 text-center text-slate-400 font-bold">Loading...</div>
                        ) : sites.map((site, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={site._id}
                                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                            >
                                <div>
                                    <h3 className="font-bold text-slate-800">{site.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{site.location?.address}</p>
                                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                                        Radius: {site.radius}m
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DepartmentsSites;
