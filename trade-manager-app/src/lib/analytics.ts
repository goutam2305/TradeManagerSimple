import { supabase } from '../supabaseClient';
import { format, parseISO } from 'date-fns';

export interface AnalyticsData {
    netPnL: number;
    winRate: number;
    profitFactor: number;
    avgDailyReturn: number;
    equityCurve: { date: string; balance: number; tradeCount: number; isoDate?: string }[];
    calendarData: { date: string; pnl: number; count: number }[];
    totalTrades: number;
    totalWins: number;
}

export const fetchAnalyticsData = async (userId: string, initialCapital: number): Promise<AnalyticsData> => {
    // 1. Fetch all completed sessions
    const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', false)
        .order('created_at', { ascending: true });

    if (sessionError) {
        console.error("Analytics: Error fetching sessions", sessionError);
        throw sessionError;
    }

    if (!sessions || sessions.length === 0) {
        return {
            netPnL: 0,
            winRate: 0,
            profitFactor: 0,
            avgDailyReturn: 0,
            equityCurve: [{ date: 'Start', balance: initialCapital, tradeCount: 0 }],
            calendarData: [],
            totalTrades: 0,
            totalWins: 0
        };
    }

    // 2. Process Metrics
    let totalTrades = 0;
    let totalWins = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let currentBalance = initialCapital;

    // Use first session date as reference for the 'Start' point
    const firstSessionDate = sessions.length > 0 ? parseISO(sessions[0].created_at) : new Date();
    const startDate = new Date(firstSessionDate.getTime() - 60000).toISOString();

    const equityCurve: AnalyticsData['equityCurve'] = [{
        date: 'Start',
        balance: initialCapital,
        tradeCount: 0,
        isoDate: startDate
    }];
    const dailyPnL: Record<string, number> = {};
    const dailyTradeCounts: Record<string, number> = {};

    sessions.forEach(session => {
        const sessionPnL = (session.final_capital || 0) - (session.initial_capital || 0);

        // Global Stats
        totalTrades += session.total_trades || 0;
        totalWins += session.total_wins || 0;

        if (sessionPnL > 0) grossProfit += sessionPnL;
        else grossLoss += Math.abs(sessionPnL);

        // Equity Curve (Session-based points for smoother rendering)
        currentBalance += sessionPnL;
        equityCurve.push({
            date: format(parseISO(session.created_at), 'MMM d'),
            balance: Number(currentBalance.toFixed(2)),
            tradeCount: totalTrades,
            isoDate: session.created_at
        });

        // Calendar Data
        const dayKey = format(parseISO(session.created_at), 'yyyy-MM-dd');
        dailyPnL[dayKey] = (dailyPnL[dayKey] || 0) + sessionPnL;
        dailyTradeCounts[dayKey] = (dailyTradeCounts[dayKey] || 0) + (session.total_trades || 0);
    });

    // 3. Final Calculations
    const netPnL = currentBalance - initialCapital;
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0; // Handle infinity

    // Avg Daily Return
    const activeDays = Object.keys(dailyPnL).length;
    const avgDailyReturn = activeDays > 0 ? netPnL / activeDays : 0;

    // Calendar Data Array
    const calendarData = Object.keys(dailyPnL).map(date => ({
        date,
        pnl: dailyPnL[date],
        count: dailyTradeCounts[date]
    }));

    return {
        netPnL,
        winRate,
        profitFactor,
        avgDailyReturn,
        equityCurve,
        calendarData,
        totalTrades,
        totalWins
    };
};
