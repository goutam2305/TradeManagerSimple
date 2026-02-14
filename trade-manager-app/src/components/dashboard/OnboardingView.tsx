import React from 'react';
import { Play, Settings, BookOpen, ArrowRight } from 'lucide-react';

interface OnboardingViewProps {
    onNavigate: (view: 'trade' | 'settings' | 'history') => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-16 animate-in fade-in zoom-in duration-1000">
            <div className="text-center space-y-4 max-w-2xl">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-accent/10 mb-2">
                    <Play className="w-8 h-8 text-accent fill-accent/20" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Welcome back, <span className="text-accent underline decoration-accent/30 underline-offset-8">Trader</span>
                </h1>
                <p className="text-base text-text-secondary leading-relaxed">
                    Ready for your next trading session? Follow the steps below <br />to configure your parameters and start executing.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {/* Step 1: Settings */}
                <div
                    onClick={() => onNavigate('settings')}
                    className="glass-panel p-6 rounded-3xl relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group/card"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-4xl font-bold text-white select-none">01</div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Settings className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Setup Parameters</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">Configure your initial capital, target wins, and payout settings.</p>
                        </div>
                        <div className="flex items-center text-xs font-bold text-purple-400 uppercase tracking-widest group-hover/card:translate-x-1 transition-transform">
                            Configure <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>

                {/* Step 2: Start Session */}
                <div
                    onClick={() => onNavigate('trade')}
                    className="glass-panel p-6 rounded-3xl relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group/card border-accent/20"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-4xl font-bold text-white select-none">02</div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <Play className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-accent mb-1">Start Trading</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">Launch the execution interface and start your recursive session.</p>
                        </div>
                        <div className="flex items-center text-xs font-bold text-accent uppercase tracking-widest group-hover/card:translate-x-1 transition-transform">
                            Start session <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>

                {/* Step 3: Analytics */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden opacity-40 group/card">
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-4xl font-bold text-white select-none">03</div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <BookOpen className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">View Analytics</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">Detailed performance reports will be available after your first session.</p>
                        </div>
                        <div className="flex items-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                            Locked <span className="text-[10px] ml-2 bg-white/5 px-2 py-0.5 rounded">CALIBRATING</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
