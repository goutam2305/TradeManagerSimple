import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check } from 'lucide-react';

interface Plan {
    name: string;
    description: string;
    features: string[];
}

interface AiEliteCardProps {
    plan: Plan;
}

export const AiEliteCard: React.FC<AiEliteCardProps> = ({ plan }) => {
    // State is now isolated to this component!
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
                y: -5,
                boxShadow: "0 0 50px rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.2)"
            }}
            className="bg-zinc-900/80 backdrop-blur-xl pt-10 px-10 pb-24 rounded-[2.5rem] border border-white/5 relative overflow-hidden transition-all duration-500 group cursor-default isolate"
        >
            {/* Animated Neural Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            {/* Neural Constellation Background Scan */}
            <motion.div
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent z-10 pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />

            {/* Central Neural Constellation HUD */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none z-20 overflow-hidden">
                <div className="relative">
                    {/* Orbital Dots System */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: [0, 360],
                                width: isHovered ? 110 : (140 + i * 15),
                                height: isHovered ? 110 : (140 + i * 15),
                                left: isHovered ? -55 : -(140 + i * 15) / 2,
                                top: isHovered ? -55 : -(140 + i * 15) / 2,
                            }}
                            transition={{
                                rotate: {
                                    duration: isHovered ? (4 + i) : (12 + i * 2),
                                    repeat: Infinity,
                                    ease: "linear",
                                },
                                width: { duration: 0.6, ease: "circOut" },
                                height: { duration: 0.6, ease: "circOut" },
                                left: { duration: 0.6, ease: "circOut" },
                                top: { duration: 0.6, ease: "circOut" },
                            }}
                            className="absolute"
                        >
                            <motion.div
                                animate={{
                                    scale: isHovered ? [1, 1.4, 1] : [1, 1.2, 1],
                                    opacity: isHovered ? [0.6, 1, 0.6] : [0.2, 0.5, 0.2]
                                }}
                                transition={{
                                    duration: 2 + (i % 3),
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.2
                                }}
                                className="w-1 h-1 bg-accent rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                style={{
                                    marginLeft: '100%',
                                    transformOrigin: 'left center'
                                }}
                            />
                        </motion.div>
                    ))}

                    {/* Central Status Text */}
                    <div className="relative z-30 flex flex-col items-center text-center">
                        <div className="text-[0.6rem] font-black tracking-[0.5em] uppercase text-accent mb-2 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                            NEURAL_SYNC_V1.INIT
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="w-1 h-3 bg-accent shadow-[0_0_8px_rgba(34,211,238,1)]"
                            />
                        </div>
                        <h4 className="text-4xl font-black text-accent tracking-[0.2em] uppercase leading-none drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">Coming Soon</h4>
                        <div className="mt-5 flex gap-2 items-center justify-center">
                            {[1, 2, 3, 4, 5, 6].map((idx) => (
                                <motion.div
                                    key={idx}
                                    animate={{
                                        height: [4, 16, 4],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: idx * 0.1
                                    }}
                                    className="w-1 bg-accent rounded-full shadow-[0_0_5px_rgba(34,211,238,1)]"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-center relative z-0 transition-all duration-500 saturate-0 opacity-40 grayscale">
                {/* Plan Details */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-accent animate-pulse" />
                            <h3 className="text-3xl font-black uppercase tracking-tight">{plan.name}</h3>
                        </div>
                        <p className="text-text-secondary text-lg leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white/20">$</span>
                        <span className="text-7xl font-black text-white/10">--</span>
                        <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">/ TBA</span>
                    </div>

                    <button
                        disabled
                        className="w-full lg:w-max px-12 py-5 bg-white/5 text-white/20 border border-white/5 rounded-2xl text-base font-black uppercase tracking-widest cursor-not-allowed"
                    >
                        Waitlist Open
                    </button>
                </div>

                {/* Features Column 1 */}
                <div className="space-y-5 py-4">
                    {plan.features.slice(0, 3).map(feature => (
                        <div key={feature} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center flex-shrink-0 transition-all group-hover:border-accent/30 group-hover:bg-accent/10">
                                <Check className="w-5 h-5 text-accent/40" />
                            </div>
                            <span className="text-lg text-text-secondary/70 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Features Column 2 */}
                <div className="space-y-5 py-4">
                    {plan.features.slice(3).map(feature => (
                        <div key={feature} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center flex-shrink-0 transition-all group-hover:border-accent/30 group-hover:bg-accent/10">
                                <Check className="w-5 h-5 text-accent/40" />
                            </div>
                            <span className="text-lg text-text-secondary/70 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
