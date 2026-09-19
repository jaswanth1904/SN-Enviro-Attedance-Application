import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, UserX, UserCheck, Eye } from 'lucide-react';
import api from '../api';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/users');
                if (res.data && res.data.success) {
                    setEmployees(res.data.data);
                } else if (res.data && Array.isArray(res.data)) {
                    setEmployees(res.data);
                } else {
                    setEmployees([]);
                }
            } catch (err) {
                console.error('Failed to fetch employees:', err);
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp => 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#22223b]">Employee Management</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage personnel, roles, and access credentials.</p>
                </div>
                <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-secondary transition-colors shadow-sm shadow-brand-primary/20">
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or role..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {filteredEmployees.length} Results
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400">
                                <th className="p-4 font-bold">Employee</th>
                                <th className="p-4 font-bold">Role & Dept</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Premium Skeleton Screen for Table
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skeleton-${i}`} className="border-b border-slate-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                                                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-2">
                                                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
                                                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
                                                <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
                                                <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-bold">No employees found.</td></tr>
                            ) : (
                                filteredEmployees.map((emp, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={emp._id} 
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {emp.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-700 text-xs">{emp.role}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                                                {emp.department?.name || 'Unassigned'}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                emp.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                                {emp.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="View Profile">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title={emp.isActive !== false ? "Deactivate" : "Activate"}>
                                                    {emp.isActive !== false ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagement;
