import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface TradeEntryProps {
    amount: number;
    onResult: (result: 'W' | 'L') => void;
    disabled?: boolean;
    isRiskCritical?: boolean;
}

export const TradeEntry: React.FC<TradeEntryProps> = ({ amount, onResult, disabled, isRiskCritical }) => {
    return (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-6">
            <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Execute Next Trade</p>
                <p className="text-5xl font-mono font-black text-white">${amount.toFixed(2)}</p>
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
