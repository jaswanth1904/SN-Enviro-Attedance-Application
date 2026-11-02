import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldAlert, CheckCircle2, Scale } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors mb-8"
                >
                    <ArrowLeft size={16} /> Back to Portal
                </Link>

                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Scale size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Terms of Service
                            </h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                                SN Enviro Attendance & Workforce Portal · Updated November 2026
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mt-4">
                        By accessing or logging into the SN Enviro Workforce Portal (<a href="https://attendance.snenviro.org" className="text-indigo-600 underline">attendance.snenviro.org</a>), employees, engineers, contractors, and administrative staff agree to comply with the following institutional terms and conditions.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                1
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Authorized Personnel Only</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    Access to this portal is strictly limited to verified employees and authorized contractors of SN Enviro Critical Systems Pvt Ltd.
                                </p>
                                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                    <li>Credentials (email and password) are personal and non-transferable.</li>
                                    <li>Sharing login credentials with colleagues or third parties is strictly prohibited.</li>
                                    <li>Employees are obligated to immediately report any suspected credential compromise to IT/Admin.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                2
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Attendance Integrity & Anti-Fraud</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    Accurate attendance data is vital for workplace safety, project coordination, and payroll processing:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2.5 text-sm text-slate-700">
                                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                        <span><strong>Accurate Geo-Verification:</strong> Check-ins must represent genuine physical presence at the designated office, plant site, or client premises.</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-sm text-slate-700">
                                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                        <span><strong>Prohibition of Spoofing:</strong> Utilizing mock GPS providers, proxy tunnels, automated punch bots, or VPNs to forge attendance location is a zero-tolerance compliance violation.</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-sm text-slate-700">
                                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                        <span><strong>Proxy Check-in Prohibition:</strong> Marking attendance on behalf of another employee will result in disciplinary and payroll sanctions for both parties involved.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                3
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Operational Timing & Weekly Offs</h2>
                                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                    <li><strong>Opening Window:</strong> Regular daily attendance check-in opens at 9:30 AM IST Monday through Saturday.</li>
                                    <li><strong>Late Escalations:</strong> Check-ins logged after 10:30 AM trigger automatic escalation alerts and require submitting an absence/delay explanation for HR review.</li>
                                    <li><strong>Auto-Checkout:</strong> All open engineer shifts automatically conclude at 7:00 PM IST to protect against orphaned sessions.</li>
                                    <li><strong>Sundays:</strong> Sunday is an institutional weekly off. Attendance check-in is locked and automated notification crons are silenced.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                4
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">System Auditing & Enforcement</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    Administrative supervisors and Managing Directors maintain real-time oversight of plant site logs, live active shift indicators, and monthly attendance sheets. Violations of these terms may result in formal disciplinary action, leave quota deductions, or revoking portal access.
                                </p>
                                <p className="text-sm text-slate-600">
                                    For support or dispute resolution, contact{' '}
                                    <a href="mailto:jaswanth@snenviro.in" className="font-semibold text-indigo-600 underline">
                                        jaswanth@snenviro.in
                                    </a>{' '}
                                    or{' '}
                                    <a href="mailto:software@snenviro.in" className="font-semibold text-indigo-600 underline">
                                        software@snenviro.in
                                    </a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} SN Enviro Critical Systems Pvt Ltd. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
