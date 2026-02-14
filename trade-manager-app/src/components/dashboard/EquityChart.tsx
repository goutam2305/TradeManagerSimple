import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';

interface EquityChartProps {
    data: { date: string; balance: number; tradeCount: number; isoDate?: string }[];
    timeRange: 'all' | 'month' | 'week' | 'today';
}

export const EquityChart: React.FC<EquityChartProps> = ({ data, timeRange }) => {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-text-secondary">No data available</div>;
    }

    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey="isoDate"
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(iso, index) => {
                            if (!iso) return '';
                            const date = parseISO(iso);
                            if (!isValid(date)) return '';

                            let currentLabel = '';
                            switch (timeRange) {
                                case 'today':
                                    const point = data.find(p => p.isoDate === iso);
                                    if (point?.date === 'Start') currentLabel = format(date, 'MMM d');
                                    else currentLabel = format(date, 'HH:mm');
                                    break;
                                case 'week':
                                    currentLabel = format(date, 'EEE');
                                    break;
                                case 'month':
                                    currentLabel = format(date, 'MMM d');
                                    break;
                                case 'all':
                                    currentLabel = format(date, 'MMM');
                                    break;
                                default:
                                    currentLabel = format(date, 'MMM d');
                            }

                            // Deduplication logic: Only show if different from the previous point
                            if (index > 0) {
                                const prevIso = data[index - 1].isoDate;
                                if (prevIso) {
                                    const prevDate = parseISO(prevIso);
                                    let prevLabel = '';
                                    switch (timeRange) {
                                        case 'today':
                                            if (data[index - 1].date === 'Start') prevLabel = format(prevDate, 'MMM d');
                                            else prevLabel = format(prevDate, 'HH:mm');
                                            break;
                                        case 'week': prevLabel = format(prevDate, 'EEE'); break;
                                        case 'month': prevLabel = format(prevDate, 'MMM d'); break;
                                        case 'all': prevLabel = format(prevDate, 'MMM'); break;
                                        default: prevLabel = format(prevDate, 'MMM d');
                                    }
                                    if (currentLabel === prevLabel) return '';
                                }
                            }

                            return currentLabel;
                        }}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#22d3ee' }}
                        formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Balance']}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        labelFormatter={(iso) => {
                            if (!iso) return '';
                            const date = parseISO(iso);
                            if (!isValid(date)) return '';

                            if (timeRange === 'today') {
                                return format(date, 'MMM d, HH:mm');
                            }
                            return format(date, 'MMM d, yyyy');
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
