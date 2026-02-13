
import { useEffect, useState, Fragment, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Clock, ChevronDown, ChevronUp, ImageIcon, Upload, Clipboard, Trash2, FileDown, Loader2 } from 'lucide-react';
import { ImageModal } from './ImageModal';
import * as XLSX from 'xlsx';

interface HistoryProps {
    session: Session;
    isInline?: boolean;
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

interface TradeDetail {
    id: string;
    trade_index: number;
    amount: number;
    result: 'W' | 'L';
    portfolio_after: number;
    created_at: string;
    image_url?: string;
}

export const History = ({ session, isInline = false }: HistoryProps) => {
    const [history, setHistory] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Expansion State
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [tradesCache, setTradesCache] = useState<Record<string, TradeDetail[]>>({});
    const [loadingTrades, setLoadingTrades] = useState<Record<string, boolean>>({});
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedTradeIdx = useRef<{ sessionId: string, tradeIndex: number, tradeId: string } | null>(null);

    const handleExportReport = async () => {
        setExporting(true);
        try {
            // 1. Determine target sessions
            const targetSessions = selectedSessionIds.length > 0
                ? history.filter(s => selectedSessionIds.includes(s.id))
                : history;

            if (targetSessions.length === 0) {
                alert('No sessions available to export.');
                return;
            }

            const targetIds = targetSessions.map(s => s.id);

            // 2. Fetch all trades for these sessions
            const { data: allTrades, error: tradesError } = await supabase
                .from('trades')
                .select('*')
                .in('session_id', targetIds)
                .order('created_at', { ascending: true });

            if (tradesError) throw tradesError;

            // 3. Format Session Summary Data
            const sessionData = targetSessions.map(s => {
                const profit = s.final_capital - s.initial_capital;
                const winRate = s.total_trades > 0
                    ? ((s.total_wins / s.total_trades) * 100).toFixed(1) + '%'
                    : '0%';

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
                    'Net P&L': profit.toFixed(2)
                };
            });

            // 4. Format Trade Details Data
            const tradeData = allTrades.map(t => {
                const session = targetSessions.find(s => s.id === t.session_id);
                return {
                    'Session #': session?.session_number || '?',
                    'Trade #': t.trade_index + 1,
                    'Time': new Date(t.created_at).toLocaleTimeString(),
                    'Amount': t.amount,
                    'Result': t.result,
                    'Equity After': t.portfolio_after,
                    'Evidence URL': t.image_url || 'None'
                };
            });

            // 5. Create Excel Workbook
            const wb = XLSX.utils.book_new();

            const wsSessions = XLSX.utils.json_to_sheet(sessionData);
            const wsTrades = XLSX.utils.json_to_sheet(tradeData);

            XLSX.utils.book_append_sheet(wb, wsSessions, 'Sessions Summary');
            XLSX.utils.book_append_sheet(wb, wsTrades, 'Trade Details');

            // 6. Download
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `TradeFlow_Report_${timestamp}.xlsx`);

        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Failed to export report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            let query = supabase
                .from('sessions')
                .select('*')
                .eq('user_id', session.user.id)
                .is('is_active', false) // Only completed sessions
                .order('created_at', { ascending: false });

            if (isInline) {
                query = query.limit(5);
            }

            const { data, error } = await query;

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

    const toggleSession = async (sessionId: string) => {
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null);
            return;
        }

        setExpandedSessionId(sessionId);

