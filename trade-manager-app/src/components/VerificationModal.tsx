import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getAffiliateLink } from '../config/affiliateLinks';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, userId, onSuccess }) => {
    const [platform, setPlatform] = useState('');
    const [accountId, setAccountId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile || !platform || !accountId) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // 1. Upload Proof
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('verification-proofs')
                .upload(fileName, proofFile);

            if (uploadError) throw uploadError;

            // 2. Create/Update access record
            const { error: dbError } = await supabase
                .from('user_access')
                .upsert({
                    user_id: userId,
                    access_type: 'affiliate',
                    plan_tier: 'affiliate_free',
                    status: 'pending',
                    platform_name: platform,
                    platform_account_id: accountId,
                    proof_url: fileName,
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            setStep('success');
            onSuccess?.();
        } catch (err: any) {
            console.error('Submission error:', err);
            setSubmitError(err.message || 'Failed to submit verification');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg premium-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 pb-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Verification</h3>
                                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Affiliate Path</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                            >
                                <X className="w-5 h-5 text-text-secondary group-hover:text-white" />
                            </button>
                        </div>

                        <div className="p-8">
                            {step === 'form' ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Selected Platform</label>
                                        <select
                                            required
                                            value={platform}
                                            onChange={(e) => setPlatform(e.target.value)}
                                            className="w-full bg-[#0B0E14] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all text-white"
                                        >
                                            <option value="">Select Platform</option>
                                            <option value="pocket-option">Pocket Option</option>
                                            <option value="quotex">Quotex</option>
                                            <option value="iq-option">IQ Option</option>
                                        </select>
                                    </div>

                                    {platform && getAffiliateLink(platform) && (
                                        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Step 1: Registration</p>
                                                <p className="text-xs text-text-secondary leading-tight">Haven't registered yet? Sign up via our link to qualify.</p>
                                            </div>
                                            <a
                                                href={getAffiliateLink(platform) || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-accent transition-all whitespace-nowrap"
                                            >
                                                Register Now
                                            </a>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Trading Account ID</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter your platform account ID"
                                            value={accountId}
                                            onChange={(e) => setAccountId(e.target.value)}
                                            className="w-full bg-[#0B0E14] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all text-white placeholder:text-text-muted"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Proof Screenshot (Balance ≥ $50)</label>
                                        <div className="relative group/upload">
                                            <input
                                                required
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full bg-[#0B0E14] border border-dashed border-white/10 group-hover/upload:border-accent/50 rounded-xl px-4 py-8 text-center transition-all bg-accent/5">
                                                <Upload className="w-8 h-8 text-text-secondary group-hover/upload:text-accent mx-auto mb-2" />
                                                <p className="text-sm text-text-secondary font-medium">
                                                    {proofFile ? proofFile.name : 'Click to upload or drag image'}
                                                </p>
                                                <p className="text-[10px] text-text-secondary/40 uppercase tracking-widest mt-2 font-bold">PNG, JPG or JPEG (Max 5MB)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {submitError && (
                                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {submitError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-accent hover:bg-accent-hover text-background rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Verification'
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center space-y-6 py-8">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={40} className="text-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black uppercase text-white tracking-tight">Proof Submitted!</h4>
                                        <p className="text-text-secondary text-sm">
                                            Our admin team will review your submission within 24-48 hours. You will receive an email once approved.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
