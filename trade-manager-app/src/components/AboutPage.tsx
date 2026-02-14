import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Activity,
    ShieldCheck,
    Database,
    Zap,
    TrendingUp,
    BarChart2,
    Lock,
    Smartphone,
    Code,
    Layers,
    Github
} from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

interface AboutPageProps {
    onBack?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen pb-20 overflow-x-hidden relative bg-background grid-background">
            {onBack && (
                <button
                    onClick={onBack}
                    className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md text-text-secondary hover:text-white transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
            )}

            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-10 max-w-4xl mx-auto space-y-6"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-accent">V 1.0.0 Release</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-black tracking-tighter text-white text-glow">
                        Master Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-500 animate-gradient bg-[length:200%_auto]">Trading Flow</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                        A professional-grade trading journal and analytics engine designed to help you track, analyze, and optimize your trading performance with precision.
                    </motion.p>
                </motion.div>
            </section>

            {/* Core Features */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto space-y-20">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">Built for Performance</h2>
                        <p className="text-xl text-text-secondary font-medium">Everything you need to scale your trading business.</p>
                    </div>

                    {/* Feature 1: Logging */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    >
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Real-time Trade Logging</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Log executions instantly with automated position sizing calculations. Attach visual evidence to every trade and categorize by strategy to identify what's working.
                            </p>
                            <ul className="space-y-3">
                                {['Instant Execution Logging', 'Screenshot Attachments', 'Strategy Tagging'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="premium-glass p-1.5 rounded-[2rem]">
                            <div className="bg-[#0B0E14] p-12 rounded-[1.8rem] h-80 flex items-center justify-center relative overflow-hidden group">
                                <TrendingUp className="w-48 h-48 text-accent/10 group-hover:text-accent/20 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent h-1/2 w-full top-0 opacity-0 group-hover:opacity-100 group-hover:animate-scan pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 2: Analytics */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse"
                    >
                        <div className="md:order-2 space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <BarChart2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Deep Dive Analytics</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Go beyond simple P&L. Visualize your equity curve, analyze win rates by time of day, and track your daily compounding progress against targets.
                            </p>
                            <ul className="space-y-3">
                                {['Equity Curve Visualization', 'Win Rate Heatmaps', 'Profit Factor Analysis'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="premium-glass p-1.5 rounded-[2rem]">
                            <div className="bg-[#0B0E14] p-12 rounded-[1.8rem] h-80 flex items-center justify-center relative overflow-hidden group">
                                <Lock className="w-48 h-48 text-emerald-500/10 group-hover:text-emerald-500/20 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/2 w-full top-0 opacity-0 group-hover:opacity-100 group-hover:animate-scan pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 3: Security */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    >
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Enterprise-Grade Security</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Your data is encrypted and stored securely in the cloud via Supabase. We implement strict Row Level Security (RLS) so you are the only one who can access your trade data.
                            </p>
                            <ul className="space-y-3">
                                {['End-to-End Encryption', 'Row Level Security', 'Automated Backups'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass-panel p-1 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-transparent">
                            <div className="glass-panel p-8 rounded-xl bg-black/40 h-64 flex items-center justify-center border-0">
                                <Lock className="w-32 h-32 text-emerald-500/20" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-20 px-6 bg-surface/30 border-y border-white/5 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">Powered by Modern Tech</h2>
                        <p className="text-text-secondary">Built on a stack designed for speed, reliability, and scale.</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {[
                            { name: 'React 18', icon: <Code className="w-6 h-6" />, color: 'text-blue-400' },
                            { name: 'TypeScript', icon: <Layers className="w-6 h-6" />, color: 'text-blue-600' },
                            { name: 'Supabase', icon: <Database className="w-6 h-6" />, color: 'text-emerald-400' },
                            { name: 'Tailwind', icon: <Zap className="w-6 h-6" />, color: 'text-cyan-400' },
                            { name: 'Framer Motion', icon: <Activity className="w-6 h-6" />, color: 'text-purple-400' },
                            { name: 'Vite', icon: <Zap className="w-6 h-6" />, color: 'text-yellow-400' },
                            { name: 'Recharts', icon: <BarChart2 className="w-6 h-6" />, color: 'text-red-400' },
                            { name: 'Responsive', icon: <Smartphone className="w-6 h-6" />, color: 'text-gray-400' },
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="glass-panel p-6 rounded-xl flex flex-col items-center gap-3 hover:bg-white/5 transition-colors group"
                            >
                                <div className={`${tech.color} group-hover:scale-110 transition-transform duration-300`}>{tech.icon}</div>
                                <span className="text-sm font-bold text-gray-300">{tech.name}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-20 pb-10 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    <p className="text-text-secondary text-sm">
                        Built with ❤️ for Traders.
                    </p>
                    <div className="flex justify-center gap-6">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                    </div>
                    <p className="text-xs text-gray-600">
                        © 2024 Trade Flow. All rights reserved.
                    </p>
                </motion.div>
            </footer>
        </div>
    );
};
