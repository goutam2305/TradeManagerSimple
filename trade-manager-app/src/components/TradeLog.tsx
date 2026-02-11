import React from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Trade {
    id: number;
    amount: number;
    result: 'W' | 'L' | null;
    portfolioAfter: number;
}

interface TradeLogProps {
    trades: Trade[];
    onReset: () => void;
}

export const TradeLog: React.FC<TradeLogProps> = ({ trades, onReset }) => {
    return (
        <section className="glass-panel p-6 rounded-2xl flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Session Log</h2>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                    <RotateCcw size={14} />
                    Reset Session
                </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {trades.length === 0 && (
                        <p className="text-center text-slate-600 py-12 text-sm italic">No trades in this session yet.</p>
                    )}
                    {trades.map((trade, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#1a1a1e] p-4 rounded-xl flex items-center justify-between border border-slate-800/50"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-slate-600 w-4">{idx + 1}</span>
                                <div>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Amount</p>
                                    <p className="font-mono text-sm">${trade.amount.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Result</p>
                                    <div className="flex justify-end">
                                        {trade.result === 'W' ? (
                                            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                                                WIN <CheckCircle2 size={12} />
                                            </span>
                                        ) : (
                                            <span className="text-red-400 font-bold text-sm flex items-center gap-1">
                                                LOSS <XCircle size={12} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right min-w-[100px]">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Equity</p>
                                    <p className="font-mono text-sm font-bold text-blue-400">${trade.portfolioAfter.toFixed(2)}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
};
