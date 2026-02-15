import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layout, Target } from 'lucide-react';

interface FeaturesPageProps {
    onBack: () => void;
    onGetStarted: () => void;
}

const NeuralCore = () => (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center">
        {/* Pulsing Core */}
        <div className="absolute w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-16 h-16 bg-accent/40 rounded-full blur-xl animate-ping" />

        <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Neural Network Nodes */}
            {[...Array(8)].map((_, i) => (
                <g key={i} style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: '100px 100px' }}>
                    <motion.line
                        x1="100" y1="100" x2="160" y2="100"
                        stroke="rgba(34, 211, 238, 0.2)"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                    />
                    <motion.circle
                        cx="160" cy="100" r="3"
                        fill="#22d3ee"
                        filter="url(#glow)"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                </g>
            ))}

            {/* Center Core */}
            <circle cx="100" cy="100" r="20" fill="rgba(34, 211, 238, 0.1)" stroke="#22d3ee" strokeWidth="2" filter="url(#glow)" />
            <motion.path
                d="M85 100 L115 100 M100 85 L100 115"
                stroke="#22d3ee"
                strokeWidth="2"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '100px 100px' }}
            />

            {/* Data Scanning Ring */}
            <motion.circle
                cx="100" cy="100" r="70"
                stroke="rgba(34, 211, 238, 0.1)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="10 20"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
        </svg>

        {/* Overlay Labels */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full relative">
                <motion.div
                    className="absolute top-[20%] right-[10%] px-3 py-1 bg-surface/80 backdrop-blur-sm border border-white/10 rounded-lg text-[10px] font-mono text-accent"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    NEURAL_PROCESS_01
                </motion.div>
                <motion.div
                    className="absolute bottom-[30%] left-[5%] px-3 py-1 bg-surface/80 backdrop-blur-sm border border-white/10 rounded-lg text-[10px] font-mono text-emerald-400"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    RISK_GUARD_ACTIVE
                </motion.div>
            </div>
        </div>
    </div>
);

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const imageVariant = {
    hidden: { opacity: 0, scale: 0.95, rotateX: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onGetStarted }) => {
    return (
        <div className="relative pb-20">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-glow uppercase">
                            NEXT-LEVEL <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-500 animate-gradient bg-[length:200%_auto]">TRADING INTELLIGENCE</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium mb-10">
                            Discover the toolkit that gives institutional-grade power to retail traders. Automate your risk, visualize your edge, and scale your capital.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="px-10 py-5 rounded-2xl bg-accent hover:bg-accent-hover text-background font-black text-xl transition-all hover:scale-105 shadow-xl hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] animate-pulse-glow uppercase tracking-widest"
                        >
                            Get Started Now
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Feature 1: Dashboard */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-wider">
                            <Layout className="w-4 h-4" /> Dashboard
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase">Command Center for <br />Your Capital</h2>
                        <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                            A unified view of your trading business. Track your net P&L, win rate, and equity growth in real-time. Our dashboard aggregates data from every session to give you instant feedback on your performance.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Real-time P&L Tracking",
                                "Session-based Performance Metrics",
                                "One-click Session Management"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                    </div>
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={imageVariant}
                        className="relative group cursor-pointer"
                    >
                        {/* Nano Banana Pro Style: Glassmorphism & Neon Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-accent/30 to-purple-500/30 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/20 backdrop-blur-[2px] z-0" />

                        <div className="relative z-10 p-2 bg-background/50 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                            <img
                                src="/assets/feature-dashboard.png"
                                alt="Trading Dashboard"
                                className="rounded-xl w-full brightness-90 group-hover:brightness-100 transition-all duration-500"
                            />
                            {/* Scanning line effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent h-1/2 w-full top-0 opacity-0 group-hover:animate-scan pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Feature AI: AI Trading (Coming Soon) */}
            <section className="py-20 px-6 bg-surface/30 border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={imageVariant}
                        className="relative md:order-2"
                    >
                        <NeuralCore />

                        {/* Coming Soon Badge Over visual */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="px-6 py-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/20 shadow-2xl"
                            >
                                <span className="text-sm font-black text-white tracking-[0.3em] uppercase whitespace-nowrap">Under Development</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="space-y-8 md:order-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-wider">
                            <Zap className="w-4 h-4" /> AI Trading
                        </div>
                        <div className="relative inline-block">
                            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase">Visual AI Analysis & <br />Autonomous Execution</h2>
                            <div className="absolute -top-4 -right-12 px-2 py-1 rounded bg-accent text-[10px] font-black text-background uppercase tracking-widest rotate-12 shadow-glow">Coming Soon</div>
                        </div>
                        <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                            Our upcoming market visual analysis bot utilizes advanced neural networks to watch the charts 24/7. It identifies complex candlestick patterns and executes trades with institutional-grade risk management.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Neural Pattern Recognition",
                                "Real-time Risk Guardrails",
                                "Visual Evidence Processing",
                                "Autonomous Execution Logic"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                    </div>
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* Feature 2: Trade Execution (Reversed Layout) */}
            <section className="py-20 px-6 bg-surface/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={imageVariant}
                        className="relative group cursor-pointer md:order-2"
                    >
                        {/* Nano Banana Pro Style: Emerald HUD Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/20 backdrop-blur-[2px] z-0" />

                        <div className="relative z-10 p-2 bg-background/50 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                            <img
                                src="/assets/feature-execution.png"
                                alt="Trade Execution Log"
                                className="rounded-xl w-full brightness-90 group-hover:brightness-100 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/2 w-full top-0 opacity-0 group-hover:animate-scan pointer-events-none" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="space-y-8 md:order-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                            <Zap className="w-4 h-4" /> Execution
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase">Precision Logging & <br />Risk Calculation</h2>
                        <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                            Stop guessing your position size. Our integrated risk calculator determines the exact lot size based on your account balance and risk tolerance. Log trades instantly with attached screenshots for post-session review.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Automated Position Sizing",
                                "Visual Trade Evidence Upload",
                                "Strategy Tagging & Categorization"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    </div>
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* Feature 3: Analytics */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold uppercase tracking-wider">
                            <Target className="w-4 h-4" /> Analytics
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase">Decode Your <br />Performance Metrics</h2>
                        <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                            Understand the 'Why' behind your results. Our advanced analytics engine breaks down your trading into granular metrics like Expectancy, Profit Factor, and Average R-Multiple.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Win Rate & Expectancy Analysis",
                                "Daily Growth Heatmaps",
                                "Drawdown & Recovery Tracking"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                                    </div>
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={imageVariant}
                        className="relative group cursor-pointer"
                    >
                        {/* Nano Banana Pro Style: Cyberpunk Purple Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/20 backdrop-blur-[2px] z-0" />

                        <div className="relative z-10 p-2 bg-background/50 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                            <img
                                src="/assets/feature-analytics.png"
                                alt="Advanced Analytics"
                                className="rounded-xl w-full brightness-90 group-hover:brightness-100 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent h-1/2 w-full top-0 opacity-0 group-hover:animate-scan pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to see it in action?</h2>
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-4 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold text-lg transition-all hover:scale-105"
                    >
                        Get Started Now
                    </button>
                </div>
            </section>
        </div>
    );
};
