import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Gift, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { PricingCard } from './PricingCard';
import { AffiliateCard } from './AffiliateCard';
import { AiEliteCard } from './AiEliteCard';

interface PricingPageProps {
    userId?: string;
    onBack?: () => void;
    onSuccess?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ userId, onSuccess }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [view, setView] = useState<'pricing' | 'affiliate_form'>('pricing');
    const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);

    // Standardized entrance animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15, // Smooth stagger
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5, // Standardized duration
                ease: "circOut" // Standardized easing
            }
        }
    };

    // Affiliate Form State
    const [platform, setPlatform] = useState('');
    const [accountId, setAccountId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const plans = [
        {
            name: '7-Day Trial',
            price: '0',
            description: 'Full institutional suite. Experience the power risk-free.',
            features: [
                'Unlimited Trade Logs',
                'Advanced Data Analytics',
                'Session Performance tracking',
                'Recursive Money Management',
                'Evidence Uploading (PNG/JPG)',
                '24/7 Support'
            ],
            tier: 'trial'
        },
        {
            name: 'Professional',
            price: billingCycle === 'monthly' ? '4.99' : '49.99',
            description: billingCycle === 'monthly' ? 'The ultimate professional setup.' : 'The ultimate professional setup at 20% off.',
            features: [
                'Everything in Trial',
                'Lifetime Data Retention',
                'Early access to new tools',
                'Personalized Trading Review',
                'Premium AI Insights (Coming Soon)'
            ],
            tier: 'professional',
            popular: true
        },
        {
            name: 'AI Elite',
            price: '--',
            description: 'Autonomous trading & neural market analysis.',
            features: [
                'Autonomous Trading Bot',
                'Advanced Market Pulse',
                'Neural Risk Guard',
                'Strategy Optimizer',
                'Deep Learning Insights',
                'Custom API Integrations'
            ],
            tier: 'ai_elite',
            isComingSoon: true
        }
    ];

    const handleAffiliateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile || !platform || !accountId) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // 1. Upload Proof
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('affiliate-proofs')
                .upload(fileName, proofFile);

            if (uploadError) throw uploadError;

            // 2. Create Profile / Update Status
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    affiliate_status: 'pending',
                    affiliate_platform: platform,
                    affiliate_account_id: accountId,
                    affiliate_proof_url: fileName
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            if (onSuccess) onSuccess();
            setView('pricing');
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'affiliate_form') {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="max-w-md mx-auto premium-glass p-8 rounded-[2.5rem] border border-white/5"
                >
                    <div className="text-center mb-8">
                        <Gift className="w-12 h-12 text-accent mx-auto mb-4" />
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Affiliate Verification</h2>
                        <p className="text-text-secondary text-sm mt-2">Submit your details for instant access.</p>
                    </div>

                    <form onSubmit={handleAffiliateSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Broker Platform</label>
                            <select
                                required
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full bg-surface-dark border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all"
                            >
                                <option value="">Select Platform</option>
                                <option value="pocket_option">Pocket Option</option>
                                <option value="quotex">Quotex</option>
                                <option value="iq_option">IQ Option</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Account ID</label>
                            <input
                                required
                                type="text"
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                placeholder="Enter your Broker ID"
                                className="w-full bg-surface-dark border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Proof Screenshot (Balance ≥ $50)</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full bg-surface-dark border border-dashed border-white/10 group-hover:border-accent/50 rounded-xl px-4 py-8 text-center transition-all">
                                    <Upload className="w-8 h-8 text-text-secondary group-hover:text-accent mx-auto mb-2" />
                                    <p className="text-sm text-text-secondary">
                                        {proofFile ? proofFile.name : 'Click to upload or drag image'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {submitError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {submitError}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setView('pricing')}
                                className="flex-1 py-4 border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-all uppercase tracking-widest"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] py-4 bg-accent hover:bg-accent-hover text-background rounded-xl text-sm font-black transition-all hover:scale-105 uppercase tracking-widest disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    const topPlans = plans.filter(p => !p.isComingSoon);
    const aiElitePlan = plans.find(p => p.isComingSoon);

    return (
        <div className="relative min-h-screen pt-24 pb-20 px-6 overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[10%] left-[20%] w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative max-w-7xl mx-auto space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black uppercase font-heading tracking-tight leading-none">
                        Unlock Your Full <span className="text-accent underline underline-offset-8 decoration-accent/30">Edge</span>
                    </h1>
                    <p className="text-text-secondary text-lg font-medium leading-relaxed">
                        Choose the path that fits your trading journey. Institutional tools for professional analysis.
                    </p>
                </motion.div>

                <div className="space-y-20">
                    {/* Top Row: 3 Columns Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-2">
                        {/* Subscription Plans (Trial & Professional) */}
                        {topPlans.map((plan) => (
                            <PricingCard
                                key={plan.name}
                                plan={plan}
                                billingCycle={billingCycle}
                                setBillingCycle={setBillingCycle}
                                userId={userId}
                                onSuccess={onSuccess}
                                isSubmittingTrial={isSubmittingTrial}
                                setIsSubmittingTrial={setIsSubmittingTrial}
                                variants={itemVariants}
                            />
                        ))}

                        {/* Affiliate Path Card */}
                        <AffiliateCard
                            userId={userId}
                            setView={setView}
                            variants={itemVariants}
                        />
                    </div>

                    {/* Bottom Row: AI Elite Plan */}
                    {aiElitePlan && (
                        <motion.div variants={itemVariants}>
                            <AiEliteCard plan={aiElitePlan} />
                        </motion.div>
                    )}
                </div>

                {/* Security Footer */}
                <motion.div variants={itemVariants} className="text-center pt-8">
                    <div className="inline-flex items-center gap-8 py-6 px-12 rounded-full border border-white/5 bg-surface/30 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">SSL ENCRYPTED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">INSTANT ACTIVATION</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary/40">
                            <span className="text-[10px] font-black uppercase tracking-widest">TRUSTED BY 15K+ TRADERS</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
