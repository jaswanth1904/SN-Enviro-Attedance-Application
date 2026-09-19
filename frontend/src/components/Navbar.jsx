import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useGeolocation } from './useGeolocation';
import { LogOut, User, Menu, X, MapPin, ShieldAlert, Zap, LayoutDashboard, Activity, ChevronDown, Navigation, Map, UserCog, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link to={to} className="group flex flex-col items-center">
        <div className={`relative px-6 py-1.5 rounded-full transition-all duration-300 ${active ? 'bg-blue-100 text-blue-700' : 'text-md-on-surface-variant hover:bg-md-surface-variant/10'}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={`mt-1 text-[11px] font-medium tracking-wide transition-colors ${active ? 'text-md-on-surface' : 'text-md-on-surface-variant'}`}>
            {label}
        </span>
    </Link>
);

const Navbar = ({ onAuthClick }) => {
    const { user, logout } = useAuth();
    const { city, fullAddress, error: geoError } = useGeolocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeAll = () => {
        setIsOpen(false);
        setShowProfile(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 border-b border-md-outline/10 h-16 shadow-md' : 'bg-transparent h-24'}`}>
            <nav className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo Section */}
                <Link to={user && user.role === 'Admin' ? '/admin' : '/'} className="flex items-center gap-3 group" onClick={closeAll}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[#22223b]" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>SN Enviro.</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1">
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4">

                    {!user ? (
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => onAuthClick('login')}
                                className="text-sm font-bold text-slate-700 hover:text-black transition-colors"
                            >
                                Login / Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-3 p-1 rounded-full hover:bg-md-surface-variant/20 transition-all border border-md-outline/10"
                                >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold uppercase">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-md-on-surface pr-1">{user.name.split(' ')[0]}</span>
                                <ChevronDown size={14} className={`mr-2 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-slate-100 border border-md-outline/10 rounded-[28px] overflow-hidden shadow-2xl p-4"
                                    >
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary/20 via-brand-secondary/20 to-brand-tertiary/20 border border-brand-primary/10 flex items-center justify-center text-brand-primary text-xl font-black">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-md-on-surface font-bold truncate leading-tight mb-0.5">{user.name}</p>
                                                <p className="text-brand-primary text-[9px] font-black uppercase tracking-widest leading-none mb-1">{user.role}</p>
                                                <p className="text-md-on-surface-variant text-[10px] truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 px-2 space-y-1">
                                            <div className="px-4 py-2 text-[11px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Account</div>
                                            
                                            <div className="px-4 py-2 mt-2 text-[11px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Navigation</div>
                                            <Link to="/dashboard" onClick={closeAll} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-medium transition-all group">
                                                <LayoutDashboard size={18} className="group-hover:text-brand-primary" /> Dashboard
                                            </Link>
                                            
                                            {user?.role !== 'Admin' && (
                                                <>
                                                    <div className="px-4 py-2 mt-2 text-[11px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Attendance & Tracking</div>
                                                    <Link to="/mark-attendance" onClick={closeAll} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-medium transition-all group">
                                                        <Navigation size={18} className="group-hover:text-brand-primary" /> Mark Geo-Attendance
                                                    </Link>
                                                    <Link to="/log-site" onClick={closeAll} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-medium transition-all group">
                                                        <MapPin size={18} className="group-hover:text-brand-primary" /> Log Site Visit
                                                    </Link>
                                                </>
                                            )}

                                            {(user.role === 'Admin' || user.role === 'Application Engineer') && (
                                                <>
                                                    <div className="px-4 py-2 mt-2 text-[11px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Admin Control</div>
                                                    <Link to="/live-map" onClick={closeAll} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-medium transition-all group">
                                                        <Map size={18} className="group-hover:text-brand-primary" /> MD Live Map
                                                    </Link>
                                                    <Link to="/admin" onClick={closeAll} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-medium transition-all group">
                                                        <ShieldAlert size={18} className="group-hover:text-brand-primary" /> Admin Panel
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-md-outline/10">
                                            <button
                                                onClick={() => { logout(); closeAll(); }}
                                                className="w-full flex items-center justify-center gap-2 p-3 rounded-full bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all"
                                            >
                                                <LogOut size={18} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-full hover:bg-md-surface-variant/20 text-md-on-surface"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-0 left-0 right-0 h-screen bg-md-surface pt-24 px-6 z-[-1]"
                    >
                        <div className="space-y-4">
                            {!user ? (
                                <button
                                    onClick={() => { onAuthClick('login'); closeAll(); }}
                                    className="w-full py-4 bg-brand-primary text-brand-on-primary rounded-full font-bold text-lg"
                                >
                                    Login / Sign Up
                                </button>
                            ) : (
                                <>
                                    <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-200 mb-6">
                                        <p className="text-xs text-brand-primary font-bold uppercase tracking-widest mb-1">{user.role}</p>
                                        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Link to="/dashboard" onClick={closeAll} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 active:scale-95 transition-transform shadow-sm">
                                            <LayoutDashboard size={20} className="text-brand-primary" /> My Dashboard
                                        </Link>
                                        
                                        {user?.role !== 'Admin' && (
                                            <>
                                                <Link to="/mark-attendance" onClick={closeAll} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-700 active:scale-95 transition-transform shadow-sm">
                                                    <Navigation size={20} /> Mark Geo-Attendance
                                                </Link>
                                                <Link to="/log-site" onClick={closeAll} className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-700 active:scale-95 transition-transform shadow-sm">
                                                    <MapPin size={20} /> Log Site Visit
                                                </Link>
                                            </>
                                        )}

                                        {(user.role === 'Admin' || user.role === 'Application Engineer') && (
                                            <>
                                                <Link to="/live-map" onClick={closeAll} className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 border border-purple-200 font-bold text-purple-700 active:scale-95 transition-transform shadow-sm">
                                                    <Map size={20} /> MD Live Tracking Map
                                                </Link>
                                                <Link to="/admin" onClick={closeAll} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 active:scale-95 transition-transform shadow-sm">
                                                    <ShieldAlert size={20} className="text-brand-primary" /> Admin Panel
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => { logout(); closeAll(); }}
                                        className="w-full mt-8 p-4 rounded-xl bg-red-50 text-red-600 font-bold border border-red-200"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
