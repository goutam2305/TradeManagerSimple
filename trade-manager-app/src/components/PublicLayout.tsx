import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

interface PublicLayoutProps {
    children: React.ReactNode;
    onGetStarted: () => void;
    onLogin: () => void;
    onFeatures: () => void;
    onHome: () => void;
    onPrivacy: () => void;
    onTerms: () => void;
    onSecurity: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
    children,
    onGetStarted,
    onLogin,
    onFeatures,
    onHome,
    onPrivacy,
    onTerms,
    onSecurity
}) => {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [children]);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-accent selection:text-white overflow-x-hidden grid-background flex flex-col">
            <PublicHeader
                onGetStarted={onGetStarted}
                onLogin={onLogin}
                onFeatures={onFeatures}
                onHome={onHome}
            />
            <main className="flex-1">
                {children}
            </main>
            <PublicFooter
                onPrivacy={onPrivacy}
                onTerms={onTerms}
                onSecurity={onSecurity}
            />
        </div>
    );
};
