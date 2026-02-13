import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradingCalendarProps {
    data: { date: string; pnl: number; count: number }[];
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({ data }) => {
    const [viewDate, setViewDate] = useState(startOfToday());

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));
    const handleResetMonth = () => setViewDate(startOfToday());

    // Helper to get data for a specific day
    const getDataForDay = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return data.find(d => d.date === dateStr);
    };

    // Calculate empty cells for start of month padding
    const startPadding = Array(getDay(monthStart)).fill(null);

    return (
        <div className="bg-panel border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Trading Calendar</h3>
                <div className="flex items-center gap-1 bg-surface/50 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-white/5 rounded transition-colors text-text-secondary hover:text-white"
                        title="Previous Month"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={handleResetMonth}
                        className="px-2 py-1 text-[10px] font-bold text-text-secondary hover:text-white transition-colors uppercase tracking-tight"
                        title="Current Month"
                    >
                        {format(viewDate, 'MMM yyyy')}
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-white/5 rounded transition-colors text-text-secondary hover:text-white"
                        title="Next Month"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={`${day}-${i}`} className="text-center text-[10px] text-white/70 font-bold uppercase tracking-tighter">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {startPadding.map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                ))}

                {days.map(day => {
                    const dayData = getDataForDay(day);
                    const pnl = dayData?.pnl || 0;
                    const count = dayData?.count || 0;
                    const isProfit = pnl >= 0;

                    let bgClass = 'bg-surface/50';
                    let textClass = 'text-text-secondary';
                    let borderClass = 'border-transparent';

                    if (dayData) {
                        textClass = 'text-white';
                        if (isProfit) {
                            // Green intensity based on PnL magnitude (simplified)
                            bgClass = 'bg-emerald-500/20';
                            borderClass = 'border-emerald-500/30';
                        } else {
                            bgClass = 'bg-red-500/20';
                            borderClass = 'border-red-500/30';
                        }
                    }

                    if (isToday(day)) {
                        borderClass = 'border-accent';
                    }

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                aspect-square rounded-lg border ${bgClass} ${borderClass}
                                flex flex-col items-center justify-center relative group cursor-default transition-all hover:scale-105
                            `}
                        >
                            <span className={`text-xs font-medium ${textClass}`}>{format(day, 'd')}</span>

                            {/* Dot indicator for trades */}
                            {count > 0 && (
                                <div className={`w-1 h-1 rounded-full mt-1 ${isProfit ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            )}

                            {/* Tooltip */}
                            {dayData && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-white p-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 shadow-xl">
                                    <div className="font-bold">{format(day, 'MMM d, yyyy')}</div>
                                    <div className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
                                        {isProfit ? '+' : ''}${pnl.toFixed(2)}
                                    </div>
                                    <div className="text-text-secondary">{count} Trades</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <span>Profit</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <span>Loss</span>
                </div>
            </div>
        </div>
    );
};
