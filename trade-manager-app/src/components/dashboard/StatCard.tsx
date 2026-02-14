import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    subValue: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    highlight?: boolean;
    danger?: boolean;
    success?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, trend, trendValue, highlight, danger, success }) => {
    return (
        <div className={`relative p-8 rounded-2xl transition-all duration-300 group overflow-hidden hover:-translate-y-1 ${danger
            ? 'bg-red-500/20 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:shadow-[0_0_70px_rgba(239,68,68,0.7)] hover:border-red-400 animate-pulse backdrop-blur-md'
            : `glass-panel hover:border-accent/50 hover:shadow-[0_0_30px_rgba(77,167,204,0.3)] ${success
                ? 'bg-emerald-500/5 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : highlight
                    ? 'bg-accent/5'
                    : 'bg-surface/50'}`
            }`}>
            {/* Background Glow */}
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[80px] ${danger ? 'bg-red-500/30 animate-pulse' : success ? 'bg-emerald-500/20' : highlight ? 'bg-accent/20' : 'bg-white/10'
                }`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{label}</span>
                    <div className={`p-2 rounded-lg ${highlight ? 'bg-accent/20 text-accent' : success ? 'bg-emerald-500/20 text-emerald-400' : danger ? 'bg-red-500/20 text-red-400' : 'bg-surface text-text-secondary'} border border-white/5`}>
                        {icon}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-3xl font-bold text-white">{value}</div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        {trend && (
                            <span className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'
                                }`}>
                                {trend === 'up' ? <ArrowUpRight size={12} strokeWidth={3} /> : trend === 'down' ? <ArrowDownRight size={12} strokeWidth={3} /> : null}
                                {trendValue}
                            </span>
                        )}
                        <span className="text-text-secondary opacity-50">{subValue}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
