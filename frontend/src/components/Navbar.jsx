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

                {/* Actions Section */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <button
                            onClick={() => onAuthClick('login')}
                            className="text-sm font-bold text-slate-700 hover:text-black transition-colors"
                        >
                            Login / Sign Up
                        </button>
                    ) : (
                        <>
                            {/* Desktop Profile Dropdown Trigger */}
                            <div className="hidden md:block relative">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full hover:bg-slate-100 transition-all border border-slate-200/80 shadow-xs"
                                >
                                    <span className="text-xs font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                                        {user.name.charAt(0)}
                                    </div>
                                    <ChevronDown size={14} className={`mr-1 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-4 z-50"
                                        >
                                            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-slate-800 font-bold text-sm truncate leading-tight mb-0.5">{user.name}</p>
                                                    <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest leading-none mb-1">{user.role}</p>
                                                    <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 px-1 space-y-1">
                                                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</div>
                                                <Link to="/dashboard" onClick={closeAll} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all">
                                                    <LayoutDashboard size={16} className="text-blue-600" /> Dashboard
                                                </Link>
                                                
                                                {user?.role !== 'Admin' && (
                                                    <Link to="/log-site" onClick={closeAll} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all">
                                                        <MapPin size={16} className="text-emerald-600" /> Log Site Visit
                                                    </Link>
                                                )}

                                                {(user.role === 'Admin' || user.role === 'Application Engineer') && (
                                                    <>
                                                        <Link to="/live-map" onClick={closeAll} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all">
                                                            <Map size={16} className="text-purple-600" /> MD Live Map
                                                        </Link>
                                                        <Link to="/admin" onClick={closeAll} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all">
                                                            <ShieldAlert size={16} className="text-blue-600" /> Admin Panel
                                                        </Link>
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                <button
                                                    onClick={() => { logout(); closeAll(); }}
                                                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all"
                                                >
                                                    <LogOut size={15} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Single Action Button (Eliminates collision on mobile) */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all"
                                aria-label="Toggle navigation menu"
                            >
                                <span className="text-xs font-bold text-slate-800 max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="pr-1 text-slate-500">
                                    {isOpen ? <X size={16} /> : <Menu size={16} />}
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Mobile Drawer Overlay & Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeAll}
                            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-2xl p-5 z-50 rounded-b-3xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="space-y-4">
                                {!user ? (
                                    <button
                                        onClick={() => { onAuthClick('login'); closeAll(); }}
                                        className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-md"
                                    >
                                        Login / Sign Up
                                    </button>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-sm shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider mb-0.5">{user.role}</p>
                                                <h3 className="text-base font-bold text-slate-900 truncate leading-tight">{user.name}</h3>
                                                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 pt-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Navigation</div>
                                            <Link to="/dashboard" onClick={closeAll} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 text-xs active:scale-98 transition-all">
                                                <LayoutDashboard size={18} className="text-blue-600" /> My Attendance Dashboard
                                            </Link>
                                            
                                            {user?.role !== 'Admin' && (
                                                <Link to="/log-site" onClick={closeAll} className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 font-bold text-emerald-800 text-xs active:scale-98 transition-all">
                                                    <MapPin size={18} className="text-emerald-600" /> Log Site Visit
                                                </Link>
                                            )}

                                            {(user.role === 'Admin' || user.role === 'Application Engineer') && (
                                                <>
                                                    <Link to="/live-map" onClick={closeAll} className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 font-bold text-purple-800 text-xs active:scale-98 transition-all">
                                                        <Map size={18} className="text-purple-600" /> MD Live Tracking Map
                                                    </Link>
                                                    <Link to="/admin" onClick={closeAll} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 text-xs active:scale-98 transition-all">
                                                        <ShieldAlert size={18} className="text-blue-600" /> Admin Control Panel
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() => { logout(); closeAll(); }}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 active:scale-98 transition-all"
                                            >
                                                <LogOut size={16} /> Log Out of Portal
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
