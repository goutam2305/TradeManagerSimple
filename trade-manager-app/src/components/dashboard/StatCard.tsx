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
        <div className={`relative p-4 rounded-2xl border transition-all duration-300 group overflow-hidden ${danger
            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
            : success
                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                : highlight
                    ? 'bg-gradient-to-br from-accent/10 to-transparent border-white/5'
                    : 'bg-panel border-white/5 hover:border-white/10'
            }`}>
            {/* Glow effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] transition-opacity duration-500 ${danger ? 'bg-red-500/10' : success ? 'bg-emerald-500/10' : highlight ? 'bg-accent/10' : 'bg-white/5 group-hover:bg-white/10'
                }`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${success ? 'text-emerald-400' : danger ? 'text-red-400' : 'text-text-secondary'}`}>{label}</span>
                    <div className={`p-2 rounded-lg ${highlight ? 'bg-accent/10 text-accent' : success ? 'bg-emerald-500/10 text-emerald-400' : danger ? 'bg-red-500/10 text-red-400' : 'bg-surface border border-white/5 text-text-secondary'}`}>
                        {icon}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>

                    <div className="flex items-center gap-2 text-xs">
                        {trend && (
                            <span className={`flex items-center gap-0.5 font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'
                                }`}>
                                {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
                                {trendValue}
                            </span>
                        )}
                        <span className="text-text-secondary opacity-70">{subValue}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
