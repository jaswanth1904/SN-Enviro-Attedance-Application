import React from 'react';
import { Mail, MapPin, Phone, Globe, Shield, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-md-surface-container text-md-on-surface-variant py-20 px-8 md:px-12 border-t border-md-outline/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold shadow-sm">SN</div>
                            <span className="text-2xl font-bold text-md-on-surface tracking-tight">SN Enviro <span className="text-brand-primary">Solutions</span></span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed mb-8 max-w-md opacity-70">
                            Pioneering environmental intelligence with state-of-the-art monitoring solutions across India. Committed to operational transparency and digital-first attendance tracking.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="w-10 h-10 rounded-full bg-md-surface-container-high flex items-center justify-center hover:text-brand-primary transition-colors border border-md-outline/10">
                                <Shield size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-md-surface-container-high flex items-center justify-center hover:text-brand-primary transition-colors border border-md-outline/10">
                                <Globe size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-md-surface-container-high flex items-center justify-center hover:text-brand-primary transition-colors border border-md-outline/10">
                                <ExternalLink size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 col-span-1 md:col-span-2 gap-12">
                        <div>
                            <h4 className="text-md-on-surface font-bold mb-8 text-[11px] uppercase tracking-[0.3em] opacity-40">Intelligence</h4>
                            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
                                <li><a href="#" className="hover:text-brand-primary transition-colors">CAAQMS Control</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">CEMS Analytics</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">Effluent Logs</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">IoT Networks</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-md-on-surface font-bold mb-8 text-[11px] uppercase tracking-[0.3em] opacity-40">Terminal</h4>
                            <div className="space-y-6 text-xs font-bold uppercase tracking-widest">
                                <p className="flex items-start gap-4">
                                    <MapPin size={16} className="text-brand-primary flex-shrink-0" />
                                    <span className="leading-5">HQ: Hyderabad,<br />Telangana, IN</span>
                                </p>
                                <p className="flex items-center gap-4">
                                    <Phone size={16} className="text-brand-primary flex-shrink-0" />
                                    <span className="tracking-tight">+91 73309 33306</span>
                                </p>
                                <p className="flex items-center gap-4">
                                    <Mail size={16} className="text-brand-primary flex-shrink-0" />
                                    <span className="lowercase tracking-normal">info@snenviro.com</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-md-outline/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">© 2026 SN ENVIRO NODE. ALL SYSTEMS NOMINAL.</p>
                    <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-widest opacity-30">
                        <a href="#" className="hover:text-md-on-surface transition-colors">SEC-DATA</a>
                        <a href="#" className="hover:text-md-on-surface transition-colors">LIC-AUTH</a>
                        <a href="#" className="hover:text-md-on-surface transition-colors">OPS-SUPPORT</a>
                    </div>
                </div>
            </div>

            {/* Ambient Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        </footer>
    );
};

export default Footer;
