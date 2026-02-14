import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TradeEntryProps {
    amount: number;
    onResult: (result: 'W' | 'L') => void;
    disabled?: boolean;
    isRiskCritical?: boolean;
}

export const TradeEntry: React.FC<TradeEntryProps> = ({ amount, onResult, disabled, isRiskCritical }) => {
    const [copied, setCopied] = useState(false);
    const [localProcessing, setLocalProcessing] = useState(false);

    const copyToClipboard = () => {
        if (amount <= 0) return;
        navigator.clipboard.writeText(amount.toFixed(2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleResult = (result: 'W' | 'L') => {
        if (localProcessing || disabled || amount === 0) return;
        setLocalProcessing(true);
        onResult(result);
        // Reset local processing state slightly after to allow parent state to catch up
        // or just as a safety valve. The parent disabled prop should take over quickly.
        setTimeout(() => setLocalProcessing(false), 1000);
    };

    return (
        <div className="glass-panel p-8 flex flex-col items-center gap-8 relative overflow-hidden group">
            <div className="text-center relative z-10">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Operational Directive: Execute</p>
                <button
                    onClick={copyToClipboard}
                    disabled={disabled || amount === 0}
                    className="flex items-center gap-6 hover:scale-105 transition-all duration-500 active:scale-95 group/btn relative"
                >
                    <p className="text-6xl font-black text-white tracking-tighter uppercase leading-none">${amount.toFixed(2)}</p>
                    <div className={`p-4 rounded-xl transition-all duration-500 border ${copied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 border-white/10 text-slate-500 group-hover/btn:text-accent group-hover/btn:bg-accent/10 group-hover/btn:border-accent/20'}`}>
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </div>

                    <AnimatePresence>
                        {copied && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
                            >
                                Copied!
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            <div className="flex gap-6 w-full max-w-md relative z-10">
                <button
                    onClick={() => handleResult('W')}
                    disabled={disabled || amount === 0 || localProcessing}
                    className="flex-1 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-emerald-300 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex flex-col items-center gap-3 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                    <ThumbsUp className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-black text-emerald-400 group-hover:text-emerald-300">Confirm Yield</span>
                </button>
                <button
                    onClick={() => handleResult('L')}
                    disabled={disabled || amount === 0 || localProcessing}
                    className="flex-1 bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex flex-col items-center gap-3 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                >
                    <ThumbsDown className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-black text-red-400 group-hover:text-red-300">Report Slips</span>
                </button>
            </div>

            <div className="text-center space-y-2">
                {amount === 0 && (
                    <p className="text-xs text-amber-500 font-medium animate-pulse">
                        Session Target Reached or Limit Exceeded. <br />Reset to start new session.
                    </p>
                )}

                {isRiskCritical && (
                    <p className="text-[10px] text-red-500 font-extrabold uppercase tracking-[0.15em] animate-pulse bg-red-500/10 py-3 px-6 rounded-full border border-red-500/20 shadow-lg">
                        ⚠️ Excessive Risk Warning: Potential Liquidation
                    </p>
                )}
            </div>
        </div>
    );
};
