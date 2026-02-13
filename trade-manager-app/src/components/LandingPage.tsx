import React from 'react';
import { ArrowRight, BarChart2, LayoutDashboard, Shield } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-accent selection:text-white overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">TRADE<span className="text-accent">FLOW</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                        <a href="#" className="hover:text-white transition-colors">Features</a>
                        <a href="#" className="hover:text-white transition-colors">Pricing</a>
                        <a href="#" className="hover:text-white transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="bg-accent hover:bg-accent-hover text-background px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                        >
                            Start Free Trial
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
                    <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
                    <div className="absolute top-[40%] right-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        Next-Gen Analytics Now Live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Master Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">Trading Flow</span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        The ultimate edge for modern traders. Track every execution, analyze performance with institutional-grade metrics, and master your psychological game in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            Get Started for Free
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface border border-border hover:border-accent/50 text-white font-medium text-lg transition-all flex items-center justify-center gap-2 group">
                            View Live Demo
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="relative mt-20 max-w-6xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-b from-accent/20 to-transparent rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-panel border border-border rounded-xl p-2 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

                        {/* Creating a CSS-only mockup of the dashboard to keep it lightweight */}
                        <div className="bg-[#0B0E14] rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
                            {/* Stats Row */}
                            <div className="col-span-1 p-5 rounded-xl bg-surface/50 border border-white/5 space-y-2">
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Net P&L</div>
                                <div className="text-2xl font-bold text-white">$12,450.80</div>
                                <div className="text-sm text-accent">+14.2%</div>
                            </div>
                            <div className="col-span-2 p-5 rounded-xl bg-surface/50 border border-white/5 flex items-end relative overflow-hidden">
                                <div className="w-full h-24 flex items-end gap-1">
                                    {/* CSS Bar Chart */}
                                    <div className="flex-1 bg-accent/20 h-[40%] rounded-t-sm" />
                                    <div className="flex-1 bg-accent/40 h-[70%] rounded-t-sm" />
                                    <div className="flex-1 bg-accent/60 h-[50%] rounded-t-sm" />
                                    <div className="flex-1 bg-accent h-[85%] rounded-t-sm shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                                    <div className="flex-1 bg-accent/50 h-[60%] rounded-t-sm" />
                                </div>
                                <div className="absolute top-5 left-5 text-xs text-text-secondary uppercase tracking-wider">Equity Growth</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: BarChart2, title: "Real-time Analytics", desc: "Every trade is calculated instantly. Get precise metrics on your expectancy, average R-multiple, and drawdown." },
                        { icon: LayoutDashboard, title: "Session Manager", desc: "Optimize your trading hours. Identify which market sessions and volatility profiles yield your highest win rates." },
                        { icon: Shield, title: "Risk Calculator", desc: "Stop over-leveraging. Our advanced position sizer calculates exact risk based on your current balance and volatility." }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-panel border border-border/50 hover:border-accent/30 transition-all hover:translate-y-1 group">
                            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 px-6">
                <div className="max-w-5xl mx-auto p-12 rounded-3xl bg-surface/30 border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />

                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to level up your edge?</h2>
                    <p className="text-text-secondary mb-8 max-w-xl mx-auto relative z-10">
                        Join 15,000+ traders who have optimized their profitability using TradeFlow's institutional tools.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-4 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold text-lg transition-all hover:scale-105 relative z-10"
                    >
                        Start Your 14-Day Free Trial
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-accent" />
                        <span className="font-bold tracking-tight">TRADE<span className="text-accent">FLOW</span></span>
                    </div>
                    <div className="text-sm text-text-secondary">
                        © 2024 TradeFlow Analytics • Systems Operational <span className="text-success">●</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
