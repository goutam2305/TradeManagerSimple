import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Percent, Hash, DollarSign, RefreshCw, Save, Loader2, CheckCircle2 } from 'lucide-react';

interface CalculationsPanelProps {
    capital: number;
    totalTrades: number;
    targetWins: number;
    payout: number;
    autoCompounding: boolean;
    stopLossLimit: number;
    stopLossEnabled: boolean;
    dailyGoal: number;
    dailyGoalType: '%' | '$';
    sessionsRequired: number;
    minRequiredCapital: number;
    onUpdate: (params: {
        capital?: number;
        totalTrades?: number;
        targetWins?: number;
        payout?: number;
        autoCompounding?: boolean;
        stopLossLimit?: number;
        stopLossEnabled?: boolean;
        dailyGoal?: number;
        dailyGoalType?: '%' | '$';
    }) => void;
    onSave?: () => Promise<void>;
}

export const CalculationsPanel: React.FC<CalculationsPanelProps> = ({
    capital,
    totalTrades,
    targetWins,
    payout,
    autoCompounding,
    stopLossLimit,
    stopLossEnabled,
    dailyGoal,
    dailyGoalType,
    sessionsRequired,
    minRequiredCapital,
    onUpdate,
    onSave
}) => {
    const [isSaving, setIsSaving] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(false);

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        setIsSaved(false);
        try {
            await onSave();
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="glass-panel p-4 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-blue-400" />
                <h2 className="text-lg font-semibold uppercase tracking-tight">Configuration</h2>
            </div>

            <div className="space-y-4">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <InputField
                            label="Initial Capital"
                            value={capital}
                            icon={<DollarSign size={16} />}
                            onChange={(v) => onUpdate({ capital: v })}
                        />
                    </div>
                    <div className="pb-1.5">
                        <motion.button
                            onClick={() => onUpdate({ autoCompounding: !autoCompounding })}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${autoCompounding
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                : 'bg-slate-800/20 border-slate-700/50 text-slate-500 hover:border-slate-600'
                                }`}
                            title="Auto-copy balance to capital on finish"
                        >
                            <RefreshCw size={14} className={autoCompounding ? 'animate-spin-slow' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Auto-Copy</span>
                            <div className={`w-6 h-3.5 rounded-full relative transition-colors ${autoCompounding ? 'bg-blue-500' : 'bg-slate-700'}`}>
                                <motion.div
                                    animate={{ x: autoCompounding ? 11 : 2 }}
                                    className="absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                                />
                            </div>
                        </motion.button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1 -mt-2">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold ${capital < minRequiredCapital ? 'text-red-400 animate-pulse' : 'text-emerald-400/80'}`}>
                            ($) {minRequiredCapital.toFixed(2)} min.
                        </span>
                    </div>
                    {capital < minRequiredCapital && (
                        <span className="text-[8px] font-bold text-red-500/80 uppercase tracking-tighter">
                            ⚠️ Insufficient
                        </span>
                    )}
                </div>

                <InputField
                    label="Total Trades"
                    value={totalTrades}
                    icon={<Hash size={16} />}
                    onChange={(v) => onUpdate({ totalTrades: v })}
                />
                <InputField
                    label="Target Wins"
                    value={targetWins}
                    icon={<Hash size={16} />}
                    onChange={(v) => onUpdate({ targetWins: v })}
                />
                <InputField
                    label="Payout %"
                    value={payout}
                    step={1}
                    icon={<Percent size={16} />}
                    onChange={(v) => onUpdate({ payout: v })}
                />

                <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Risk Warning</span>
                        </div>
                        <motion.button
                            onClick={() => onUpdate({ stopLossEnabled: !stopLossEnabled })}
                            whileTap={{ scale: 0.95 }}
                            className={`w-10 h-5 rounded-full relative transition-colors ${stopLossEnabled ? 'bg-red-500' : 'bg-slate-700'}`}
                        >
                            <motion.div
                                animate={{ x: stopLossEnabled ? 22 : 2 }}
                                className="absolute top-1 left-1.5 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </motion.button>
                        {stopLossEnabled && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <InputField
                                    label="Max Loss Limit %"
                                    value={stopLossLimit}
                                    icon={<Percent size={16} className="text-red-400" />}
                                    onChange={(v) => onUpdate({ stopLossLimit: v })}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Daily Goal Settings</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <InputField
                                label="Profit Target"
                                value={dailyGoal}
                                icon={dailyGoalType === '$' ? <DollarSign size={16} /> : <Percent size={16} />}
                                onChange={(v) => onUpdate({ dailyGoal: v })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 px-1">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-50">Unit</span>
                            <motion.button
                                onClick={() => onUpdate({ dailyGoalType: dailyGoalType === '$' ? '%' : '$' })}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-blue-400 font-mono font-bold text-lg min-w-[44px] h-[44px] transition-all"
                                title="Toggle between Percentage (%) and Fixed Amount ($)"
                            >
                                {dailyGoalType}
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2 py-2 bg-slate-800/20 rounded-xl border border-slate-700/30">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">Sessions</span>
                            <span className="text-[8px] text-text-secondary/60">Required Target</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-white bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            {sessionsRequired}
                        </span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
                <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 ${isSaved
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {isSaving ? (
                            <motion.div
                                key="saving"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </motion.div>
                        ) : isSaved ? (
                            <motion.div
                                key="saved"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 size={16} />
                                Config Saved!
                            </motion.div>
                        ) : (
                            <motion.div
                                key="default"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2"
                            >
                                <Save size={16} />
                                Save Configuration
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
                <p className="text-[10px] text-text-secondary leading-relaxed italic text-center">
                    Logic: Recursive matrix calculation ensures path-independent trade sizing to reach target win goal.
                </p>
            </div>
        </section>
    );
};

interface InputFieldProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    step?: number;
    onChange: (value: number) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, icon, step = 1, onChange }) => (
    <div className="group">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-2 block group-focus-within:text-blue-400 transition-colors opacity-70">
            {label}
        </label>
        <div className="relative flex items-center">
            <div className="absolute left-0 w-8 h-8 flex items-center justify-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                {icon}
            </div>
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/10 border-b border-slate-700/50 pl-10 pr-4 py-2 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 font-mono text-lg transition-all rounded-t-lg"
            />
        </div>
    </div>
);
