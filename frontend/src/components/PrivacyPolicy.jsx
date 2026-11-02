import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, MapPin, Eye, FileText, CheckCircle2 } from 'lucide-react';

const PrivacyPolicy = () => {
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
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Privacy Policy
                            </h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                                SN Enviro Attendance & Workforce Portal · Effective November 2026
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mt-4">
                        SN Enviro Critical Systems ("SN Enviro", "Company", "we", "us") values employee privacy. This Privacy Policy outlines our transparent protocols for collecting, processing, and safeguarding workforce data via the SN Enviro Attendance Application (<a href="https://attendance.snenviro.org" className="text-blue-600 underline">attendance.snenviro.org</a>).
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
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Scope & Information Collected</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    The portal collects only essential operational information required to verify identity, record attendance, and manage field site assignments:
                                </p>
                                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                    <li><strong>Identity Data:</strong> Full name, official corporate email, registered contact number, department, and role.</li>
                                    <li><strong>Attendance Records:</strong> Time-stamped check-in and check-out logs, total daily shift hours, and overtime calculations.</li>
                                    <li><strong>Leave & Absence Records:</strong> Submitted leave requests, supporting medical certificates/documents, and reason explanations.</li>
                                    <li><strong>Field Telemetry:</strong> Industrial plant site visit logs, client facility notes, and travel durations.</li>
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
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Work-Hours Geolocation Policy</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    SN Enviro maintains strict ethical location tracking policies:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2.5 text-sm text-slate-700">
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Shift-Bound Only:</strong> GPS coordinates are captured only at the moment of punch-in and during active work hours while checked in.</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-sm text-slate-700">
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Automatic Termination:</strong> Geolocation tracking terminates automatically upon manual checkout or at 7:00 PM IST auto-checkout cutoff.</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-sm text-slate-700">
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Zero Off-Hours Surveillance:</strong> The portal does not track, record, or store employee location on weekends (Sundays) or after duty hours.</span>
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
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Data Security & Storage</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    We employ multi-layered industry safeguards to protect corporate and employee data:
                                </p>
                                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                    <li><strong>Encryption in Transit:</strong> All communications between the browser and backend are enforced over TLS 1.3 / HTTPS.</li>
                                    <li><strong>Database Security:</strong> Data is persisted in an encrypted MongoDB Atlas cluster with IP access controls and automated backups.</li>
                                    <li><strong>Authentication & Passwords:</strong> Passwords are cryptographically hashed using salted bcrypt prior to storage; plaintext passwords are never stored.</li>
                                    <li><strong>Role-Based Access:</strong> Administrative records, salaries, and personnel details are gated strictly behind authenticated role checks.</li>
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
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Automated Management Reporting</h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Every working day (Monday through Saturday) at 11:30 AM IST, the portal generates a consolidated executive attendance report transmitted securely via encrypted email to authorized company officers (Sales, Operations, General Management). No reports are sent on Sundays.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                5
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Employee Rights & Contact</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    Employees have the right to review their attendance history directly within their portal profile, request corrections for disputed records through HR, and report technical discrepancies.
                                </p>
                                <p className="text-sm text-slate-600">
                                    For inquiries regarding this policy or system data handling, please contact{' '}
                                    <a href="mailto:jaswanth@snenviro.in" className="font-semibold text-blue-600 underline">
                                        jaswanth@snenviro.in
                                    </a>{' '}
                                    or{' '}
                                    <a href="mailto:software@snenviro.in" className="font-semibold text-blue-600 underline">
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

export default PrivacyPolicy;
