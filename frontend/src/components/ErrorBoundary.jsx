import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('CRITICAL APP ERROR:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 shadow-xl shadow-red-500/10">
                        <AlertTriangle size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">System Interruption</h1>
                    <p className="text-slate-500 max-w-md mb-8">
                        The SN Enviro Portal encountered an unexpected runtime error. This has been logged for our engineering team.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary flex items-center gap-2 py-3 px-8 shadow-indigo-500/20 shadow-lg"
                    >
                        <RefreshCw size={18} />
                        Restore Portal Access
                    </button>
                    <p className="mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]"> SN Enviro Critical Systems </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
