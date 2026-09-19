import React, { useState } from 'react';
import { Save, Shield, Clock, Bell, MonitorSmartphone } from 'lucide-react';

const Settings = () => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-black text-[#22223b]">Platform Settings</h1>
                <p className="text-slate-500 font-medium text-sm">Configure global attendance rules and system behavior.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                    <Clock className="text-brand-primary" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Attendance Configuration</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Standard Shift Start Time</label>
                            <input type="time" defaultValue="09:00" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary transition-all font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Late Threshold (Grace Period)</label>
                            <div className="flex items-center gap-2">
                                <input type="number" defaultValue="30" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary transition-all font-medium" />
                                <span className="font-bold text-slate-400 text-sm">minutes</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                            <span className="font-bold text-slate-700">Require photo validation for mobile check-in</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                    <Shield className="text-brand-primary" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Security & Access</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                            <span className="font-bold text-slate-700">Enforce strict geo-fencing (block check-in outside radius)</span>
                        </label>
                        <p className="text-xs text-slate-500 ml-8 mt-1 font-medium">If disabled, out-of-bounds check-ins are allowed but marked as anomalous.</p>
                    </div>
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                            <span className="font-bold text-slate-700">Allow Service Engineers to view full project details</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-colors shadow-sm shadow-brand-primary/20"
                >
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Configurations</>}
                </button>
            </div>
        </div>
    );
};

export default Settings;
