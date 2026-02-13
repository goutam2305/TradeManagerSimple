import { useRef } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, RotateCcw, ImageIcon, Upload, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Trade {
    id: number;
    amount: number;
    result: 'W' | 'L' | null;
    portfolioAfter: number;
    imageUrl?: string;
    dbId?: string;
}

interface TradeLogProps {
    trades: Trade[];
    onReset: () => void;
    onUploadEvidence?: (index: number, file: File) => Promise<void>;
    onViewEvidence?: (imageUrl: string) => void;
}

export const TradeLog: React.FC<TradeLogProps> = ({ trades, onReset, onUploadEvidence, onViewEvidence }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedTradeIndex = useRef<number | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedTradeIndex.current !== null && onUploadEvidence) {
            await onUploadEvidence(selectedTradeIndex.current, e.target.files[0]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            selectedTradeIndex.current = null;
        }
    };

    const handlePaste = async (index: number) => {
        if (!onUploadEvidence) return;
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (item.types.some(type => type.startsWith('image/'))) {
                    const blob = await item.getType(item.types.find(type => type.startsWith('image/'))!);
                    const file = new File([blob], `paste-${Date.now()}.png`, { type: 'image/png' });
                    await onUploadEvidence(index, file);
                    return;
                }
            }
            alert('No image found in clipboard');
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            // alert('Failed to read clipboard. Please allow access.'); 
        }
    };

    const triggerUpload = (index: number) => {
        selectedTradeIndex.current = index;
        fileInputRef.current?.click();
    };

    return (
        <section className="glass-panel p-4 rounded-2xl flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Session Log</h2>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                    <RotateCcw size={14} />
                    Reset Session
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {trades.length === 0 && (
                        <p className="text-center text-slate-600 py-12 text-sm italic">No trades in this session yet.</p>
                    )}
                    {trades.map((trade, idx) => (
                        <motion.div
                            key={trade.id || idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#1a1a1e] p-3 rounded-xl flex items-center justify-between border border-slate-800/50 group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-slate-600 w-4">{idx + 1}</span>
                                <div>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Amount</p>
                                    <p className="font-mono text-sm">${trade.amount.toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                        {format(new Date(trade.id), 'HH:mm:ss')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Evidence Section */}
                                <div className="flex flex-col items-end min-w-[80px]">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter mb-1">Evidence</p>
                                    {trade.imageUrl ? (
                                        <button
                                            onClick={() => onViewEvidence?.(trade.imageUrl!)}
                                            className="p-1.5 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                                            title="View Evidence"
                                        >
                                            <ImageIcon size={14} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => triggerUpload(idx)}
                                                disabled={!trade.dbId}
                                                className="p-1.5 rounded bg-surface border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Upload Evidence"
                                            >
                                                <Upload size={14} />
                                            </button>
                                            <button
                                                onClick={() => handlePaste(idx)}
                                                disabled={!trade.dbId}
                                                className="p-1.5 rounded bg-surface border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Paste from Clipboard"
                                            >
                                                <Clipboard size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

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
                                <div className="text-right min-w-[80px]">
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