        if (!tradesCache[sessionId]) {
            setLoadingTrades(prev => ({ ...prev, [sessionId]: true }));
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('session_id', sessionId)
                .order('trade_index', { ascending: true });

            if (data) {
                setTradesCache(prev => ({ ...prev, [sessionId]: data }));
            }
            if (error) {
                console.error("Error fetching trades", error);
            }
            setLoadingTrades(prev => ({ ...prev, [sessionId]: false }));
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedTradeIdx.current) {
            const { sessionId, tradeIndex, tradeId } = selectedTradeIdx.current;
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${tradeId}-${Date.now()}.${fileExt}`;
            const filePath = `${session.user.id}/${fileName}`;

            try {
                // Upload
                const { error: uploadError } = await supabase.storage
                    .from('trade-evidence')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from('trade-evidence')
                    .getPublicUrl(filePath);

                // Update DB
                const { error: updateError } = await supabase
                    .from('trades')
                    .update({ image_url: publicUrl })
                    .eq('id', tradeId);

                if (updateError) throw updateError;

                // Update Local State
                setTradesCache(prev => {
                    const sessionTrades = prev[sessionId] ? [...prev[sessionId]] : [];
                    if (sessionTrades[tradeIndex]) {
                        sessionTrades[tradeIndex] = { ...sessionTrades[tradeIndex], image_url: publicUrl };
                    }
                    return { ...prev, [sessionId]: sessionTrades };
                });

            } catch (error) {
                console.error("Error uploading evidence:", error);
                alert("Failed to upload evidence");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
                selectedTradeIdx.current = null;
            }
        }
    };

    const triggerUpload = (sessionId: string, tradeIndex: number, tradeId: string) => {
        selectedTradeIdx.current = { sessionId, tradeIndex, tradeId };
        fileInputRef.current?.click();
    };

    const handleSelectAll = () => {
        if (selectedSessionIds.length === history.length) {
            setSelectedSessionIds([]);
        } else {
            setSelectedSessionIds(history.map(s => s.id));
        }
    };

    const handleSelectSession = (sessionId: string) => {
        setSelectedSessionIds(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const handleDeleteSessions = async () => {
        if (selectedSessionIds.length === 0) return;

        const confirmMsg = selectedSessionIds.length === 1
            ? "Are you sure you want to delete this session? This will also delete all associated trades."
            : `Are you sure you want to delete ${selectedSessionIds.length} sessions? This will also delete all associated trades.`;

        if (!window.confirm(confirmMsg)) return;

        setDeleting(true);
        try {
            // 1. Delete associated trades first
            const { error: tradesError } = await supabase
                .from('trades')
                .delete()
                .in('session_id', selectedSessionIds);

            if (tradesError) throw tradesError;

            // 2. Delete the sessions
            const { error: sessionsError } = await supabase
                .from('sessions')
                .delete()
                .in('id', selectedSessionIds);

            if (sessionsError) throw sessionsError;

            // 3. Update local state
            setHistory(prev => prev.filter(s => !selectedSessionIds.includes(s.id)));
            // Clear selection and cache
            setTradesCache(prev => {
                const next = { ...prev };
                selectedSessionIds.forEach(id => delete next[id]);
                return next;
            });
            setSelectedSessionIds([]);

        } catch (error) {
            console.error('Error deleting sessions:', error);
            alert('Failed to delete sessions. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handlePaste = async (sessionId: string, tradeIndex: number, tradeId: string) => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (item.types.some(type => type.startsWith('image/'))) {
                    const blob = await item.getType(item.types.find(type => type.startsWith('image/'))!);

                    // Reuse existing upload logic by simulating file select, effectively
                    // But better to extract upload logic. For now, duplicating core upload steps is safer/faster
                    // or refactor handleFileSelect to separate upload function.
                    // Let's refactor slightly inline: call upload logic directly.

                    const file = new File([blob], `paste-${Date.now()}.png`, { type: 'image/png' });
                    const fileExt = 'png';
                    const fileName = `${tradeId}-${Date.now()}.${fileExt}`;
                    const filePath = `${session.user.id}/${fileName}`;

                    // Upload
                    const { error: uploadError } = await supabase.storage
                        .from('trade-evidence')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('trade-evidence')
                        .getPublicUrl(filePath);

                    // Update DB
                    const { error: updateError } = await supabase
                        .from('trades')
                        .update({ image_url: publicUrl })
                        .eq('id', tradeId);

                    if (updateError) throw updateError;

                    // Update Local State
                    setTradesCache(prev => {
                        const sessionTrades = prev[sessionId] ? [...prev[sessionId]] : [];
                        if (sessionTrades[tradeIndex]) {
                            sessionTrades[tradeIndex] = { ...sessionTrades[tradeIndex], image_url: publicUrl };
                        }
                        return { ...prev, [sessionId]: sessionTrades };
                    });
                    return;
                }
            }
            alert('No image found in clipboard');
        } catch (err) {
            console.error('Failed to paste:', err);
            // alert('Failed to read clipboard.');
        }
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const Content = (
        <div className={`flex-1 overflow-auto p-0 custom-scrollbar ${isInline ? '' : 'h-full'}`}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />
            {loading ? (
                <div className="flex items-center justify-center h-64 text-text-secondary gap-2">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    Loading history...
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                    <Clock className="w-12 h-12 text-border mb-4 opacity-50" />
                    <p className="font-medium">No completed sessions found</p>
                    <p className="text-sm mt-1 opacity-60">Complete a session to see it here.</p>
                </div>
            ) : (
                <table className="w-full text-left text-sm relative border-collapse">
                    <thead className="bg-surface/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedSessionIds.length === history.length && history.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px]">Session</th>
                            <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px]">Date</th>
                            {!isInline && (
                                <>
                                    <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px]">Start</th>
                                    <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px]">End</th>
                                </>
                            )}
                            <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px] text-center">Trades</th>
                            <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px] text-center">Win Rate</th>
                            <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px] text-center">Outcome</th>
                            <th className="px-6 py-4 font-bold text-text-secondary uppercase tracking-wider text-[10px] text-right">Net P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.map((record) => {
                            const profit = (record.final_capital || 0) - (record.initial_capital || 0);
                            const isProfit = profit >= 0;
                            const winRate = record.total_trades > 0
                                ? Math.round((record.total_wins / record.total_trades) * 100)
                                : 0;
                            const isExpanded = expandedSessionId === record.id;

                            return (
                                <Fragment key={record.id}>
                                    <tr className={`hover:bg-white/5 transition-colors group ${isExpanded ? 'bg-white/5' : ''}`}>
                                        <td className="px-6 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedSessionIds.includes(record.id)}
                                                onChange={() => handleSelectSession(record.id)}
                                                className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleSession(record.id)}
                                                className="flex items-center gap-2 font-mono font-bold text-accent hover:text-white transition-colors"
                                            >
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                #{record.session_number.toString().padStart(3, '0')}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{new Date(record.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        {!isInline && (
                                            <>
                                                <td className="px-6 py-4 text-text-secondary font-mono text-xs">{formatTime(record.created_at)}</td>
                                                <td className="px-6 py-4 text-text-secondary font-mono text-xs">{formatTime(record.completed_at)}</td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-white/5 font-mono text-xs">
                                                <span className="text-emerald-400">{record.total_wins}</span>
                                                <span className="text-text-secondary">/</span>
                                                <span className="text-white">{record.total_trades}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-medium">
                                            {winRate}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${record.outcome === 'WIN'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : record.outcome === 'LOSS'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {record.outcome || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isProfit ? '+' : ''}{profit.toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-text-secondary">
                                                    ${record.initial_capital.toFixed(0)} → ${record.final_capital.toFixed(0)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-surface/30">
                                            <td colSpan={isInline ? 7 : 9} className="p-4">
                                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Session Trades</h4>
                                                    {loadingTrades[record.id] ? (
                                                        <div className="text-center py-4 text-xs text-text-secondary">Loading trades...</div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                            {tradesCache[record.id]?.map((trade, idx) => (
                                                                <div key={idx} className="bg-panel border border-white/5 p-3 rounded-lg flex flex-col gap-3 group/trade relative overflow-hidden">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] font-mono text-text-secondary opacity-70">
                                                                                Trade #{idx + 1}
                                                                            </span>
                                                                            <span className="text-xs font-mono text-text-secondary">
                                                                                {formatTime(trade.created_at)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {trade.image_url ? (
                                                                                <button
                                                                                    onClick={() => setViewImage(trade.image_url!)}
                                                                                    className="p-1.5 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                                                                                    title="View Evidence"
                                                                                >
                                                                                    <ImageIcon size={14} />
                                                                                </button>
                                                                            ) : (
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => triggerUpload(record.id, idx, trade.id)}
                                                                                        className="p-1.5 rounded bg-surface border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                                                                                        title="Upload Evidence"
                                                                                    >
                                                                                        <Upload size={14} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handlePaste(record.id, idx, trade.id)}
                                                                                        className="p-1.5 rounded bg-surface border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                                                                                        title="Paste from Clipboard"
                                                                                    >
                                                                                        <Clipboard size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${trade.result === 'W'
                                                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                                                : 'bg-red-500/20 text-red-400'
                                                                                }`}>
                                                                                {trade.result === 'W' ? 'WIN' : 'LOSS'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between font-mono text-sm pt-2 border-t border-white/5">
                                                                        <span className="font-bold text-white">${trade.amount.toFixed(2)}</span>
                                                                        <span className="text-blue-300 opacity-60">→ ${trade.portfolio_after.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <ImageModal isOpen={!!viewImage} onClose={() => setViewImage(null)} imageUrl={viewImage} />
        </div>
    );

    if (isInline) {
        return Content;
    }

    // Full Page View
    return (
        <div className="h-full flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col min-h-0 border border-white/5 bg-panel/50 relative">

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-0">
                            <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Session Log</h2>
                            <p className="text-xs text-text-secondary">Full history of all completed sessions</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pr-12">
                        {selectedSessionIds.length > 0 && (
                            <button
                                onClick={handleDeleteSessions}
                                disabled={deleting}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-bold"
                            >
                                <Trash2 size={16} />
                                {deleting ? 'Deleting...' : `Delete (${selectedSessionIds.length})`}
                            </button>
                        )}
                        <button
                            onClick={handleExportReport}
                            disabled={exporting || history.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold ${exporting || history.length === 0
                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                                    : 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20'
                                }`}
                        >
                            {exporting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <FileDown size={16} />
                            )}
                            {exporting ? 'EXPORTING...' : 'EXPORT REPORT'}
                        </button>
                    </div>
                </div>
                {Content}
            </div>
        </div>
    );
};
