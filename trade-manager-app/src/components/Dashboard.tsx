import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ListChecks, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface DashboardProps {
    currentPortfolio: number;
    initialCapital: number;
    targetWins: number;
    currentWins: number;
    projectedGrowth: number;
    stopLossLimit: number;
    stopLossEnabled: boolean;
    sessionCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
    currentPortfolio,
    initialCapital,
    targetWins,
    currentWins,
    projectedGrowth,
    stopLossLimit,
    stopLossEnabled,
    sessionCount
}) => {
    const portfolioGrowth = ((currentPortfolio - initialCapital) / initialCapital) * 100;
    const currentDrawdown = currentPortfolio < initialCapital
        ? ((initialCapital - currentPortfolio) / initialCapital) * 100
        : 0;

    const riskStatus = (() => {
        if (!stopLossEnabled) return { label: 'Risk Monitoring', value: 'Disabled', sub: 'Safety Alert Off', color: 'text-slate-500', icon: <ShieldCheck size={20} /> };

        if (currentDrawdown >= stopLossLimit) {
            return { label: 'STOP TRADING', value: 'CRITICAL', sub: 'Beyond Risk Limit!', color: 'text-red-500', icon: <ShieldAlert size={20} className="animate-pulse" />, critical: true };
        }

        if (currentDrawdown >= stopLossLimit * 0.8) {
            return { label: 'Risk Warning', value: 'High', sub: 'Approaching Limit', color: 'text-amber-500', icon: <AlertTriangle size={20} /> };
        }

        return { label: 'Risk Level', value: 'Low', sub: `Drawdown: ${currentDrawdown.toFixed(2)}%`, color: 'text-emerald-500', icon: <ShieldCheck size={20} /> };
    })();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
            <StatCard
                label="Portfolio Equity"
                value={`$${currentPortfolio.toFixed(2)}`}
                subValue={`${portfolioGrowth >= 0 ? '+' : ''}${portfolioGrowth.toFixed(2)}% Growth`}
                icon={<Wallet className="text-blue-400" size={20} />}
            />
            <StatCard
                label="Projected Growth"
                value={`${projectedGrowth.toFixed(2)}%`}
                subValue={`Return: $${(initialCapital * projectedGrowth / 100).toFixed(2)}`}
                icon={<TrendingUp className="text-emerald-400" size={20} />}
                accent
            />
            <StatCard
                label={riskStatus.label}
                value={riskStatus.value}
                subValue={riskStatus.sub}
                icon={<div className={riskStatus.color}>{riskStatus.icon}</div>}
                accent={riskStatus.critical}
                danger={riskStatus.critical}
            />
            <StatCard
                label="Target Progress"
                value={`${currentWins} / ${targetWins}`}
                subValue={`Phase Goal: ${targetWins} Wins`}
                icon={<ListChecks className="text-amber-400" size={20} />}
            />
            <StatCard
                label="Session Count"
                value={`#${sessionCount}`}
                subValue="Active Session"
                icon={<ListChecks className="text-slate-400" size={20} />}
            />
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string;
    subValue: string;
    icon: React.ReactNode;
    accent?: boolean;
    danger?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, accent, danger }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={danger ? {
            opacity: 1,
            y: 0,
            scale: [1, 1.02, 1],
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
        } : {
            opacity: 1,
            y: 0,
            scale: 1,
            backgroundColor: accent ? 'rgba(59, 130, 246, 0.05)' : 'rgba(20, 20, 23, 1)'
        }}
        transition={danger ? {
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            backgroundColor: { duration: 0.3 }
        } : { duration: 0.3 }}
        className={`glass-panel p-5 rounded-2xl flex flex-col justify-between h-32 transition-all duration-500 ${danger ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
            accent ? 'border-blue-500/30' : ''
            }`}
    >
        <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-mono font-bold">{value}</p>
            <p className="text-[10px] text-text-secondary mt-1">{subValue}</p>
        </div>
    </motion.div>
);
