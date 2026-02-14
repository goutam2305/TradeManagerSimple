import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { fetchAnalyticsData } from '../lib/analytics';

export interface ExportOptions {
    userId: string;
    userEmail?: string;
    sessionIds?: string[]; // If provided, only export these sessions
    includeUserSummary?: boolean;
}

export const exportTradeData = async ({ userId, userEmail, sessionIds, includeUserSummary = false }: ExportOptions) => {
    try {
        let profile = null;
        let initialCapital = 0;
        let analytics = null;

        // 1. Fetch User Profile & Configuration (Only if requested)
        if (includeUserSummary) {
            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('full_name, bio')
                .eq('id', userId)
                .single();
            profile = profileData;

            const { data: config } = await supabase
                .from('protected_configs')
                .select('capital')
                .eq('user_id', userId)
                .single();

            initialCapital = config?.capital || 0;

            // 2. Fetch Analytics Data
            analytics = await fetchAnalyticsData(userId, initialCapital);
        }

        // 3. Fetch Sessions
        let sessionQuery = supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .is('is_active', false)
            .order('created_at', { ascending: false });

        if (sessionIds && sessionIds.length > 0) {
            sessionQuery = sessionQuery.in('id', sessionIds);
        }

        const { data: sessions, error: sessionError } = await sessionQuery;
        if (sessionError) throw sessionError;

        // 4. Fetch Trades
        let trades: any[] = [];
        if (sessions && sessions.length > 0) {
            const targetIds = sessions.map(s => s.id);
            const { data: fetchedTrades, error: tradesError } = await supabase
                .from('trades')
                .select('*')
                .in('session_id', targetIds)
                .order('created_at', { ascending: true });

            if (tradesError) throw tradesError;
            trades = fetchedTrades || [];
        }

        // 5. Create Excel Workbook
        const wb = XLSX.utils.book_new();

        // Build User Summary Data (Only if requested)
        if (includeUserSummary && analytics) {
            const summaryData = [
                { 'Section': 'USER PROFILE', 'Metric': '', 'Value': '' },
                { 'Section': '', 'Metric': 'Full Name', 'Value': profile?.full_name || 'N/A' },
                { 'Section': '', 'Metric': 'Email', 'Value': userEmail || 'N/A' },
                { 'Section': '', 'Metric': 'Bio', 'Value': profile?.bio || '' },
                { 'Section': '', 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString() },
                { 'Section': '', 'Metric': '', 'Value': '' }, // Spacer

                { 'Section': 'PERFORMANCE METRICS', 'Metric': '', 'Value': '' },
                { 'Section': '', 'Metric': 'Initial Capital', 'Value': initialCapital },
                { 'Section': '', 'Metric': 'Current Equity', 'Value': (initialCapital + analytics.netPnL) },
                { 'Section': '', 'Metric': 'Net P&L', 'Value': analytics.netPnL },
                { 'Section': '', 'Metric': 'Win Rate', 'Value': (analytics.winRate / 100) }, // Format as % in Excel if possible, or string '55.5%'
                { 'Section': '', 'Metric': 'Profit Factor', 'Value': analytics.profitFactor },
                { 'Section': '', 'Metric': 'Avg Daily Return', 'Value': analytics.avgDailyReturn },
                { 'Section': '', 'Metric': 'Total Trades', 'Value': analytics.totalTrades },
                { 'Section': '', 'Metric': 'Total Wins', 'Value': analytics.totalWins },
            ];

            // User Analysis Sheet
            const wsSummary = XLSX.utils.json_to_sheet(summaryData);
            // Adjust column widths
            wsSummary['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, wsSummary, 'User Analysis');
        }

        // 6. Format Session Summary Data
        const sessionData = sessions?.map(s => {
            const profit = (s.final_capital || 0) - (s.initial_capital || 0);
            const winRate = s.total_trades > 0
                ? s.total_wins / s.total_trades
                : 0;

            return {
                'Session #': s.session_number,
                'Date': new Date(s.created_at).toLocaleDateString(),
                'Start Time': new Date(s.created_at).toLocaleTimeString(),
                'End Time': s.completed_at ? new Date(s.completed_at).toLocaleTimeString() : '-',
                'Initial Capital': s.initial_capital,
                'Final Capital': s.final_capital,
                'Trades': s.total_trades,
                'Wins': s.total_wins,
                'Win Rate': winRate,
                'Outcome': s.outcome,
                'Net P&L': profit
            };
        }) || [];

        // 7. Format Trade Details Data
        const tradeData = trades.map(t => {
            const session = sessions?.find(s => s.id === t.session_id);
            return {
                'Session #': session?.session_number || '?',
                'Trade Index': t.trade_index + 1,
                'Time': new Date(t.created_at).toLocaleTimeString(),
                'Amount': t.amount,
                'Result': t.result,
                'Equity After': t.portfolio_after,
                'Evidence URL': t.image_url || 'None'
            };
        });

        // Sessions Sheet
        const wsSessions = XLSX.utils.json_to_sheet(sessionData);
        wsSessions['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsSessions, 'Sessions Summary');

        // Trades Sheet
        const wsTrades = XLSX.utils.json_to_sheet(tradeData);
        wsTrades['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsTrades, 'Trade Details');

        // 9. Download
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `TradeFlow_Report_${timestamp}.xlsx`);

        return true;
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};
