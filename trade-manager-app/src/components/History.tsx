
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { X, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface HistoryProps {
    session: Session;
    onClose: () => void;
}

interface SessionRecord {
    id: string;
    session_number: number;
    initial_capital: number;
    final_capital: number;
    total_trades: number;
    total_wins: number;
    outcome: string;
    created_at: string;
    completed_at: string;
}

export const History = ({ session, onClose }: HistoryProps) => {
    const [history, setHistory] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', session.user.id)
                .is('is_active', false) // Only completed sessions
                .order('created_at', { ascending: false });

            if (data) {
                setHistory(data);
            }
            if (error) {
                console.error("Error fetching history", error);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [session]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-bold text-slate-100">Session History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p>No completed sessions found.</p>
                            <p className="text-sm mt-2">Complete a session to see it here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {history.map((record) => {
                                const profit = (record.final_capital || 0) - (record.initial_capital || 0);
                                const isProfit = profit >= 0;
                                const winRate = record.total_trades > 0
                                    ? Math.round((record.total_wins / record.total_trades) * 100)
                                    : 0;

                                return (
                                    <div key={record.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-300">SESSION #{record.session_number}</span>
                                                    <span className="text-xs text-slate-500">{new Date(record.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <span className={`text-xl font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {isProfit ? '+' : ''}{profit.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        ({record.initial_capital.toFixed(2)} → {(record.final_capital || 0).toFixed(2)})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 md:gap-12 text-sm">
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Outcome</span>
                                                <span className={`font-bold mt-1 ${record.outcome === 'WIN' ? 'text-blue-400' : 'text-slate-300'}`}>
                                                    {record.outcome || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Win Rate</span>
                                                <span className="font-bold mt-1 text-slate-300">{winRate}%</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Trades</span>
                                                <span className="font-bold mt-1 text-slate-300">{record.total_wins} / {record.total_trades}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
