import React, { useEffect, useState } from 'react';
import { startOfDay, startOfWeek, startOfMonth, isAfter, parseISO, format } from 'date-fns';
import { Wallet, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import { StatCard } from './dashboard/StatCard';
import { EquityChart } from './dashboard/EquityChart';
import { TradingCalendar } from './dashboard/TradingCalendar';
import { fetchAnalyticsData, AnalyticsData } from '../lib/analytics';
import { Session } from '@supabase/supabase-js';
import { OnboardingView } from './dashboard/OnboardingView';

interface DashboardProps {
    session: Session | null;
    currentPortfolio: number;
    initialCapital: number;
    targetWins: number;
    currentWins: number;
    projectedGrowth: number;
    stopLossLimit: number;
    stopLossEnabled: boolean;
    sessionCount: number;
    onNavigate: (view: 'trade' | 'settings' | 'history') => void;
}

export const AnalyticsDashboard: React.FC<DashboardProps> = ({
    session,
    initialCapital,
    sessionCount,
    onNavigate
}) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'today'>('all');

    useEffect(() => {
        if (!session?.user?.id) return;

        const loadAnalytics = async () => {
            try {
                const analytics = await fetchAnalyticsData(session.user.id, initialCapital);
                setData(analytics);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, [session, sessionCount, initialCapital]);

    if (loading) {
        return <div className="flex items-center justify-center p-12 text-text-secondary">Loading Analytics...</div>;
    }

    if (!data) return null;

    if (data.totalTrades === 0) {
        return <OnboardingView onNavigate={onNavigate} />;
    }

    // Filter Equity Curve based on selected time range
    const getFilteredEquityCurve = () => {
        if (timeRange === 'all') return data.equityCurve;

        const now = new Date();
        let cutoff: Date;

        switch (timeRange) {
            case 'today': cutoff = startOfDay(now); break;
            case 'week': cutoff = startOfWeek(now, { weekStartsOn: 1 }); break;
            case 'month': cutoff = startOfMonth(now); break;
            default: return data.equityCurve;
        }

        // Keep the 'Start' point if it exists, then filter actual dated points
        const datedPoints = data.equityCurve.filter(p => {
            if (p.date === 'Start' || !p.isoDate) return false;
            return isAfter(parseISO(p.isoDate), cutoff) || format(parseISO(p.isoDate), 'yyyy-MM-dd') === format(cutoff, 'yyyy-MM-dd');
        });

        if (datedPoints.length === 0) {
            // Find the last balance before this range to act as a starting point
            const previousPoints = data.equityCurve.filter(p => {
                if (p.date === 'Start' || !p.isoDate) return true;
                return !isAfter(parseISO(p.isoDate), cutoff);
            });
            const lastBalance = previousPoints.length > 0 ? previousPoints[previousPoints.length - 1].balance : initialCapital;
            return [{ date: 'Start', balance: lastBalance, tradeCount: 0, isoDate: cutoff.toISOString() }];
        }

        // Add a 'Start' point for the filtered view based on the preceding point
        const firstPointIdx = data.equityCurve.findIndex(p => p === datedPoints[0]);
        const precedingBalance = firstPointIdx > 0 ? data.equityCurve[firstPointIdx - 1].balance : initialCapital;
        const startIso = firstPointIdx > 0 && data.equityCurve[firstPointIdx - 1].isoDate
            ? new Date(parseISO(data.equityCurve[firstPointIdx - 1].isoDate!).getTime() + 1000).toISOString() // Slightly after preceding
            : new Date(cutoff.getTime() - 1000).toISOString(); // Slightly before cutoff

        return [{ date: 'Start', balance: precedingBalance, tradeCount: 0, isoDate: startIso }, ...datedPoints];
    };

    const filteredCurve = getFilteredEquityCurve();

    return (
        <div className="space-y-4">
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Net P&L"
                    value={`${data.netPnL >= 0 ? '+' : '-'}$${Math.abs(data.netPnL).toFixed(2)}`}
                    subValue="Total Profit/Loss"
                    icon={<Wallet size={20} />}
                    trend={data.netPnL >= 0 ? 'up' : 'down'}
                    trendValue={data.netPnL >= 0 ? '+' : '-'}
                    success={data.netPnL >= 0}
                    danger={data.netPnL < 0}
                />
                <StatCard
                    label="Win Rate"
                    value={`${data.winRate.toFixed(1)}%`}
                    subValue={`${data.totalWins} / ${data.totalTrades} Trades`}
                    icon={<Activity size={20} />}
                    trend="neutral"
                />
                <StatCard
                    label="Profit Factor"
                    value={data.profitFactor.toFixed(2)}
                    subValue="Gross Profit / Loss"
                    icon={<BarChart2 size={20} />}
                    trend={data.profitFactor > 1.5 ? 'up' : 'neutral'}
                />
                <StatCard
                    label="Avg Daily Return"
                    value={`$${data.avgDailyReturn.toFixed(2)}`}
                    subValue="Per Active Day"
                    icon={<TrendingUp size={20} />}
                    trend={data.avgDailyReturn > 0 ? 'up' : 'down'}
                />
            </div>

            {/* Middle Row: Equity Curve & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[350px]">
                {/* Equity Curve (Takes up 2/3) */}
                <div className="lg:col-span-2 glass-panel p-8 flex flex-col relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Equity Trajectory Alpha</h3>
                        <div className="flex bg-[#0B0E14]/50 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                            {(['today', 'week', 'month', 'all'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn ${timeRange === range
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="relative z-10">{range === 'all' ? 'All Time' : range}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <EquityChart data={filteredCurve} timeRange={timeRange} />
                    </div>
                </div>

                {/* Calendar (Takes up 1/3) */}
                <div className="lg:col-span-1 h-full">
                    <TradingCalendar data={data.calendarData} />
                </div>
            </div>
        </div>
    );
};
