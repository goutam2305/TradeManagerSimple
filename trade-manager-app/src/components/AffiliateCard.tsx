import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { BROKER_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface AffiliateCardProps {
    userId?: string;
    setView: (view: 'pricing' | 'affiliate_form') => void;
    variants: any;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({ userId, setView, variants }) => {
    return (
        <motion.div
            variants={variants}
            whileHover={{
                y: -5,
                boxShadow: "0 0 30px rgba(34, 211, 238, 0.15)",
                borderColor: "rgba(34, 211, 238, 0.5)"
            }}
            className="premium-glass p-8 rounded-[2.5rem] border border-accent/10 bg-accent/5 flex flex-col space-y-8 relative overflow-hidden group transition-all duration-300"
        >
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-accent" />
                    <h3 className="text-xl font-bold uppercase tracking-widest">Affiliate Path</h3>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black text-accent">FREE</span>
                </div>
                <p className="text-text-secondary text-sm pt-2">Unlock instant access by joining our partner trading network.</p>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/5">1</div>
                            <div className="space-y-1">
                                <p className="text-sm text-text-secondary">Register via our link.</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(BROKER_AFFILIATE_LINKS).map(([name, broker]) => (
                                        <a
                                            key={name}
                                            href={broker.isActive ? broker.link : undefined}
                                            target={broker.isActive ? "_blank" : undefined}
                                            rel={broker.isActive ? "noopener noreferrer" : undefined}
                                            className={`text-[10px] font-bold uppercase tracking-widest ${broker.isActive
                                                ? 'text-accent hover:underline'
                                                : 'text-text-secondary/30 cursor-not-allowed'
                                                }`}
                                        >
                                            {broker.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/5">2</div>
                            <p className="text-sm text-text-secondary">Deposit minimum of 50$.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/5">3</div>
                            <p className="text-sm text-text-secondary">Submit your ID and Screenshot for verification.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 space-y-2">
                            <div className="flex items-center gap-2 text-accent">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Manual Safety Review</span>
                            </div>
                            <p className="text-[10px] text-text-secondary/60 leading-relaxed uppercase tracking-wider font-bold">
                                Approval takes 24-48 hours. 100% Secure.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Crucial Status Warning</span>
                            </div>
                            <p className="text-[10px] text-red-500 leading-relaxed uppercase tracking-wider font-bold opacity-80">
                                Stay active or lose access: Maintain an active partner account with balance to keep privileges. Inactive accounts trigger a 7-day grace period before permanent data purge.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (userId) setView('affiliate_form');
                        else window.dispatchEvent(new CustomEvent('open-auth', {
                            detail: { view: 'signup', type: 'affiliate' }
                        }));
                    }}
                    className="w-full mt-6 py-4 bg-surface text-accent border border-accent/20 rounded-xl text-sm font-black transition-all hover:bg-accent hover:text-background uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    {userId ? 'Claim Access' : 'Sign up to Claim'} <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};
