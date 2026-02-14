import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const PrivacyPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                    <Eye className="w-3 h-3" />
                    Privacy Policy
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Your Data, <span className="text-accent underline decoration-4 underline-offset-8">Your Control</span></h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">Last updated: February 2024. Clear, transparent, and focused on your security.</p>
            </motion.div>

            <div className="grid gap-8">
                <section className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">1. Data Collection</h2>
                    <p className="text-text-secondary leading-relaxed">
                        We collect information necessary to provide our trading analytics services:
                    </p>
                    <ul className="list-disc list-inside text-text-secondary spacing-y-2 ml-4">
                        <li>Account information (Email, user identifier).</li>
                        <li>Trading data (Trade logs, entry/exit prices, symbols).</li>
                        <li>Session statistics and metrics generated from your trades.</li>
                        <li>Technical information (IP address, browser type for security monitoring).</li>
                    </ul>
                </section>

                <section className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">2. Use of Information</h2>
                    <p className="text-text-secondary leading-relaxed">
                        Your data is used solely to:
                    </p>
                    <ul className="list-disc list-inside text-text-secondary spacing-y-2 ml-4">
                        <li>Calculate and display your trading performance metrics.</li>
                        <li>Provide personalized insights into your trading behavior.</li>
                        <li>Maintain the security and integrity of our platform.</li>
                        <li>Communicate important service updates or security alerts.</li>
                    </ul>
                </section>

                <section className="premium-glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">3. Your Rights</h2>
                    <p className="text-text-secondary leading-relaxed">
                        We believe you should always have full ownership of your data:
                    </p>
                    <ul className="list-disc list-inside text-text-secondary spacing-y-2 ml-4">
                        <li><strong>Access:</strong> You can view all your stored trade data at any time.</li>
                        <li><strong>Export:</strong> Download your entire trade history and analytics in CSV/Excel format.</li>
                        <li><strong>Deletion:</strong> Permanent account deletion follows a "data-purge" protocol, removing all trade records from our servers.</li>
                    </ul>
                </section>
            </div>

            <div className="text-center p-8 border-t border-white/5 opacity-50 text-sm">
                If you have any questions regarding your privacy, please contact our security team.
            </div>
        </div>
    );
};
