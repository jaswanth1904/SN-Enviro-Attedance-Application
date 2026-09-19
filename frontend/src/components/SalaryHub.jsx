import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, ArrowDownCircle, Download } from 'lucide-react';
import api from './api';

const SalaryHub = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        try {
            const res = await api.get('/salary/my');
            setSalaries(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch salary data', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-bold text-md-on-surface tracking-tight">Financial Hub</h3>
                    <p className="text-md-on-surface-variant font-medium text-sm mt-1">Personnel credit and remuneration logs</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {/* Visual Summary Card - M3 Elevated */}
                <div className="md:col-span-2 m3-card-elevated p-10 bg-slate-100 border-brand-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={160} className="text-brand-primary" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[12px] text-brand-primary font-bold uppercase tracking-widest mb-3">Projected Cycle Credit</p>
                        <h4 className="text-5xl md:text-6xl font-black text-md-on-surface mb-8 tracking-tighter">
                            ₹{salaries[0]?.netSalary?.toLocaleString() || '0'}
                        </h4>
                        <div className="flex flex-wrap gap-10 md:gap-14">
                            <div>
                                <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-2.5">Protocol Status</p>
                                <span className="flex items-center gap-2.5 text-brand-primary font-bold text-[13px] uppercase tracking-wide">
                                    <CheckCircle size={16} /> Verified Link
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-2.5">Remuneration Cycle</p>
                                <span className="text-md-on-surface font-bold text-[13px] uppercase tracking-wide">Standard Monthly Credit</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="m3-card-filled p-10 flex flex-col justify-between bg-white border border-md-outline/5">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-10 transition-transform group-hover:rotate-12">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <h5 className="text-md-on-surface font-bold uppercase tracking-tight text-lg mb-3">Direct Deposit</h5>
                        <p className="text-md-on-surface-variant text-[13px] font-medium leading-relaxed opacity-80">
                            Credits are automatically initiated to your primary node by the 5th of every month cycle.
                        </p>
                    </div>
                </div>
            </div>

            <div className="m3-card-filled bg-slate-50 border border-md-outline/10 overflow-hidden shadow-sm">
                <div className="p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-2 h-8 bg-brand-primary rounded-full" />
                        <h4 className="text-xl font-bold text-md-on-surface tracking-tight">Voucher Archives</h4>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-24 text-center animate-pulse text-md-on-surface-variant font-bold uppercase text-[11px] tracking-widest">Scanning HQ records...</div>
                        ) : salaries.length > 0 ? (
                            salaries.map((salary, i) => (
                                <motion.div
                                    key={salary._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-6 md:p-8 bg-white/50 rounded-[28px] border border-md-outline/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                                            <ArrowDownCircle size={28} />
                                        </div>
                                        <div>
                                            <p className="text-md-on-surface font-bold text-lg mb-0.5 tracking-tight">{salary.month}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest">Net Credit:</span>
                                                <span className="text-md-on-surface font-black text-sm">₹{salary.netSalary?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="text-left md:text-right">
                                            <span className="px-5 py-2 m3-btn-tonal text-[10px] font-bold uppercase tracking-widest h-auto inline-block border border-brand-primary/20">
                                                {salary.status}
                                            </span>
                                            <p className="text-[10px] text-md-on-surface-variant font-mono mt-2 tracking-tighter opacity-60">{salary.transactionId || 'SN-TRX-AUTH-001'}</p>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            className="w-12 h-12 bg-white text-md-on-surface-variant hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl flex items-center justify-center transition-all border border-md-outline/5"
                                        >
                                            <Download size={20} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-24 text-center border-2 border-dashed border-md-outline/10 rounded-[32px] bg-white/30">
                                <AlertCircle size={48} className="mx-auto text-md-on-surface-variant mb-4 opacity-10" />
                                <p className="text-md-on-surface-variant font-bold uppercase tracking-widest text-xs">No financial records detected in node cache</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryHub;
