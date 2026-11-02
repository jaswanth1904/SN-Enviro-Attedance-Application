import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Inbox,
    title = 'No records found',
    description = 'There are no items to display at this time.',
    actionLabel,
    onAction,
    className = ''
}) => {
    return (
        <div className={`w-full py-12 px-6 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center ${className}`}>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Icon size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
