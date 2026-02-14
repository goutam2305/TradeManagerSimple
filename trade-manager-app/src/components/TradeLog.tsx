import { useRef } from 'react';
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
        <section className="glass-panel p-6 flex-1 flex flex-col min-h-0 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/5 rounded-full blur-[60px] group-hover:bg-accent/10 transition-colors pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">Session Log</h2>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] uppercase tracking-widest active:scale-95 group"
                >
                    <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
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
                        <div className="flex flex-col items-center justify-center h-40 text-text-secondary opacity-50">
                            <p className="text-sm italic">No trades in this session yet.</p>
                        </div>
                    )}
                    {trades.map((trade, idx) => (
                        <motion.div
                            key={trade.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface/50 p-4 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-accent w-6">#{idx + 1}</span>
                                <div>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tight mb-0.5">Amount</p>
                                    <p className="font-bold text-white">${trade.amount.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 relative z-10">
                                {/* Evidence Section */}
                                <div className="flex flex-col items-end min-w-[80px]">
                                    <p className="text-[9px] text-text-secondary uppercase font-black tracking-[0.2em] mb-2 opacity-50">Intel</p>
                                    {trade.imageUrl ? (
                                        <button
                                            onClick={() => onViewEvidence?.(trade.imageUrl!)}
                                            className="p-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all border border-accent/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                            title="View Intelligence"
                                        >
                                            <ImageIcon size={14} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => triggerUpload(idx)}
                                                disabled={!trade.dbId}
                                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-accent hover:bg-accent/10 hover:border-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Upload Intel"
                                            >
                                                <Upload size={14} />
                                            </button>
                                            <button
                                                onClick={() => handlePaste(idx)}
                                                disabled={!trade.dbId}
                                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-accent hover:bg-accent/10 hover:border-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Paste Intel"
                                            >
                                                <Clipboard size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tight mb-1">Result</p>
                                    {trade.result === 'W' ? (
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                                            WIN <CheckCircle2 size={12} />
                                        </span>
                                    ) : (
                                        <span className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                                            LOSS <XCircle size={12} />
                                        </span>
                                    )}
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tight mb-1">Portfolio</p>
                                    <p className="font-bold text-white">${trade.portfolioAfter.toFixed(2)}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
};
