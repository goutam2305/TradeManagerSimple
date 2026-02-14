import React from 'react';
import { BarChart2 } from 'lucide-react';

interface PublicFooterProps {
    onPrivacy: () => void;
    onTerms: () => void;
    onSecurity: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onPrivacy, onTerms, onSecurity }) => {
    return (
        <footer className="border-t border-white/5 py-16 px-6 relative z-10 bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <BarChart2 className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase font-heading">TRADE<span className="text-accent">FLOW</span></span>
                </div>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                    <button onClick={onPrivacy} className="hover:text-accent transition-colors">Privacy</button>
                    <button onClick={onTerms} className="hover:text-accent transition-colors">Terms</button>
                    <button onClick={onSecurity} className="hover:text-accent transition-colors">Security</button>
                </div>
                <div className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    © 2024 TradeFlow Analytics <span className="w-1 h-1 rounded-full bg-text-secondary/30" /> ALL SYSTEMS OPERATIONAL <span className="text-success animate-pulse">●</span>
                </div>
            </div>
        </footer>
    );
};
