import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Percent, Hash, DollarSign, RefreshCw, Save, Loader2, CheckCircle2, Target } from 'lucide-react';

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
    isReadOnly?: boolean;
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
    onSave,
    isReadOnly
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
        <section className="glass-panel p-6 space-y-6 relative overflow-hidden group">

            <div className="flex items-center gap-3 mb-2">
                <Settings size={18} className="text-accent" />
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Configuration</h2>
            </div>

            <div className="space-y-4">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <InputField
                            label="Initial Capital"
                            value={capital}
                            icon={<DollarSign size={16} />}
                            onChange={(v) => onUpdate({ capital: v })}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                    <div className="pb-1.5">
                        <motion.button
                            onClick={() => !isReadOnly && onUpdate({ autoCompounding: !autoCompounding })}
                            whileTap={isReadOnly ? {} : { scale: 0.95 }}
                            disabled={isReadOnly}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${autoCompounding
                                ? 'bg-accent/10 text-accent shadow-[0_0_20px_rgba(77,167,204,0.3)] border border-accent/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            title="Auto-copy balance to capital on finish"
                        >
                            <RefreshCw size={14} className={autoCompounding ? 'animate-spin-slow' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Auto-Copy</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${autoCompounding ? 'bg-accent shadow-[0_0_10px_rgba(77,167,204,0.5)]' : 'bg-slate-950'}`}>
                                <motion.div
                                    animate={{ x: autoCompounding ? 16 : 2 }}
                                    className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full shadow-sm ${autoCompounding ? 'bg-white shadow-sm' : 'bg-slate-500'}`}
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

                {/* Numeric Inputs - Enabled for Simulation */}
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Initial Capital"
                        value={capital}
                        onChange={(v) => onUpdate({ capital: v })}
                        icon={<DollarSign size={16} />}
                        isReadOnly={isReadOnly}
                    />
                    <InputField
                        label="Total Trades"
                        value={totalTrades}
                        onChange={(v) => onUpdate({ totalTrades: v })}
                        icon={<Hash size={16} />}
                        isReadOnly={isReadOnly}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Target Wins"
                        value={targetWins}
                        onChange={(v) => onUpdate({ targetWins: v })}
                        icon={<Target size={16} />}
                        isReadOnly={isReadOnly}
                    />
                    <InputField
                        label="Payout %"
                        value={payout}
                        onChange={(v) => onUpdate({ payout: v })}
                        icon={<Percent size={16} />}
                        isReadOnly={isReadOnly}
                    />
                </div>

                <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Risk Warning</span>
                        </div>
                        <motion.button
                            onClick={() => !isReadOnly && onUpdate({ stopLossEnabled: !stopLossEnabled })}
                            whileTap={isReadOnly ? {} : { scale: 0.95 }}
                            disabled={isReadOnly}
                            className={`w-10 h-5 rounded-full relative transition-all ${stopLossEnabled ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-700/50'}`}
                        >
                            <motion.div
                                animate={{ x: stopLossEnabled ? 20 : 2 }}
                                className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm ${stopLossEnabled ? 'bg-white shadow-sm' : 'bg-slate-400'}`}
                            />
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {stopLossEnabled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <InputField
                                    label="Max Loss Limit %"
                                    value={stopLossLimit}
                                    icon={<Percent size={16} className="text-red-400" />}
                                    onChange={(v) => onUpdate({ stopLossLimit: v })}
                                    isReadOnly={isReadOnly}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-3">
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
                                isReadOnly={isReadOnly}
                            />
                        </div>
                        <div className="flex flex-col gap-1 px-1">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-50">Unit</span>
                            <motion.button
                                onClick={() => !isReadOnly && onUpdate({ dailyGoalType: dailyGoalType === '$' ? '%' : '$' })}
                                whileHover={isReadOnly ? {} : { scale: 1.05, backgroundColor: 'rgba(77, 167, 204, 0.1)' }}
                                whileTap={isReadOnly ? {} : { scale: 0.95 }}
                                disabled={isReadOnly}
                                className="flex items-center justify-center p-2 rounded-xl bg-[#0E1338] border border-white/10 text-accent font-mono font-bold text-lg min-w-[44px] h-[48px] transition-all"
                                title="Toggle between Percentage (%) and Fixed Amount ($)"
                            >
                                {dailyGoalType}
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/50 rounded-2xl shadow-inner col-span-2">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-0.5">Sessions</span>
                                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60">Required Target</span>
                            </div>
                            <div className="flex items-center justify-center bg-accent/20 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(77,167,204,0.1)]">
                                <span className="text-xl font-mono font-black text-white">
                                    {sessionsRequired}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Auto-Copy Growth</span>
                            <RefreshCw size={12} className={autoCompounding ? 'text-accent animate-spin-slow' : 'text-slate-500'} />
                        </div>
                        <motion.button
                            onClick={() => !isReadOnly && onUpdate({ autoCompounding: !autoCompounding })}
                            whileTap={isReadOnly ? {} : { scale: 0.95 }}
                            disabled={isReadOnly}
                            className={`w-10 h-5 rounded-full relative transition-all ${autoCompounding ? 'bg-accent shadow-[0_0_15px_rgba(77,167,204,0.5)]' : 'bg-slate-700/50'}`}
                        >
                            <motion.div
                                animate={{ x: autoCompounding ? 20 : 2 }}
                                className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm ${autoCompounding ? 'bg-white shadow-sm' : 'bg-slate-400'}`}
                            />
                        </motion.button>
                    </div>
                </div>
            </div>


            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={handleSave}
                    disabled={isSaving || isReadOnly}
                    className={`btn-primary w-full py-5 flex items-center justify-center gap-3 font-black text-xs transition-all shadow-xl text-[#0F172A] ${isSaved
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white'
                        : 'shadow-accent/20'}`}
                >
                    <AnimatePresence mode="wait">
                        {isSaving ? (
                            <motion.div
                                key="saving"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-2"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </motion.div>
                        ) : isSaved ? (
                            <motion.div
                                key="saved"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 size={16} />
                                Saved!
                            </motion.div>
                        ) : (
                            <motion.div
                                key="default"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-2"
                            >
                                <Save size={16} />
                                Save Configuration
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </section >
    );
};

interface InputFieldProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    step?: number;
    isReadOnly?: boolean; // Changed from disabled to isReadOnly
    onChange: (value: number) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, icon, isReadOnly, onChange }) => { // Removed step
    return (
        <label className="block space-y-2 group/field">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary group-hover/field:text-accent-primary transition-colors">
                    {label}
                </span>
                {isReadOnly && (
                    <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        Sim Mode
                    </span>
                )}
            </div>
            <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors ${isReadOnly ? 'opacity-50' : ''}`}>
                    {icon}
                </div>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className={`w-full bg-[#0B0E14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-accent-primary/50 transition-all hover:border-white/10 ${isReadOnly ? 'border-amber-500/20 focus:border-amber-500/40' : ''}`}
                />
            </div>
        </label>
    );
};
