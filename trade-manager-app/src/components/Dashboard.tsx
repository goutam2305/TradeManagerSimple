import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Wallet, ListChecks } from 'lucide-react';

interface DashboardProps {
    currentPortfolio: number;
    initialCapital: number;
    totalTrades: number;
    targetWins: number;
    currentWins: number;
    currentTradeAmount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
    currentPortfolio,
    initialCapital,
    totalTrades,
    targetWins,
    currentWins,
    currentTradeAmount
}) => {
    const winRatePercent = (currentWins / (totalTrades || 1)) * 100;
    const portfolioGrowth = ((currentPortfolio - initialCapital) / initialCapital) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <StatCard
                label="Current Portfolio"
                value={`$${currentPortfolio.toFixed(2)}`}
                subValue={`${portfolioGrowth >= 0 ? '+' : ''}${portfolioGrowth.toFixed(2)}% Growth`}
                icon={<Wallet className="text-blue-400" size={20} />}
            />
            <StatCard
                label="Next Trade Amount"
                value={`$${currentTradeAmount.toFixed(2)}`}
                subValue="Calculated by Matrix"
                icon={<TrendingUp className="text-emerald-400" size={20} />}
                accent
            />
            <StatCard
                label="Win Progress"
                value={`${currentWins} / ${targetWins}`}
                subValue={`Target Win Rate: ${((targetWins / totalTrades) * 100).toFixed(1)}%`}
                icon={<Award className="text-amber-400" size={20} />}
            />
            <StatCard
                label="Trades Done"
                value={`${currentWins + (0)} / ${totalTrades}`}
                subValue="Session Progress"
                icon={<ListChecks className="text-purple-400" size={20} />}
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
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, accent }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-panel p-5 rounded-2xl flex flex-col justify-between h-32 ${accent ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
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
