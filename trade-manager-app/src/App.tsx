import { useState, useMemo, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CalculationsPanel } from './components/CalculationsPanel';
import { TradeLog } from './components/TradeLog';
import { TradeEntry } from './components/TradeEntry';
import { History } from './components/History';
import { TradingLogic } from './tradingLogic';
import { History as HistoryIcon } from 'lucide-react';

interface TradeRecord {
    id: number;
    amount: number;
    result: 'W' | 'L' | null;
    portfolioAfter: number;
}

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [dbSessionId, setDbSessionId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    const [config, setConfig] = useState({
        capital: 100,
        totalTrades: 10,
        targetWins: 4,
        payout: 80,
        autoCompounding: false,
        stopLossLimit: 20,
        stopLossEnabled: false,
        dailyGoal: 2,
        dailyGoalType: '%' as '%' | '$'
    });

    const [trades, setTrades] = useState<TradeRecord[]>([]);
    const [sessionCount, setSessionCount] = useState(1);

    // Auth & Data Loading
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load User Data
    useEffect(() => {
        if (!session) return;

        const loadData = async () => {
            // 1. Load Config
            const { data: configData } = await supabase
                .from('protected_configs')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (configData) {
                setConfig(prev => ({
                    ...prev,
                    capital: configData.capital,
                    totalTrades: configData.total_trades,
                    targetWins: configData.target_wins,
                    payout: configData.payout,
                    autoCompounding: configData.auto_compounding,
                    dailyGoal: configData.daily_goal || prev.dailyGoal,
                    dailyGoalType: configData.daily_goal_type || prev.dailyGoalType
                }));
            }

            // 2. Load Active Session
            const { data: activeSession } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (activeSession) {
                setDbSessionId(activeSession.id);
                setSessionCount(activeSession.session_number);

                // Load Trades for this session
                const { data: tradeData } = await supabase
                    .from('trades')
                    .select('*')
                    .eq('session_id', activeSession.id)
                    .order('trade_index', { ascending: true });

                if (tradeData) {
                    const mappedTrades: TradeRecord[] = tradeData.map(t => ({
                        id: new Date(t.created_at).getTime(),
                        amount: t.amount,
                        result: t.result as 'W' | 'L' | null,
                        portfolioAfter: t.portfolio_after
                    }));
                    setTrades(mappedTrades);
                }
            } else {
                // Determine next session number
                const { count } = await supabase
                    .from('sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id);

                setSessionCount((count || 0) + 1);
                setDbSessionId(null); // Will be created on first trade
                setTrades([]);
            }
        };

        loadData();
    }, [session]);

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
        // If portfolio dropped below 0 (bust), return 0 to stop
        if (currentPortfolio <= 0) return 0;
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
            return Math.ceil(Math.log(1 + goalFraction) / Math.log(factor));
        } else {
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
    const handleTradeResult = useCallback(async (result: 'W' | 'L') => {
        if (!session) return;

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

        // Optimistic UI update
        setTrades(prev => [...prev, newTrade]);

        // DB Sync
        let currentDbSessionId = dbSessionId;

        // Create session if not exists
        if (!currentDbSessionId) {
            const { data, error } = await supabase
                .from('sessions')
                .insert({
                    user_id: session.user.id,
                    session_number: sessionCount,
                    initial_capital: config.capital,
                    is_active: true
                })
                .select()
                .single();

            if (data) {
                currentDbSessionId = data.id;
                setDbSessionId(data.id);
            } else if (error) {
                console.error("Error creating session", error);
                return;
            }
        }

        // Insert Trade
        if (currentDbSessionId) {
            await supabase.from('trades').insert({
                session_id: currentDbSessionId,
                user_id: session.user.id,
                trade_index: currentTradeIndex, // 0-based
                wins_reached: currentWins + (result === 'W' ? 1 : 0),
                amount: amount,
                result: result,
                portfolio_after: portfolioAfter
            });
        }

    }, [nextTradeAmount, currentPortfolio, multiplier, currentWins, session, dbSessionId, sessionCount, config.capital, currentTradeIndex]);

    const handleConfigUpdate = async (newParams: Partial<typeof config>) => {
        const structuralFields = ['capital', 'totalTrades', 'targetWins', 'payout'];
        const isStructuralChange = Object.keys(newParams).some(key => structuralFields.includes(key));

        setConfig(prev => {
            const updated = { ...prev, ...newParams };

            // Sync config to DB
            if (session) {
                supabase.from('protected_configs').upsert({
                    user_id: session.user.id,
                    capital: updated.capital,
                    total_trades: updated.totalTrades,
                    target_wins: updated.targetWins,
                    payout: updated.payout,
                    auto_compounding: updated.autoCompounding,
                    daily_goal: updated.dailyGoal,
                    daily_goal_type: updated.dailyGoalType
                }).then(({ error }) => {
                    if (error) console.error("Config sync error", error);
                });
            }

            return updated;
        });

        if (isStructuralChange) {
            if (dbSessionId) {
                setTrades([]);
                setDbSessionId(null);
            }
        }
    };

    const handleReset = async () => {
        const isSessionComplete = currentWins >= config.targetWins || trades.length >= config.totalTrades;
        let nextCapital = config.capital;

        if (isSessionComplete && config.autoCompounding) {
            nextCapital = Math.round(currentPortfolio * 100) / 100;
        }

        // Close current session in DB
        if (dbSessionId && session) {
            let outcome = 'BREAKEVEN';
            if (currentPortfolio > config.capital) outcome = 'WIN';
            if (currentPortfolio < config.capital) outcome = 'LOSS';

            await supabase
                .from('sessions')
                .update({
                    is_active: false,
                    completed_at: new Date().toISOString(),
                    final_capital: currentPortfolio,
                    total_trades: trades.length,
                    total_wins: currentWins,
                    outcome: outcome
                })
                .eq('id', dbSessionId);
        }

        if (session) {
            // Get next session number
            const { count } = await supabase
                .from('sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);

            setSessionCount((count || 0) + 1);
        }

        // Update config if compounding
        if (nextCapital !== config.capital) {
            handleConfigUpdate({ capital: nextCapital });
        }

        setTrades([]);
        setDbSessionId(null);
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-text-primary">Loading...</div>;

    if (!session) {
        return <AuthUI />;
    }

    return (
        <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 flex flex-col gap-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter glow-text">TRADE<span className="text-blue-500">MASTER</span></h1>
                    <p className="text-text-secondary text-xs uppercase font-bold tracking-[0.3em] mt-1 ml-1 opacity-60">Matrix Money Management Pro</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors uppercase font-bold tracking-wider"
                        >
                            <HistoryIcon className="w-4 h-4" />
                            History
                        </button>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider"
                        >
                            Sign Out
                        </button>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest">Protocol Version</p>
                        <p className="font-mono text-xs text-blue-400">EXCEL-P_1.0.4</p>
                    </div>
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

            {showHistory && <History session={session} onClose={() => setShowHistory(false)} />}
        </div>
    );
}

export default App;
