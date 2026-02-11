import React, { useState, useMemo, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { CalculationsPanel } from './components/CalculationsPanel';
import { TradeLog } from './components/TradeLog';
import { TradeEntry } from './components/TradeEntry';
import { TradingLogic } from './tradingLogic';

interface TradeRecord {
    id: number;
    amount: number;
    result: 'W' | 'L' | null;
    portfolioAfter: number;
}

function App() {
    const [config, setConfig] = useState({
        capital: 100,
        totalTrades: 10,
        targetWins: 4,
        payout: 80 // Default payout %
    });

    const [trades, setTrades] = useState<TradeRecord[]>([]);

    // Derive multiplier from payout %: 1 + (payout / 100)
    const multiplier = 1 + (config.payout / 100);

    // Memoize logic instance based on config and derived multiplier
    const logic = useMemo(() =>
        new TradingLogic(config.totalTrades, config.targetWins, multiplier),
        [config.totalTrades, config.targetWins, multiplier]);

    // Derivations
    const currentPortfolio = useMemo(() => {
        return trades.length > 0 ? trades[trades.length - 1].portfolioAfter : config.capital;
    }, [trades, config.capital]);

    const currentWins = useMemo(() => {
        return trades.filter(t => t.result === 'W').length;
    }, [trades]);

    const currentTradeIndex = trades.length;

    const nextTradeAmount = useMemo(() => {
        return logic.getTradeAmount(currentTradeIndex, currentWins, currentPortfolio);
    }, [logic, currentTradeIndex, currentWins, currentPortfolio]);

    // Actions
    const handleTradeResult = useCallback((result: 'W' | 'L') => {
        const amount = nextTradeAmount;
        let portfolioAfter = currentPortfolio;

        if (result === 'W') {
            portfolioAfter += amount * (multiplier - 1);
        } else {
            portfolioAfter -= amount;
        }

        setTrades(prev => [...prev, {
            id: Date.now(),
            amount,
            result,
            portfolioAfter
        }]);
    }, [nextTradeAmount, currentPortfolio, multiplier]);

    const handleConfigUpdate = (newParams: Partial<typeof config>) => {
        setConfig(prev => ({ ...prev, ...newParams }));
        setTrades([]); // Reset session when config changes
    };

    const handleReset = () => {
        setTrades([]);
    };

    return (
        <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 flex flex-col gap-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter glow-text">TRADE<span className="text-blue-500">MASTER</span></h1>
                    <p className="text-text-secondary text-xs uppercase font-bold tracking-[0.3em] mt-1 ml-1 opacity-60">Matrix Money Management Pro</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest">Protocol Version</p>
                    <p className="font-mono text-xs text-blue-400">EXCEL-P_1.0.4</p>
                </div>
            </header>

            <Dashboard
                currentPortfolio={currentPortfolio}
                initialCapital={config.capital}
                totalTrades={config.totalTrades}
                targetWins={config.targetWins}
                currentWins={currentWins}
                currentTradeAmount={nextTradeAmount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
                    <TradeEntry
                        amount={nextTradeAmount}
                        onResult={handleTradeResult}
                        disabled={trades.length >= config.totalTrades || currentWins >= config.targetWins}
                    />
                    <TradeLog trades={trades} onReset={handleReset} />
                </div>

                <aside className="lg:col-span-4 flex flex-col gap-8 overflow-y-auto">
                    <CalculationsPanel
                        capital={config.capital}
                        totalTrades={config.totalTrades}
                        targetWins={config.targetWins}
                        payout={config.payout}
                        onUpdate={handleConfigUpdate}
                    />
                </aside>
            </div>
        </div>
    );
}

export default App;
