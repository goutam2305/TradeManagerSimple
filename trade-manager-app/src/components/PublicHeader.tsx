import React from 'react';
import { BarChart2 } from 'lucide-react';

interface PublicHeaderProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onFeatures: () => void;
    onPricing: () => void;
    onHome: () => void;
    onBlog?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
    onGetStarted,
    onLogin,
    onFeatures,
    onPricing,
    onHome,
    onBlog
}) => {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight uppercase font-heading">TRADE<span className="text-accent">FLOW</span></span>
                </button>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                    <button onClick={onFeatures} className="hover:text-white transition-colors uppercase tracking-widest text-[10px]">Features</button>
                    <button onClick={onPricing} className="hover:text-white transition-colors uppercase tracking-widest text-[10px]">Pricing</button>
                    {onBlog && (
                        <button onClick={onBlog} className="hover:text-white transition-colors uppercase tracking-widest text-[10px]">Blog</button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onLogin}
                        className="text-[10px] font-bold text-text-secondary hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Log In
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="bg-accent hover:bg-accent-hover text-background px-4 py-2 rounded-lg text-[10px] font-black transition-all hover:scale-105 uppercase tracking-widest animate-pulse-glow"
                    >
                        Start Free Trial
                    </button>
                </div>
            </div>
        </nav>
    );
};
