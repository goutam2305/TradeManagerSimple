import React from 'react';
import { Settings, Percent, Hash, DollarSign } from 'lucide-react';

interface CalculationsPanelProps {
    capital: number;
    totalTrades: number;
    targetWins: number;
    multiplier: number;
    onUpdate: (params: {
        capital?: number;
        totalTrades?: number;
        targetWins?: number;
        multiplier?: number;
    }) => void;
}

export const CalculationsPanel: React.FC<CalculationsPanelProps> = ({
    capital,
    totalTrades,
    targetWins,
    multiplier,
    onUpdate
}) => {
    return (
        <section className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-blue-400" />
                <h2 className="text-lg font-semibold uppercase tracking-tight">Configuration</h2>
            </div>

            <div className="space-y-4">
                <InputField
                    label="Initial Capital"
                    value={capital}
                    icon={<DollarSign size={16} />}
                    onChange={(v) => onUpdate({ capital: v })}
                />
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
                    label="Multiplier (%)"
                    value={multiplier}
                    step={0.1}
                    icon={<Percent size={16} />}
                    onChange={(v) => onUpdate({ multiplier: v })}
                />
            </div>

            <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] text-text-secondary leading-relaxed italic">
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
        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 block group-focus-within:text-blue-400 transition-colors">
            {label}
        </label>
        <div className="relative flex items-center">
            <span className="absolute left-0 text-slate-500">{icon}</span>
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent border-b border-slate-700 pl-6 py-2 outline-none focus:border-blue-500 font-mono text-lg transition-all"
            />
        </div>
    </div>
);
