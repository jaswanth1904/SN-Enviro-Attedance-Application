import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, Leaf, Waves, Wind, ShieldCheck, Zap, Monitor, Activity } from 'lucide-react';

const phrases = ['Ecology First', 'Precision Hub', 'Nature Tech', 'Future Green'];

const Typewriter = () => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);

    const colors = ['text-brand-primary', 'text-brand-secondary', 'text-brand-tertiary', 'text-brand-accent'];

    useEffect(() => {
        if (subIndex === phrases[index].length + 1 && !reverse) {
            setTimeout(() => setReverse(true), 2500);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % phrases.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? 40 : 120);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse]);

    return (
        <span className={`${colors[index]} transition-colors duration-700 inline-block min-w-[300px]`}>
            {phrases[index].substring(0, subIndex)}
        </span>
    );
};

const HeroLens = ({ onAuthClick }) => {
    const sectionRef = useRef(null);
    const { scrollY } = useScroll();

    // Parallax & Scroll effects
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);

    // Mouse Parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

    const moveX = useTransform(springX, [0, 1920], [-20, 20]);
    const moveY = useTransform(springY, [0, 1080], [-20, 20]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <section ref={sectionRef} className="relative min-h-[90vh] w-full flex items-center justify-center py-24 overflow-hidden">
            {/* M3 Ambient Background - Nature Focused */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.9 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0 transition-transform hover:scale-105"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&auto=format&fit=crop&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.9) contrast(1.1)',
                        loading: 'eager' // Not standard for backgroundImage but helpful to document intent, 
                        // best handled by preloading in index.html if possible
                    }}
                />
                <motion.div style={{ y: y1 }} className="absolute inset-0">
                    <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-brand-primary-container/30 rounded-full blur-[160px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-brand-tertiary-container/30 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-md-surface)_100%)]" />
            </div>

            <div className="container mx-auto px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-[1.2] text-center lg:text-left"
                    >


                        <h1 className="text-6xl md:text-[5.5rem] font-bold text-md-on-surface leading-[1.05] mb-8 tracking-[-0.03em]">
                            Environmental <br />
                            <Typewriter />
                        </h1>

                        <p className="text-xl text-md-on-surface-variant mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Pioneering <span className="text-md-on-surface font-semibold">biological preservation</span> through
                            <span className="text-brand-primary font-semibold ml-1">automated computational precision</span>.
                            Built for the next generation of compliance.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(92, 107, 192, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAuthClick('login')}
                                className="px-10 py-5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_auto] hover:bg-right transition-all duration-700 rounded-full text-white font-black text-xs tracking-[0.2em] flex items-center gap-4 shadow-xl shadow-brand-primary/20"
                            >
                                AUTHORIZE ACCESS <ArrowRight size={18} />
                            </motion.button>


                        </div>
                    </motion.div>

                    {/* M3 Visualization Component */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex-1 w-full max-w-lg hidden lg:block"
                    >
                        <motion.div
                            style={{ x: moveX, y: moveY }}
                            className="m3-card-elevated p-10 bg-md-surface-container-low/50 backdrop-blur-md border border-md-outline/10 relative overflow-hidden"
                        >
                            {/* Decorative background icon */}
                            <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12">
                                <Activity size={320} className="text-md-on-surface" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-14">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-inner">
                                        <Monitor size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-widest mb-0.5">System Status</p>
                                        <p className="text-md-on-surface font-bold text-lg">Optimized Environment</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { label: 'Ecology Compliance', val: '99.4%', color: 'bg-brand-primary' },
                                        { label: 'Resource Efficiency', val: 'Elite', color: 'bg-md-primary' },
                                        { label: 'Response Latency', val: '1.2ms', color: 'bg-md-secondary' }
                                    ].map((m, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-center mb-2.5 px-1">
                                                <span className="text-[11px] text-md-on-surface-variant font-medium uppercase tracking-wider">{m.label}</span>
                                                <span className="text-xs font-bold text-md-on-surface">{m.val}</span>
                                            </div>
                                            <div className="h-2 w-full bg-md-surface-variant/30 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: '85%' }}
                                                    transition={{ delay: 0.5 + (i * 0.1), duration: 1, ease: "circOut" }}
                                                    className={`h-full ${m.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom M3 Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-32"
                >
                    {[
                        { label: 'Sectors Monitored', value: '42+', icon: Waves },
                        { label: 'Accuracy Rating', value: '99.9%', icon: ShieldCheck },
                        { label: 'Daily Analytics', value: '1.4k', icon: Activity },
                        { label: 'Eco Projects', value: '300+', icon: Leaf },
                    ].map((stat, i) => (
                        <div key={i} className="m3-card-filled p-8 group hover:bg-md-surface-container-high transition-all">
                            <stat.icon size={26} className="text-brand-primary mb-5 transition-transform group-hover:scale-110" />
                            <h4 className="text-3xl font-bold text-md-on-surface mb-2">{stat.value}</h4>
                            <p className="text-[11px] font-medium text-md-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HeroLens;
