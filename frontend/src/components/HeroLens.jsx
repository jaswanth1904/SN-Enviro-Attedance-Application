import React from 'react';
import { motion } from 'framer-motion';

const HeroLens = ({ onAuthClick }) => {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-32 pb-12 overflow-hidden bg-[#fafafc]">
            {/* Subtle Background Gradients to match the loopin style */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
                <div className="w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] opacity-70" />
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-[-8vh]">
                
                {/* Top Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-blue-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-10"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-blue-600 text-[11px] font-bold tracking-wide">Real-Time Attendance Evolved</span>
                </motion.div>

                {/* Main Heading with Serif Font */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-[6rem] font-medium text-[#22223b] leading-[1.1] tracking-tight mb-8 max-w-5xl"
                    style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}
                >
                    Manage Attendance.<br/>At Light Speed.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-16 font-light"
                >
                    SN Enviro is a high-performance workspace designed for team momentum. Say goodbye to latency and hello to instantaneous attendance sync.
                </motion.p>

                {/* Vertical Line fading down */}
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 100, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className="w-[1px] bg-gradient-to-b from-blue-300 via-blue-200 to-transparent"
                />
            </div>
        </section>
    );
};

export default HeroLens;
