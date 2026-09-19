import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white py-12 px-8 md:px-12 border-t border-slate-100 relative z-20">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <Link to="/" className="flex flex-col text-center md:text-left">
                    <span className="text-2xl font-bold text-[#22223b]" style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)' }}>SN Enviro.</span>
                    <span className="text-xs text-slate-400 mt-2 tracking-wide font-light">High-performance workforce management.</span>
                </Link>

                <div className="flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <button onClick={() => alert('Privacy Policy: All data is securely encrypted and stored following enterprise standards.')} className="hover:text-slate-800 transition-colors">Privacy</button>
                    <button onClick={() => alert('Terms of Service: Authorized personnel only. Usage is strictly monitored for enterprise security.')} className="hover:text-slate-800 transition-colors">Terms</button>
                    <a href="mailto:jaswanth@snenviro.in" className="hover:text-slate-800 transition-colors">Contact</a>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-50 flex justify-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">© {new Date().getFullYear()} SN Enviro. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
