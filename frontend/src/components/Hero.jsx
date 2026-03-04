import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Globe } from 'lucide-react';

const Hero = ({ onCtaClick }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
            {/* Decorative Blur Orbs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">Next-Gen Corporate Suite</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
                            Elite Attendance <br />
                            <span className="text-primary italic">Precision</span> Redefined.
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
                            Experience the world's most sophisticated attendance ecosystem. Powered by geofencing, real-time analytics, and a premium Glass-UI designed for high-performance teams.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onCtaClick}
                                className="btn-primary py-4 px-8 text-lg flex items-center justify-center gap-2 group"
                            >
                                Employee Portal Access <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-8 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2">
                                Watch Demo
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 grayscale opacity-60">
                            <div className="flex items-center gap-2">
                                <Shield size={20} />
                                <span className="font-semibold text-sm">Enterprise Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={20} />
                                <span className="font-semibold text-sm">Global Compliance</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Visual Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="glass-card p-4 rotate-3 transform hover:rotate-0 transition-transform duration-700">
                            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center overflow-hidden relative group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
                                <div className="relative z-10 text-center p-8">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-6">
                                        <CheckCircle size={40} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Smart Geofencing</h3>
                                    <p className="text-white/0">Automated check-ins based on office radius.</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating stats card */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-6 -left-6 glass-card p-6 shadow-2xl max-w-[200px]"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-500">Daily Attendance</span>
                                <span className="text-xs font-bold text-emerald-500">+12%</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">98.4%</div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
