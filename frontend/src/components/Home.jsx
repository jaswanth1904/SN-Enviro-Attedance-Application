import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Phone, MapPin, Zap, Globe, Target, Cpu, Activity, Shield, Users, BarChart3, ArrowUpRight } from 'lucide-react';
import HeroLens from './HeroLens';

const Home = ({ onAuthClick }) => {
    return (
        <div className="bg-md-surface min-h-screen relative overflow-hidden">
            <HeroLens onAuthClick={onAuthClick} />

            {/* Value Propositions / M3 Bento Grid */}
            <section className="py-32 px-8 relative" id="about">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary-container/20 border border-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-widest mb-6"
                        >
                            <Shield size={14} /> Established 2017
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold text-md-on-surface mb-8 tracking-tight"
                        >
                            Infrastructure for a <br />
                            <span className="text-brand-primary">Greener Tomorrow.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-md-on-surface-variant max-w-2xl text-xl font-medium leading-relaxed"
                        >
                            Pioneering environmental compliance through high-precision systems integration and real-time telemetry protocols.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
                        {/* Featured M3 Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="md:col-span-8 md:row-span-2 m3-card-elevated p-12 md:p-16 flex flex-col justify-end relative shadow-xl overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                >
                                    <Globe size={320} className="text-md-on-surface" />
                                </motion.div>
                            </div>
                            <div className="relative z-10">
                                <span className="text-brand-primary font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Proven Scale</span>
                                <h3 className="text-4xl md:text-5xl font-bold text-md-on-surface mb-8 tracking-tight leading-tight">300+ SUCCESSFUL <br />DEPLOYMENTS</h3>
                                <p className="text-md-on-surface-variant text-lg leading-relaxed max-w-2xl">
                                    Our master technocrats bring over 100 years of combined experience to ensure your operations synchronize with 100% environmental mandate compliance.
                                </p>
                            </div>
                        </motion.div>

                        {/* High Precision Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="md:col-span-4 md:row-span-1 m3-card-filled p-10 flex flex-col justify-between group hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                <Activity size={28} className="text-brand-primary" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-md-on-surface mb-2">High Precision</h4>
                                <p className="text-md-on-surface-variant text-sm font-medium leading-relaxed uppercase tracking-wider">Real-time data synchronization with government cloud clusters.</p>
                            </div>
                        </motion.div>

                        {/* Mission Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="md:col-span-4 md:row-span-1 m3-card-outlined p-10 flex flex-col justify-between group hover:bg-md-surface-variant/5 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-md-secondary-container flex items-center justify-center group-hover:scale-105 transition-transform">
                                <BarChart3 size={28} className="text-md-on-secondary-container" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-md-on-surface mb-2">Mission Oriented</h4>
                                <p className="text-md-on-surface-variant text-sm font-medium leading-relaxed uppercase tracking-wider">Empowering industrial landscapes with tools for hyper-growth.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
