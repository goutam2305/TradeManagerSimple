import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator as CalcIcon,
    ChevronDown,
    Calendar,
    Copy,
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
        <div className="max-w-7xl mx-auto px-4 py-6 gap-8 grid grid-cols-1 lg:grid-cols-12 min-h-0 flex-1 overflow-visible">
            {/* INPUT PANEL */}
            <aside className="lg:col-span-4 space-y-4">
                <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
                    {/* Principal Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary tracking-wide">Principal amount:</label>
                        <div className="relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-text-secondary text-xl font-light border-r border-white/5 group-focus-within:text-accent transition-colors">
                                $
                            </div>
                            <input
                                type="number"
                                value={principal}
                                onChange={(e) => setPrincipal(Number(e.target.value))}
                                className="w-full bg-[#1e232d] border border-white/10 rounded-xl pl-14 pr-4 py-3 text-xl font-mono text-white outline-none focus:border-accent/40"
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
                                    className="w-full bg-[#1e232d] border border-white/10 rounded-xl pr-10 pl-4 py-3 text-xl font-mono text-white outline-none focus:border-accent/40 text-left"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-xl">%</span>
                            </div>
                            <div className="relative w-32">
                                <select
                                    value={interestPeriod}
                                    disabled
                                    className="w-full bg-[#1e232d] border border-white/10 rounded-xl px-4 py-3 text-lg text-white outline-none appearance-none cursor-default opacity-100"
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
                                className="w-full bg-[#1e232d] border border-white/10 rounded-xl px-4 py-3 text-xl font-mono text-white outline-none focus:border-accent/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-secondary tracking-wide">Months:</label>
                            <input
                                type="number"
                                value={duration.months}
                                onChange={(e) => setDuration({ ...duration, months: Number(e.target.value) })}
                                className="w-full bg-[#1e232d] border border-white/10 rounded-xl px-4 py-3 text-xl font-mono text-white outline-none focus:border-accent/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-secondary tracking-wide">Days:</label>
                            <input
                                type="number"
                                value={duration.days}
                                onChange={(e) => setDuration({ ...duration, days: Number(e.target.value) })}
                                className="w-full bg-[#1e232d] border border-white/10 rounded-xl px-4 py-3 text-xl font-mono text-white outline-none focus:border-accent/40"
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
                                        className="w-full bg-[#1e232d] border border-white/10 rounded-xl px-4 py-2 text-lg text-white outline-none appearance-none cursor-pointer"
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
                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-text-secondary tracking-wide whitespace-nowrap">Start date?</label>
                                <button onClick={() => setStartDate(new Date().toISOString().split('T')[0])} className="text-[10px] font-bold text-accent uppercase tracking-tighter hover:underline">today</button>
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-[#1e232d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent/40"
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                            </div>
                        </div>
                        <button
                            onClick={handleCalculate}
                            className="bg-accent hover:bg-accent-hover text-[#0F172A] py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-accent/20 uppercase text-xs tracking-widest"
                        >
                            <CalcIcon size={14} />
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
                            className="space-y-6 pb-12"
                        >
                            <header className="flex items-end justify-between border-b border-white/10 pb-2">
                                <h1 className="text-3xl font-black text-white tracking-tight">Interest calculation for <span className="text-accent">{getDurationLabel()}</span></h1>
                            </header>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="glass-panel p-5 rounded-2xl relative group bg-accent/5 border-accent/20">
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Future Value</p>
                                    <p className="text-2xl font-black text-white font-mono">{formatCurr(results.futureValue)}</p>
                                    <button className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <div className="glass-panel p-5 rounded-2xl relative group">
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Total Interest</p>
                                    <p className="text-2xl font-black text-white font-mono">{formatCurr(results.totalInterest)}</p>
                                </div>
                                <div className="glass-panel p-5 rounded-2xl group">
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Rate of Return</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="text-accent" size={20} />
                                        <span className="text-2xl font-black text-accent font-mono">{results.ror.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Data Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Initial Balance</p>
                                        <p className="text-xl font-black text-white font-mono">{formatCurr(results.initialBalance)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 text-text-secondary">
                                        <Info size={20} />
                                    </div>
                                </div>
                                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Compounded Gain</p>
                                        <p className="text-xl font-black text-accent font-mono">{(results.ror / (duration.years || 1)).toFixed(2)}% avg/yr</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-accent/10 text-accent">
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
                                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                                    title="Export to Excel"
                                >
                                    <Download size={18} />
                                </button>
                            </div>

                            {/* Breakdown Table */}
                            <div className="glass-panel rounded-2xl overflow-hidden border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="sticky top-0 z-10 text-[10px] font-black uppercase tracking-widest border-b border-white/10">
                                                <th className="px-6 py-5 bg-slate-900 text-accent font-bold">Date / Day</th>
                                                <th className="px-6 py-5 bg-slate-900 text-white font-bold">Earnings</th>
                                                <th className="px-6 py-5 bg-slate-900 text-white font-bold">Total Earnings</th>
                                                <th className="px-6 py-5 bg-slate-900 text-white font-bold text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.breakdown.map((row: any, i: number) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">
                                                        {row.date} <span className="text-[10px] font-black text-text-secondary/30 ml-1">Day {row.dayNum}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono text-white">
                                                        {formatCurr(row.earnings)}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono text-white/60">
                                                        {formatCurr(row.totalEarnings)}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono font-black text-accent text-right">
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
