import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, LayoutDashboard, LifeBuoy } from 'lucide-react';
import { useAuth } from './AuthContext';

const NotFound = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-md w-full text-center"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-6">
                    Error 404
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Page Not Found
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                    The requested page could not be found, has been relocated, or is restricted to authorized personnel.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Home size={16} /> Home
                    </Link>

                    {user && (
                        <Link
                            to={user.role === 'Admin' || user.role === 'Application Engineer' ? '/admin' : '/dashboard'}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-sm"
                        >
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <LifeBuoy size={14} />
                    <span>Need assistance? Contact</span>
                    <a href="mailto:jaswanth@snenviro.in" className="font-semibold text-slate-700 hover:text-blue-600 underline">
                        jaswanth@snenviro.in
                    </a>
                    <span>or</span>
                    <a href="mailto:software@snenviro.in" className="font-semibold text-slate-700 hover:text-blue-600 underline">
                        software@snenviro.in
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
