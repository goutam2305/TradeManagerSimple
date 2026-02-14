import React from 'react';
import { Scale, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const TermsPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                    <Scale className="w-3 h-3" />
                    Terms of Service
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Usage <span className="text-accent underline decoration-4 underline-offset-8">Agreement</span></h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">Please read these terms carefully before using TradeFlow Analytics.</p>
            </motion.div>

            <div className="grid gap-8">
                <section className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4 bg-red-500/5">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-red-500">Financial Risk Warning</h2>
                    <p className="text-text-secondary leading-relaxed font-bold">
                        Trading financial instruments involves significant risk and can lead to the loss of all invested capital.
                    </p>
                    <p className="text-text-secondary leading-relaxed text-sm">
                        TradeFlow is a data analysis tool only. We do not provide financial advice, trading signals, or execution services. Past performance is not indicative of future results.
                    </p>
                </section>

                <section className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">1. License & Use</h2>
                    <p className="text-text-secondary leading-relaxed">
                        We grant you a personal, non-exclusive license to use the platform for analyzing your own trading activities. Commercial redistribution of data or reverse engineering of our calculation engine is strictly prohibited.
                    </p>
                </section>

                <section className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <ShieldAlert className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">2. Limitation of Liability</h2>
                    <p className="text-text-secondary leading-relaxed">
                        TradeFlow is provided "as is". We are not liable for any losses incurred resulting from the use of our software, including but not limited to tool errors, data inaccuracies, or connectivity issues during trade logging.
                    </p>
                </section>
            </div>
        </div>
    );
};
