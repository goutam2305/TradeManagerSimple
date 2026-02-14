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
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UserProfile } from './components/UserProfile';
import { History as HistoryIcon } from 'lucide-react';
import { ImageModal } from './components/ImageModal';
import { Calculator } from './components/Calculator';
import { UpdatePassword } from './components/UpdatePassword';

import { FeaturesPage } from './components/FeaturesPage';
import { DemoPage } from './components/DemoPage';
import { PublicLayout } from './components/PublicLayout';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { SecurityPage } from './components/SecurityPage';

interface TradeRecord {
    id: number; // Timestamp
    dbId?: string; // Database Primary Key (UUID)
    amount: number;
    result: 'W' | 'L' | null;
    portfolioAfter: number;
    imageUrl?: string;
}

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [dbSessionId, setDbSessionId] = useState<string | null>(null);
    const [viewImage, setViewImage] = useState<string | null>(null);

    const [config, setConfig] = useState({
        capital: 100,
        totalTrades: 6,
        targetWins: 1,
        payout: 92,
        autoCompounding: true,
        stopLossLimit: 10,
        stopLossEnabled: true,
        dailyGoal: 2,
        dailyGoalType: '%' as '%' | '$'
    });

    const [trades, setTrades] = useState<TradeRecord[]>([]);
    const [sessionCount, setSessionCount] = useState(1);
    const [todaySessionCount, setTodaySessionCount] = useState(0);
    const [userName, setUserName] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // View State with Persistence
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem('tradeflow_current_view') || 'trademanager';
    });

    useEffect(() => {
        if (currentView !== 'update-password') {
            localStorage.setItem('tradeflow_current_view', currentView);
        }
    }, [currentView]);

    // Auth & Data Loading
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'PASSWORD_RECOVERY') {
                setCurrentView('update-password');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load User Data
    useEffect(() => {
        if (!session) return;

        const loadData = async () => {
            // 1. Initial Load Config
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
                    dailyGoalType: (configData.daily_goal_type === 'percentage' || configData.daily_goal_type === '%') ? '%' :
                        (configData.daily_goal_type === 'amount' || configData.daily_goal_type === '$') ? '$' :
                            (configData.daily_goal_type || prev.dailyGoalType)
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

            // Load today's count separately
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const { count: sessionCountToday } = await supabase
                .from('sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('is_active', false)
                .gte('created_at', startOfToday.toISOString());

            setTodaySessionCount(sessionCountToday || 0);

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
                        dbId: t.id,
                        amount: t.amount,
                        result: t.result as 'W' | 'L' | null,
                        portfolioAfter: t.portfolio_after,
                        imageUrl: t.image_url
                    }));
                    setTrades(mappedTrades);
                }
            } else {
                // Determine next session number (Global)
                const { data: maxSession } = await supabase
                    .from('sessions')
                    .select('session_number')
                    .eq('user_id', session.user.id)
                    .order('session_number', { ascending: false })
                    .limit(1)
                    .single();

                setSessionCount((maxSession?.session_number || 0) + 1);
                setDbSessionId(null);
                setTrades([]);
            }

            // 3. Load User Profile for Name Sync
            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('full_name, avatar_url')
                .eq('id', session.user.id)
                .single();

            const displayName = profileData?.full_name || session.user.user_metadata?.full_name || '';
            setUserName(displayName);
            setAvatarUrl(profileData?.avatar_url || '');
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

    const isRiskCritical = useMemo(() => {
        if (!config.stopLossEnabled) return false;
        const currentDrawdown = currentPortfolio < config.capital
            ? ((config.capital - currentPortfolio) / config.capital) * 100
            : 0;
        return currentDrawdown >= config.stopLossLimit;
    }, [config.stopLossEnabled, config.stopLossLimit, currentPortfolio, config.capital]);

    // Actions
    const handleTradeResult = useCallback(async (result: 'W' | 'L') => {
        if (!session || isProcessing) return;

        setIsProcessing(true);
        try {
            const amount = nextTradeAmount;
            let portfolioAfter = currentPortfolio;

            if (result === 'W') {
                portfolioAfter += amount * (multiplier - 1);
            } else {
                portfolioAfter -= amount;
            }

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

            let newDbTradeId: string | undefined;

            if (currentDbSessionId) {
                const { data: insertedTrade } = await supabase.from('trades').insert({
                    session_id: currentDbSessionId,
                    user_id: session.user.id,
                    trade_index: currentTradeIndex, // 0-based
                    wins_reached: currentWins + (result === 'W' ? 1 : 0),
                    amount: amount,
                    result: result,
                    portfolio_after: portfolioAfter
                }).select().single();

                if (insertedTrade) {
                    newDbTradeId = insertedTrade.id;
                }
            }

            const newTrade: TradeRecord = {
                id: Date.now(),
                dbId: newDbTradeId,
                amount,
                result,
                portfolioAfter,
                imageUrl: undefined
            };

            // UI Update
            setTrades(prev => [...prev, newTrade]);
        } finally {
            setIsProcessing(false);
        }

    }, [nextTradeAmount, currentPortfolio, multiplier, currentWins, session, dbSessionId, sessionCount, config.capital, currentTradeIndex, isProcessing]);

    const handleConfigUpdate = (newParams: Partial<typeof config>) => {
        const structuralFields = ['capital', 'totalTrades', 'targetWins', 'payout'];
        const isStructuralChange = Object.keys(newParams).some(key => structuralFields.includes(key));

        setConfig(prev => ({ ...prev, ...newParams }));

        if (isStructuralChange) {
            if (dbSessionId) {
                setTrades([]);
                setDbSessionId(null);
            }
        }
    };

    const handleSaveConfig = async () => {
        if (!session) return;

        const { error } = await supabase.from('protected_configs').upsert({
            user_id: session.user.id,
            capital: config.capital,
            total_trades: config.totalTrades,
            target_wins: config.targetWins,
            payout: config.payout,
            auto_compounding: config.autoCompounding,
            daily_goal: config.dailyGoal,
            daily_goal_type: config.dailyGoalType
        }, { onConflict: 'user_id' });

        if (error) {
            console.error("Config save error", error);
            throw error;
        }
    };

    const handleReset = async () => {
        const isSessionComplete = currentWins >= config.targetWins || trades.length >= config.totalTrades;
        let nextCapital = config.capital;

        if (config.autoCompounding && (isSessionComplete || isRiskCritical)) {
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
            // Get next session number (Global MAX + 1)
            const { data: maxSession } = await supabase
                .from('sessions')
                .select('session_number')
                .eq('user_id', session.user.id)
                .order('session_number', { ascending: false })
                .limit(1)
                .single();

            setSessionCount((maxSession?.session_number || 0) + 1);

            // Update Today's Count
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const { count: sessionCountToday } = await supabase
                .from('sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('is_active', false)
                .gte('created_at', startOfToday.toISOString());

            setTodaySessionCount(sessionCountToday || 0);
        }

        // Update config if compounding
        if (nextCapital !== config.capital) {
            handleConfigUpdate({ capital: nextCapital });

            // Auto-save to Supabase so it persists on reload
            if (session) {
                await supabase.from('protected_configs').upsert({
                    user_id: session.user.id,
                    capital: nextCapital,
                    total_trades: config.totalTrades,
                    target_wins: config.targetWins,
                    payout: config.payout,
                    auto_compounding: config.autoCompounding,
                    daily_goal: config.dailyGoal,
                    daily_goal_type: config.dailyGoalType
                }, { onConflict: 'user_id' });
            }
        }

        setTrades([]);
        setDbSessionId(null);
    };

    const handleUploadEvidence = async (tradeIndex: number, file: File) => {
        if (!session || !trades[tradeIndex] || !trades[tradeIndex].dbId) {
            console.error("Cannot upload: Missing session or trade DB ID");
            return;
        }

        const trade = trades[tradeIndex];
        const fileExt = file.name.split('.').pop();
        const fileName = `${trade.dbId}-${Date.now()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('trade-evidence')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('trade-evidence')
                .getPublicUrl(filePath);

            // Update DB
            const { error: updateError } = await supabase
                .from('trades')
                .update({ image_url: publicUrl })
                .eq('id', trade.dbId);

            if (updateError) {
                throw updateError;
            }

            // Update State
            setTrades(prev => prev.map((t, idx) =>
                idx === tradeIndex ? { ...t, imageUrl: publicUrl } : t
            ));

        } catch (error) {
            console.error('Error uploading evidence:', error);
            alert('Failed to upload image');
        }
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            setSession(null);
            setDbSessionId(null);
            setTrades([]);
            setCurrentView('trademanager');
        } catch (error) {
            console.error('Error signing out:', error);
            // Fallback: manually clear session
            setSession(null);
        }
    };

    const [authView, setAuthView] = useState<'login' | 'signup' | null>(null);
    const [showFeaturesPage, setShowFeaturesPage] = useState(false);
    const [showDemoPage, setShowDemoPage] = useState(false);
    const [legalPageView, setLegalPageView] = useState<'privacy' | 'terms' | 'security' | null>(null);

    const closePublicPages = () => {
        setShowFeaturesPage(false);
        setShowDemoPage(false);
        setLegalPageView(null);
        setAuthView(null);
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center text-accent">
            <div className="animate-spin-slow text-4xl">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full" />
            </div>
        </div>
    );
    // Legal Pages (Public)
    if (legalPageView) {
        return (
            <PublicLayout
                onGetStarted={() => { setAuthView('signup'); setLegalPageView(null); }}
                onLogin={() => { setAuthView('login'); setLegalPageView(null); }}
                onFeatures={() => { setShowFeaturesPage(true); setLegalPageView(null); }}
                onHome={closePublicPages}
                onPrivacy={() => setLegalPageView('privacy')}
                onTerms={() => setLegalPageView('terms')}
                onSecurity={() => setLegalPageView('security')}
            >
                {legalPageView === 'privacy' && <PrivacyPage />}
                {legalPageView === 'terms' && <TermsPage />}
                {legalPageView === 'security' && <SecurityPage />}
            </PublicLayout>
        );
    }

    // Features Page (Public)
    if (showFeaturesPage) {
        return (
            <PublicLayout
                onGetStarted={() => { setAuthView('signup'); setShowFeaturesPage(false); }}
                onLogin={() => { setAuthView('login'); setShowFeaturesPage(false); }}
                onFeatures={() => setShowFeaturesPage(true)}
                onHome={closePublicPages}
                onPrivacy={() => setLegalPageView('privacy')}
                onTerms={() => setLegalPageView('terms')}
                onSecurity={() => setLegalPageView('security')}
            >
                <FeaturesPage onBack={closePublicPages} />
            </PublicLayout>
        );
    }

    // Demo Page (Public)
    if (showDemoPage) {
        return (
            <PublicLayout
                onGetStarted={() => { setAuthView('signup'); setShowDemoPage(false); }}
                onLogin={() => { setAuthView('login'); setShowDemoPage(false); }}
                onFeatures={() => { setShowFeaturesPage(true); setShowDemoPage(false); }}
                onHome={closePublicPages}
                onPrivacy={() => setLegalPageView('privacy')}
                onTerms={() => setLegalPageView('terms')}
                onSecurity={() => setLegalPageView('security')}
            >
                <DemoPage onBack={closePublicPages} />
            </PublicLayout>
        );
    }

    // Password Update View (Authenticated)
    if (session && currentView === 'update-password') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <UpdatePassword onSuccess={() => setCurrentView('dashboard')} />
            </div>
        );
    }

    if (!session) {
        if (authView) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <button
                            onClick={() => setAuthView(null)}
                            className="mb-8 text-sm text-text-secondary hover:text-white flex items-center gap-2 transition-colors"
                        >
                            ← Back to Home
                        </button>
                        <AuthUI initialView={authView} />
                    </div>
                </div>
            );
        }
        return (
            <PublicLayout
                onGetStarted={() => setAuthView('signup')}
                onLogin={() => setAuthView('login')}
                onFeatures={() => setShowFeaturesPage(true)}
                onHome={closePublicPages}
                onPrivacy={() => setLegalPageView('privacy')}
                onTerms={() => setLegalPageView('terms')}
                onSecurity={() => setLegalPageView('security')}
            >
                <LandingPage
                    onGetStarted={() => setAuthView('signup')}
                    onDemo={() => setShowDemoPage(true)}
                />
            </PublicLayout>
        );
    }

    const getPageTitle = () => {
        switch (currentView) {
            case 'dashboard': return 'Analytics Dashboard';
            case 'trademanager': return 'Trade Manager';
            case 'history': return 'Session Log';
            case 'calculator': return 'Compound Calculator';
            case 'settings': return 'Configuration';
            case 'profile': return 'User Profile';
            case 'update-password': return 'Update Password';
            default: return 'Dashboard';
        }
    };

    return (
        <Layout
            userName={userName}
            userEmail={session.user.email}
            avatarUrl={avatarUrl}
            onSignOut={handleSignOut}
            onToggleSettings={() => {
                setCurrentView(v => v === 'settings' ? 'trademanager' : 'settings');
            }}
            activeView={currentView}
            onNavigate={(view) => {
                if (view === 'history') {
                    setCurrentView('history');
                } else {
                    setCurrentView(view);
                }
            }}
            pageTitle={getPageTitle()}
        >
            {/* Dashboard View: Stats + History Table */}
            {currentView === 'dashboard' && (
                <div className="flex flex-col gap-6">
                    <AnalyticsDashboard
                        session={session}
                        currentPortfolio={currentPortfolio}
                        initialCapital={config.capital}
                        targetWins={config.targetWins}
                        currentWins={currentWins}
                        projectedGrowth={projectedGrowth}
                        stopLossLimit={config.stopLossLimit}
                        stopLossEnabled={config.stopLossEnabled}
                        sessionCount={sessionCount}
                        onNavigate={(view) => {
                            if (view === 'trade') setCurrentView('trademanager');
                            else if (view === 'settings') setCurrentView('settings');
                            else if (view === 'history') setCurrentView('history');
                        }}
                    />
                    <div className="glass-panel p-6 rounded-2xl min-h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <HistoryIcon className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Recent Sessions</h2>
                        </div>
                        <History session={session} isInline={true} hideSelection={true} />
                    </div>
                </div>
            )}

            {/* Trade Manager View: Stats + Execution + Config */}
            {currentView === 'trademanager' && (
                <>
                    <Dashboard
                        currentPortfolio={currentPortfolio}
                        initialCapital={config.capital}
                        targetWins={config.targetWins}
                        currentWins={currentWins}
                        projectedGrowth={projectedGrowth}
                        stopLossLimit={config.stopLossLimit}
                        stopLossEnabled={config.stopLossEnabled}
                        sessionCount={todaySessionCount + 1}
                        sessionsRequired={sessionsRequired}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                            <TradeEntry
                                amount={nextTradeAmount}
                                onResult={handleTradeResult}
                                disabled={trades.length >= config.totalTrades || currentWins >= config.targetWins || isProcessing}
                                isRiskCritical={isRiskCritical}
                            />
                            <TradeLog
                                trades={trades}
                                onReset={handleReset}
                                onUploadEvidence={handleUploadEvidence}
                                onViewEvidence={setViewImage}
                            />
                        </div>

                        <aside id="calculations-panel" className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
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
                                onSave={handleSaveConfig}
                            />
                        </aside>
                    </div>
                </>
            )}

            {/* History View (Sidebar) */}
            {currentView === 'history' && (
                <div className="h-full">
                    <History session={session} />
                </div>
            )}

            {/* Calculator View */}
            {currentView === 'calculator' && (
                <div className="h-full">
                    <Calculator />
                </div>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
                <div className="max-w-2xl mx-auto">
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
                        onSave={handleSaveConfig}
                    />
                </div>
            )}


            {/* User Profile View */}
            {currentView === 'profile' && (
                <UserProfile
                    session={session}

                    onProfileUpdate={(data) => {
                        setUserName(data.full_name);
                        setAvatarUrl(data.avatar_url || '');
                    }}
                />
            )}

            <ImageModal isOpen={!!viewImage} onClose={() => setViewImage(null)} imageUrl={viewImage} />
        </Layout>
    );
}

export default App;

