import React from 'react';
import { ShieldCheck, HardDrive, Key, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const SecurityPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    Security Protocol
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Military Grade <span className="text-accent underline decoration-4 underline-offset-8">Protection</span></h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">Your trading edge is your intellectual property. We treat it with institutional-grade security.</p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <HardDrive className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight leading-none">Encrypted Persistence</h2>
                    <p className="text-text-secondary leading-relaxed text-sm">
                        All trade data is stored in our Supabase backend with high-level encryption in transit (TLS) and at rest (AES-256).
                    </p>
                </div>

                <div className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <UserCheck className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight leading-none">Row Level Security</h2>
                    <p className="text-text-secondary leading-relaxed text-sm">
                        We implement strict Row Level Security (RLS) policies. Your data is isolated at the database level; only you can access your records.
                    </p>
                </div>

                <div className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <Key className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight leading-none">Authentication</h2>
                    <p className="text-text-secondary leading-relaxed text-sm">
                        Enterprise-grade session management ensuring your dashboard remains private and secure across all devices.
                    </p>
                </div>

                <div className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight leading-none">Compliance</h2>
                    <p className="text-text-secondary leading-relaxed text-sm">
                        Regular security audits and automated vulnerability scanning via Supabase Advisor protocols.
                    </p>
                </div>
            </div>
        </div>
    );
};
