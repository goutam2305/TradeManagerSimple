import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { startTrial } from '../lib/trialService';

interface Plan {
    name: string;
    price: string;
    description: string;
    features: string[];
    tier: string;
    popular?: boolean;
    isComingSoon?: boolean;
}

interface PricingCardProps {
    plan: Plan;
    billingCycle: 'monthly' | 'yearly';
    setBillingCycle: React.Dispatch<React.SetStateAction<'monthly' | 'yearly'>>;
    userId?: string;
    onSuccess?: () => void;
    isSubmittingTrial: boolean;
    setIsSubmittingTrial: React.Dispatch<React.SetStateAction<boolean>>;
    variants: any;
}

export const PricingCard: React.FC<PricingCardProps> = ({
    plan,
    billingCycle,
    setBillingCycle,
    userId,
    onSuccess,
    isSubmittingTrial,
    setIsSubmittingTrial,
    variants
}) => {
    return (
        <motion.div
            variants={variants}
            whileHover={{
                y: -8,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(34, 211, 238, 0.1)",
                borderColor: "rgba(34, 211, 238, 0.4)"
            }}
            className={`premium-glass p-8 rounded-[2.5rem] border flex flex-col space-y-8 relative overflow-hidden transition-all duration-500 ${plan.popular ? 'border-accent/50 bg-accent/5 shadow-[0_0_40px_rgba(34,211,238,0.05)]' : 'border-white/5 bg-white/[0.02]'}`}
        >
            {plan.popular && (
                <div className="absolute top-6 right-6 bg-accent text-background text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Best Value
                </div>
            )}

            <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-widest">{plan.name}</h3>

                {plan.tier === 'professional' && (
                    <div className="flex items-center gap-4 py-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-white' : 'text-text-secondary'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-12 h-6 rounded-full bg-surface border border-white/10 p-1 relative transition-colors group"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
                                className="w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-white' : 'text-text-secondary'}`}>Yearly</span>
                            <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">-20%</span>
                        </div>
                    </div>
                )}

                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$</span>
                    <span className="text-6xl font-black">{plan.price}</span>
                    {plan.tier !== 'trial' && (
                        <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">/ {billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                    )}
                    {plan.tier === 'trial' && (
                        <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">/ 7 days</span>
                    )}
                </div>
                <p className="text-text-secondary text-sm pt-2">{plan.description}</p>
            </div>

            <div className="flex-1 space-y-4">
                {plan.features.map(feature => (
                    <div key={feature} className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-sm text-text-secondary leading-tight">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                disabled={isSubmittingTrial}
                className={`w-full py-4 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${plan.popular ? 'bg-accent text-background shadow-xl pulse-glow hover:scale-105' : 'bg-white/5 text-white hover:bg-white/10 hover:scale-105'}`}
                onClick={async () => {
                    if (plan.tier === 'trial') {
                        if (userId) {
                            setIsSubmittingTrial(true);
                            try {
                                await startTrial(userId);
                                onSuccess?.();
                            } catch (err: any) {
                                alert(err.message || 'Failed to start trial');
                            } finally {
                                setIsSubmittingTrial(false);
                            }
                        } else {
                            window.dispatchEvent(new CustomEvent('open-auth', {
                                detail: { view: 'signup', type: 'trial' }
                            }));
                        }
                    } else if (userId) {
                        // Paid user logic placeholders
                    } else {
                        window.dispatchEvent(new CustomEvent('open-auth', {
                            detail: { view: 'signup', type: 'subscription' }
                        }));
                    }
                }}
            >
                {isSubmittingTrial && plan.tier === 'trial' ? 'Initializing...' : 'Select Plan'}
            </button>
        </motion.div>
    );
};
