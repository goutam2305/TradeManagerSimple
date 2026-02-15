import React from 'react';
import { ArrowRight, BarChart2, LayoutDashboard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
    onGetStarted: () => void;
    onDemo: () => void;
    session: any;
    setCurrentView: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
    onGetStarted,
    onDemo,
    session,
    setCurrentView
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 1, 0.5, 1]
            }
        }
    };

    return (
        <div className="relative">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
                    <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
                    <div className="absolute top-[40%] right-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="relative max-w-4xl mx-auto text-center space-y-8"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        Next-Gen Analytics Now Live
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-glow">
                        MASTER YOUR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-accent bg-[length:200%_auto] animate-gradient">TRADING FLOW</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                        The ultimate edge for modern traders. Institutional-grade metrics, psychological mastery, and real-time execution tracking.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => {
                                if (session) setCurrentView('pricing');
                                else onGetStarted();
                            }}
                            className="w-full sm:w-auto px-10 py-5 rounded-xl bg-accent hover:bg-accent-hover text-background font-black text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] uppercase tracking-wider animate-pulse-glow"
                        >
                            {session ? 'View Pricing' : 'Get Started for Free'}
                        </button>
                        <button
                            onClick={onDemo}
                            className="w-full sm:w-auto px-10 py-5 rounded-xl bg-surface/50 border border-white/10 hover:border-accent/50 text-white font-bold text-lg transition-all flex items-center justify-center gap-2 group backdrop-blur-sm uppercase tracking-wider"
                        >
                            View Live Demo
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* Dashboard Preview Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mt-20 max-w-6xl mx-auto"
                >
                    <div className="absolute -inset-4 bg-gradient-to-b from-accent/20 to-transparent rounded-[2.5rem] blur-2xl opacity-50" />
                    <div className="relative premium-glass rounded-3xl p-3 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

                        <div className="bg-[#0B0E14] rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-95">
                            <div className="col-span-1 p-6 rounded-2xl bg-surface/50 border border-white/5 space-y-3">
                                <div className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold">Net P&L</div>
                                <div className="text-4xl font-black text-white">$12,450.80</div>
                                <div className="text-sm font-bold text-success flex items-center gap-1 selection:bg-success/20">
                                    <ArrowRight className="-rotate-45 w-4 h-4" />
                                    +14.2%
                                </div>
                            </div>
                            <div className="col-span-2 p-6 rounded-2xl bg-surface/50 border border-white/5 flex items-end relative overflow-hidden">
                                <div className="w-full h-32 flex items-end gap-2 px-2">
                                    <div className="flex-1 bg-accent/20 h-[40%] rounded-t-lg" />
                                    <div className="flex-1 bg-accent/40 h-[70%] rounded-t-lg" />
                                    <div className="flex-1 bg-accent/60 h-[50%] rounded-t-lg" />
                                    <div className="flex-1 bg-accent h-[90%] rounded-t-lg shadow-[0_0_20px_var(--accent-glow)]" />
                                    <div className="flex-1 bg-accent/50 h-[65%] rounded-t-lg" />
                                    <div className="flex-1 bg-accent/30 h-[45%] rounded-t-lg" />
                                </div>
                                <div className="absolute top-6 left-6 text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold">Equity Growth Curve</div>
                            </div>
                        </div>

                        {/* Scan Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent h-1/2 w-full top-0 opacity-0 group-hover:opacity-100 group-hover:animate-scan pointer-events-none" />
                    </div>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: BarChart2, title: "Real-time Analytics", desc: "Every trade is calculated instantly. Get precise metrics on your expectancy, average R-multiple, and drawdown." },
                        { icon: LayoutDashboard, title: "Session Manager", desc: "Optimize your trading hours. Identify which market sessions and volatility profiles yield your highest win rates." },
                        { icon: Shield, title: "Risk Calculator", desc: "Stop over-leveraging. Our advanced position sizer calculates exact risk based on your balance." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-3xl premium-glass border border-white/5 hover:border-accent/40 transition-all hover:-translate-y-2 group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-500">
                                <feature.icon className="w-7 h-7 text-accent group-hover:drop-shadow-[0_0_8px_var(--accent-glow)]" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{feature.title}</h3>
                            <p className="text-text-secondary leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto p-16 rounded-[3rem] bg-gradient-to-b from-surface to-background border border-white/5 text-center relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 tracking-tighter uppercase">
                        READY TO <span className="text-accent underline decoration-4 underline-offset-8">LEVEL UP</span> YOUR EDGE?
                    </h2>
                    <p className="text-xl text-text-secondary mb-12 max-w-xl mx-auto relative z-10 font-medium leading-relaxed">
                        Join 15,000+ traders who have optimized their profitability using TradeFlow's institutional tools.
                    </p>
                    <button
                        onClick={() => {
                            if (session) setCurrentView('pricing');
                            else onGetStarted();
                        }}
                        className="px-12 py-5 rounded-2xl bg-accent hover:bg-accent-hover text-background font-black text-xl transition-all hover:scale-105 relative z-10 shadow-xl hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] animate-pulse-glow uppercase tracking-widest"
                    >
                        {session ? 'Unlock Pro Access' : 'Get Started Now — It\'s Free'}
                    </button>

                    <div className="mt-8 text-sm text-text-secondary/50 font-bold uppercase tracking-[0.3em] relative z-10">
                        Secure Checkout • Instant Setup
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
