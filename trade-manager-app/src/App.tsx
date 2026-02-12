import { useState, useMemo, useCallback } from 'react';
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
        payout: 80, // Default payout %
        autoCompounding: false,
        stopLossLimit: 20, // Default 20% drawdown limit
        stopLossEnabled: false,
        dailyGoal: 2,
        dailyGoalType: '%' as '%' | '$'
    });

    const [trades, setTrades] = useState<TradeRecord[]>([]);
    const [sessionCount, setSessionCount] = useState(1);

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

    const projectedGrowth = useMemo(() => {
        const factor = logic.getFactor(0, 0);
        return (factor - 1) * 100;
    }, [logic]);

    const minRequiredCapital = useMemo(() => {
        return logic.getMinimumRequiredCapital(0, 0, 1.0);
    }, [logic]);

    const sessionsRequired = useMemo(() => {
        const factor = logic.getFactor(0, 0);
        const growthPerSession = factor - 1;
        if (growthPerSession <= 0) return 0;

        if (config.dailyGoalType === '%') {
            const goalFraction = config.dailyGoal / 100;
            // Compound interest formula: (1 + growthPerSession)^n = 1 + goalFraction
            // n * log(1 + growthPerSession) = log(1 + goalFraction)
            return Math.ceil(Math.log(1 + goalFraction) / Math.log(factor));
        } else {
            // How many sessions to reach a fixed dollar profit
            // This is harder with compounding, but if we assume compounding:
            // capital * (factor^n) = capital + dailyGoal
            // factor^n = (capital + dailyGoal) / capital
            return Math.ceil(Math.log((config.capital + config.dailyGoal) / config.capital) / Math.log(factor));
        }
    }, [logic, config.dailyGoal, config.dailyGoalType, config.capital]);

    const goalFinalCapital = useMemo(() => {
        if (config.dailyGoalType === '%') {
            return config.capital * (1 + config.dailyGoal / 100);
        } else {
            return config.capital + config.dailyGoal;
        }
    }, [config.capital, config.dailyGoal, config.dailyGoalType]);

    const isRiskCritical = useMemo(() => {
        if (!config.stopLossEnabled) return false;
        const currentDrawdown = currentPortfolio < config.capital
            ? ((config.capital - currentPortfolio) / config.capital) * 100
            : 0;
        return currentDrawdown >= config.stopLossLimit;
    }, [config.stopLossEnabled, config.stopLossLimit, currentPortfolio, config.capital]);

    // Actions
    const handleTradeResult = useCallback((result: 'W' | 'L') => {
        const amount = nextTradeAmount;
        let portfolioAfter = currentPortfolio;

        if (result === 'W') {
            portfolioAfter += amount * (multiplier - 1);
        } else {
            portfolioAfter -= amount;
        }

        const newTrade: TradeRecord = {
            id: Date.now(),
            amount,
            result,
            portfolioAfter
        };

        setTrades(prev => {
            const updatedTrades = [...prev, newTrade];

            return updatedTrades;
        });
    }, [nextTradeAmount, currentPortfolio, multiplier, currentWins, config.targetWins, config.totalTrades, config.autoCompounding]);

    const handleConfigUpdate = (newParams: Partial<typeof config>) => {
        const structuralFields = ['capital', 'totalTrades', 'targetWins', 'payout'];
        const isStructuralChange = Object.keys(newParams).some(key => structuralFields.includes(key));

        setConfig(prev => ({ ...prev, ...newParams }));

        if (isStructuralChange) {
            setTrades([]); // Only reset session for structural changes
        }
    };

    const handleReset = () => {
        const isSessionComplete = currentWins >= config.targetWins || trades.length >= config.totalTrades;

        if (isSessionComplete) {
            if (config.autoCompounding) {
                // Copy current portfolio to initial capital for compounding (round to 2 decimals)
                const roundedCapital = Math.round(currentPortfolio * 100) / 100;
                setConfig(prev => ({ ...prev, capital: roundedCapital }));
            }
            setSessionCount(prev => prev + 1);
        }

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
                targetWins={config.targetWins}
                currentWins={currentWins}
                projectedGrowth={projectedGrowth}
                stopLossLimit={config.stopLossLimit}
                stopLossEnabled={config.stopLossEnabled}
                sessionCount={sessionCount}
                sessionsRequired={sessionsRequired}
                goalFinalCapital={goalFinalCapital}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
                    <TradeEntry
                        amount={nextTradeAmount}
                        onResult={handleTradeResult}
                        disabled={trades.length >= config.totalTrades || currentWins >= config.targetWins}
                        isRiskCritical={isRiskCritical}
                    />
                    <TradeLog trades={trades} onReset={handleReset} />
                </div>

                <aside className="lg:col-span-4 flex flex-col gap-8 overflow-y-auto">
                    <CalculationsPanel
                        capital={config.capital}
                        totalTrades={config.totalTrades}
                        targetWins={config.targetWins}
                        payout={config.payout}
                        autoCompounding={config.autoCompounding}
                        stopLossLimit={config.stopLossLimit}
                        stopLossEnabled={config.stopLossEnabled}
                        dailyGoal={config.dailyGoal}
                        dailyGoalType={config.dailyGoalType}
                        sessionsRequired={sessionsRequired}
                        minRequiredCapital={minRequiredCapital}
                        onUpdate={handleConfigUpdate}
                    />
                </aside>
            </div>
        </div>
    );
}

export default App;
