import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Shield, Activity, LayoutDashboard, Navigation, Camera, Wallet, Users } from 'lucide-react';
import HeroLens from './HeroLens';

const Home = ({ onAuthClick }) => {
    return (
        <div className="bg-[#fafafc] min-h-screen relative overflow-hidden">
            <HeroLens onAuthClick={onAuthClick} />

            {/* Platform Features Section */}
            <section className="py-24 px-6 md:px-12 bg-white relative z-10" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20 text-center">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl font-medium text-[#22223b] mb-4 tracking-tight" 
                            style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}
                        >
                            Platform Features.
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-slate-500 font-light text-lg"
                        >
                            Everything you need for seamless workforce management and operational transparency.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <MapPin size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Live Geo-Attendance</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Securely clock in and out from mobile devices with real-time GPS coordinate locks, ensuring accurate location compliance.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Globe size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Live Tracking Map</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Administrators have a bird's eye view of all active field agents on an interactive map to manage operational assignments dynamically.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-emerald-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <LayoutDashboard size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Real-Time Dashboard</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Comprehensive telemetry and analytics dashboard providing an instant overview of active shifts, overtime hours, and personnel status.
                            </p>
                        </motion.div>

                        {/* Feature 4 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-cyan-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Navigation size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Smart Location Detection</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                High-precision geocoding automatically detects and verifies the exact physical site or plant the employee is reporting from.
                            </p>
                        </motion.div>
                        
                        {/* Feature 5 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-rose-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Camera size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Visual Identity Audit</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Capture live facial verification during clock-ins to ensure absolute security and prevent buddy-punching in field operations.
                            </p>
                        </motion.div>

                        {/* Feature 6 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-purple-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Shield size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Leave Management</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                A streamlined digital portal for applying, tracking, and approving employee leave requests instantly without paper trails.
                            </p>
                        </motion.div>

                        {/* Feature 7 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-orange-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Activity size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Field Site Logging</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Empower engineers to log maintenance updates, downtime events, and general field reports seamlessly directly from the operational site.
                            </p>
                        </motion.div>

                        {/* Feature 8 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-green-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Wallet size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Payroll Integration</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Automatically link clocked hours, approved leaves, and overtime directly to internal salary processing systems.
                            </p>
                        </motion.div>

                        {/* Feature 9 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            className="p-10 rounded-2xl bg-[#fafafc] border border-slate-100 hover:shadow-lg hover:border-pink-100 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Users size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Role-Based Workspaces</h3>
                            <p className="text-slate-500 leading-relaxed font-light text-sm">
                                Tailored digital environments offering precise capabilities and distinct views for Admins, Application Engineers, and Office Staff.
                            </p>
                        </motion.div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
