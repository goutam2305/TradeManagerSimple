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

    const copyToClipboard = () => {
        if (amount <= 0) return;
        navigator.clipboard.writeText(amount.toFixed(2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="text-center relative group">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Execute Next Trade</p>
                <button
                    onClick={copyToClipboard}
                    disabled={disabled || amount === 0}
                    className="flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 group/btn"
                >
                    <p className="text-4xl font-mono font-black text-white">${amount.toFixed(2)}</p>
                    <div className={`p-2 rounded-lg transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/40 text-slate-500 group-hover/btn:text-blue-400'}`}>
                        {copied ? <Check size={20} className="animate-bounce" /> : <Copy size={20} />}
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

            <div className="flex gap-4 w-full max-w-sm">
                <button
                    onClick={() => onResult('W')}
                    disabled={disabled || amount === 0}
                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                    <ThumbsUp className="group-hover:scale-110 transition-transform" />
                    <span>WIN</span>
                </button>
                <button
                    onClick={() => onResult('L')}
                    disabled={disabled || amount === 0}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                    <ThumbsDown className="group-hover:scale-110 transition-transform" />
                    <span>LOSS</span>
                </button>
            </div>

            <div className="text-center space-y-2">
                {amount === 0 && (
                    <p className="text-xs text-amber-500 font-medium animate-pulse">
                        Session Target Reached or Limit Exceeded. <br />Reset to start new session.
                    </p>
                )}

                {isRiskCritical && (
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider animate-bounce bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                        ⚠️ if you continue you might loose youre entire money continue at your own risk
                    </p>
                )}
            </div>
        </div>
    );
};
