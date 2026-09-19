import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
    LayoutDashboard, Users, CalendarCheck, Map,
    Megaphone, Bell, CalendarClock, BarChart3,
    Building2, Settings, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, badge, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                isActive 
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`
        }
    >
        <Icon size={20} className="shrink-0" />
        
        <AnimatePresence>
            {!collapsed && (
                <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate text-sm flex-1"
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>

        {badge && !collapsed && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {badge}
            </span>
        )}
        {badge && collapsed && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
        )}
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
                {label}
            </div>
        )}
    </NavLink>
);

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { to: '/admin/overview', icon: LayoutDashboard, label: 'Overview' },
        { to: '/admin/employees', icon: Users, label: 'Employee Management' },
        { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance Management' },
        { to: '/admin/live-tracking', icon: Map, label: 'Live Field Tracking' },
        { to: '/admin/announcements', icon: Megaphone, label: 'MD Announcements' },
        { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: '3' },
        { to: '/admin/leaves', icon: CalendarClock, label: 'Leave Management' },
        { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
        { to: '/admin/departments', icon: Building2, label: 'Departments & Sites' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 280 }}
                className="hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 z-40 transition-all duration-300"
            >
                <div className="p-6 flex items-center justify-between">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col"
                            >
                                <span className="text-xl font-bold text-[#22223b]" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>
                                    SN Enviro.
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">Control Center</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors ${collapsed ? 'mx-auto' : ''}`}
                    >
                        <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2 space-y-1">
                    {navItems.map((item, index) => (
                        <SidebarItem key={index} {...item} collapsed={collapsed} />
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 flex flex-col gap-2">

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 w-full transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!collapsed && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-[#22223b]" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>SN Enviro.</span>
                    </div>
                    <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileOpen(false)}
                                className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
                            />
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col md:hidden shadow-2xl"
                            >
                                <div className="p-6 flex items-center justify-between border-b border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold text-[#22223b]" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>SN Enviro.</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">Control Center</span>
                                    </div>
                                    <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                    {navItems.map((item, index) => (
                                        <div key={index} onClick={() => setMobileOpen(false)}>
                                            <SidebarItem {...item} collapsed={false} />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-100 flex flex-col gap-2">

                                    <button
                                        onClick={() => { setMobileOpen(false); handleLogout(); }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
                                    >
                                        <LogOut size={20} className="shrink-0" />
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto bg-slate-50 relative p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
