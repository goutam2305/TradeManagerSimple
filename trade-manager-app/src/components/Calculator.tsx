import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator as CalcIcon,
    ChevronDown,
    Calendar,
    TrendingUp,
    Download,
    Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface BreakdownRow {
    date: string;
    dayNum: number;
    earnings: number;
    totalEarnings: number;
    balance: number;
}

export const Calculator: React.FC = () => {
    // Inputs (State)
    const [principal, setPrincipal] = useState<number>(2000);
    const [interestRate, setInterestRate] = useState<number>(2);
    const [interestPeriod] = useState('daily');
    const [duration, setDuration] = useState({ years: 0, months: 0, days: 30 });
    const [includeAllDays, setIncludeAllDays] = useState(true);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
    const [reinvestRate, setReinvestRate] = useState(100);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Results (State)
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any>(null);

    const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0];

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleCalculate = () => {
        let currentBalance = principal;
        let totalInterest = 0;

        const totalDurationDays = (duration.years * 365) + (duration.months * 30) + duration.days;
        const breakdown: BreakdownRow[] = [];

        const dailyRateRaw = interestRate / 100;
        const reinvestFactor = reinvestRate / 100;

        let processedDaysCount = 0;
        let dayOffset = 0;

        while (processedDaysCount < totalDurationDays) {
            const dateObj = new Date(startDate);
            dateObj.setDate(dateObj.getDate() + dayOffset);
            const dayOfWeek = dateObj.getDay();

            const isDayIncluded = includeAllDays || selectedDays.includes(dayOfWeek);

            if (isDayIncluded) {
                processedDaysCount++;
                const dailyProfit = currentBalance * dailyRateRaw;
                const reinvestedAmount = dailyProfit * reinvestFactor;

                currentBalance += reinvestedAmount;
                totalInterest += dailyProfit;

                const formattedDate = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit'
                }).replace(/ /g, ' ').replace(',', "'");

                breakdown.push({
                    date: formattedDate,
                    dayNum: processedDaysCount,
                    earnings: dailyProfit,
                    totalEarnings: totalInterest,
                    balance: currentBalance
                });
            }
            dayOffset++;

            if (dayOffset > 10000) break;
        }

        const ror = principal > 0 ? ((currentBalance - principal) / principal) * 100 : 0;

        setResults({
            futureValue: currentBalance,
            totalInterest,
            initialBalance: principal,
            compoundedRate: ror,
            ror,
            breakdown
        });
        setShowResults(true);
    };

    const handleExportExcel = () => {
        if (!results || !results.breakdown) return;

        const data = results.breakdown.map((row: any) => ({
            'Date / Day': `${row.date} (Day ${row.dayNum})`,
            'Earnings ($)': Number(row.earnings.toFixed(2)),
            'Total Earnings ($)': Number(row.totalEarnings.toFixed(2)),
            'Balance ($)': Number(row.balance.toFixed(2))
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Compounding Results');
        XLSX.writeFile(wb, `TradeCompounding_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const formatCurr = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    const getDurationLabel = () => {
        const parts = [];
        if (duration.years > 0) parts.push(`${duration.years} ${duration.years === 1 ? 'year' : 'years'}`);
        if (duration.months > 0) parts.push(`${duration.months} ${duration.months === 1 ? 'month' : 'months'}`);
        if (duration.days > 0) parts.push(`${duration.days} ${duration.days === 1 ? 'day' : 'days'}`);
        return parts.length > 0 ? parts.join(', ') : '0 days';
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 gap-10 grid grid-cols-1 lg:grid-cols-12 min-h-0 flex-1 overflow-visible animate-in fade-in duration-1000">
            {/* INPUT PANEL */}
            <aside className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-6 rounded-3xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <CalcIcon size={20} className="text-accent" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-bold text-white">Calculator</h2>
                            <p className="text-xs text-text-secondary uppercase tracking-widest opacity-50">Simulation Inputs</p>
                        </div>
                    </div>
                    {/* Principal Amount */}
                    <div className="space-y-3 relative z-10">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60">Principal amount:</label>
                        <div className="relative group/input">
                            <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-accent text-xl font-black border-r border-white/5 group-focus-within/input:bg-accent/5 transition-all">
                                $
                            </div>
                            <input
                                type="number"
                                value={principal}
                                onChange={(e) => setPrincipal(Number(e.target.value))}
                                className="input-field w-full pl-14 pr-4 py-3 text-xl font-mono text-white"
                            />
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary tracking-wide">Interest rate:</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="input-field w-full pr-10 pl-4 py-3 text-xl font-mono text-white text-left"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-xl">%</span>
                            </div>
                            <div className="relative w-32">
                                <select
                                    value={interestPeriod}
                                    disabled
                                    className="input-field w-full px-4 py-3 text-lg text-white opacity-100 cursor-default appearance-none"
                                >
                                    <option value="daily">daily</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-secondary tracking-wide">Years:</label>
                            <input
                                type="number"
                                value={duration.years}
                                onChange={(e) => setDuration({ ...duration, years: Number(e.target.value) })}
                                className="input-field w-full px-4 py-3 text-xl font-mono text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-secondary tracking-wide">Months:</label>
                            <input
                                type="number"
                                value={duration.months}
                                onChange={(e) => setDuration({ ...duration, months: Number(e.target.value) })}
                                className="input-field w-full px-4 py-3 text-xl font-mono text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-secondary tracking-wide">Days:</label>
                            <input
                                type="number"
                                value={duration.days}
                                onChange={(e) => setDuration({ ...duration, days: Number(e.target.value) })}
                                className="input-field w-full px-4 py-3 text-xl font-mono text-white"
                            />
                        </div>
                    </div>

                    {/* Weekend & Reinvest */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-secondary tracking-wide whitespace-nowrap">Include all days?</label>
                                <div className="flex bg-[#1e232d] p-1 rounded-xl border border-white/5 gap-1">
                                    <button
                                        onClick={() => setIncludeAllDays(true)}
                                        className={`flex-1 py-2 text-sm font-bold transition-all rounded-lg ${includeAllDays ? 'bg-accent text-[#0F172A] shadow-lg shadow-accent/20' : 'text-text-secondary hover:text-white'
                                            }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setIncludeAllDays(false)}
                                        className={`flex-1 py-2 text-sm font-bold transition-all rounded-lg ${!includeAllDays ? 'bg-accent text-[#0F172A] shadow-lg shadow-accent/20' : 'text-text-secondary hover:text-white'
                                            }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-secondary tracking-wide whitespace-nowrap">Daily reinvest rate</label>
                                <div className="relative">
                                    <select
                                        value={reinvestRate}
                                        onChange={(e) => setReinvestRate(Number(e.target.value))}
                                        className="input-field w-full px-4 py-2 text-lg text-white appearance-none cursor-pointer"
                                    >
                                        {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map(r => (
                                            <option key={r} value={r}>{r}%</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Specific Days Selector (Conditional) */}
                        <AnimatePresence>
                            {!includeAllDays && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-sm font-semibold text-text-secondary tracking-wide">Days to include:</label>
                                    <div className="flex rounded-xl overflow-hidden border border-white/10 bg-[#1e232d] p-0.5">
                                        {DISPLAY_DAYS.map(day => (
                                            <button
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                className={`flex-1 py-2.5 text-sm font-bold transition-all border-r last:border-0 border-white/5 ${selectedDays.includes(day)
                                                    ? 'bg-accent text-[#0F172A]'
                                                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {DAY_LABELS[day]}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 items-end relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">Start Date</label>
                                <button onClick={() => setStartDate(new Date().toISOString().split('T')[0])} className="text-[9px] font-bold text-accent uppercase tracking-tighter hover:underline">today</button>
                            </div>
                            <div className="relative group/date">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input-field w-full px-4 py-3 text-xs text-white"
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                            </div>
                        </div>
                        <button
                            onClick={handleCalculate}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-3 font-black text-xs transition-all shadow-xl shadow-accent/20"
                        >
                            Calculate
                        </button>
                    </div>
                </div>
            </aside>

            {/* RESULTS PANEL (Conditional) */}
            <main className="lg:col-span-8 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                    {!showResults ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20"
                        >
                            <div className="p-6 rounded-full bg-white/5">
                                <CalcIcon size={64} className="text-text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Ready to calculate?</h3>
                                <p className="text-text-secondary max-w-sm">
                                    Adjust the parameters on the left and click the calculate button to see your projected earnings and growth breakdown.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 pb-12"
                        >
                            <header className="flex items-end justify-between border-b border-white/5 pb-4">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Yield Projection</h1>
                                    <p className="text-xs text-text-secondary uppercase tracking-widest opacity-50">Temporal Range: {getDurationLabel()}</p>
                                </div>
                            </header>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-panel p-6 rounded-3xl relative group/stat bg-accent/5 border-accent/20 overflow-hidden">
                                    <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Future Value</p>
                                    <p className="text-3xl font-bold text-white">{formatCurr(results.futureValue)}</p>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl relative group/stat overflow-hidden">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-60">Total Profit</p>
                                    <p className="text-3xl font-bold text-white">{formatCurr(results.totalInterest)}</p>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl relative group/stat overflow-hidden">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-60">Total Return</p>
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="text-accent" size={24} />
                                        <span className="text-3xl font-bold text-accent">{results.ror.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Data Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group/stat overflow-hidden">
                                    <div>
                                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 opacity-60">Initial Balance</p>
                                        <p className="text-xl font-bold text-white">{formatCurr(results.initialBalance)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary">
                                        <Info size={20} />
                                    </div>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group/stat overflow-hidden">
                                    <div>
                                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 opacity-60">Average Annual Growth</p>
                                        <p className="text-xl font-bold text-accent">{(results.ror / (duration.years || 1)).toFixed(1)}% APY/SYS</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                                        <TrendingUp size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Table Controls */}
                            <div className="flex items-center justify-between pt-4">
                                <div className="px-6 py-2 text-xs font-black uppercase tracking-widest text-accent">
                                    Daily Breakdown
                                </div>
                                <button
                                    onClick={handleExportExcel}
                                    className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                    title="Export to Excel"
                                >
                                    <Download size={18} />
                                </button>
                            </div>

                            {/* Breakdown Table */}
                            <div className="glass-panel rounded-3xl overflow-hidden border-white/5 max-h-[700px] overflow-y-auto custom-scrollbar shadow-2xl relative group/table">
                                <div className="overflow-x-auto relative z-10">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="sticky top-0 z-20 text-xs font-bold uppercase tracking-widest border-b border-white/10 shadow-xl">
                                                <th className="px-8 py-6 bg-[#0B0E14]/95 backdrop-blur-xl text-accent">Day / Date</th>
                                                <th className="px-8 py-6 bg-[#0B0E14]/95 backdrop-blur-xl text-white">Daily Earnings</th>
                                                <th className="px-8 py-6 bg-[#0B0E14]/95 backdrop-blur-xl text-white">Total Earnings</th>
                                                <th className="px-8 py-6 bg-[#0B0E14]/95 backdrop-blur-xl text-white text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {results.breakdown.map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-accent/5 transition-colors group/row">
                                                    <td className="px-8 py-5 text-sm font-bold text-white tracking-tight">
                                                        {row.date} <span className="text-xs text-text-secondary/50 ml-2">Day {row.dayNum}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">
                                                        {formatCurr(row.earnings)}
                                                    </td>
                                                    <td className="px-8 py-5 text-xs text-text-secondary font-medium">
                                                        {formatCurr(row.totalEarnings)}
                                                    </td>
                                                    <td className="px-8 py-5 text-base font-bold text-accent text-right">
                                                        {formatCurr(row.balance)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
