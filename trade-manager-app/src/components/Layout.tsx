import { LayoutDashboard, Minimize2, History as HistoryIcon, Calculator, User, LogOut, Menu, X, Settings, Shield, Clock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { AccessStatus, AccessType } from '../lib/useAccess';
import { isAdmin as checkIsAdmin } from '../config/adminConfig';

interface LayoutProps {
    children: React.ReactNode;
    userName?: string;
    userEmail?: string;
    onSignOut: () => void;
    onToggleSettings: () => void;
    activeView: string;
    onNavigate: (view: string) => void;
    pageTitle?: string;
    avatarUrl?: string;
    accessStatus: AccessStatus;
    accessType: AccessType;
    planTier?: string | null;
    validUntil?: string | null;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    userName,
    userEmail,
    onSignOut,
    onToggleSettings,
    activeView,
    onNavigate,
    pageTitle = 'Analytics Dashboard',
    avatarUrl,
    accessStatus,
    accessType,
    planTier,
    validUntil
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = checkIsAdmin(userEmail);
    const isTrial = planTier === 'trial';

    const getDaysLeft = () => {
        if (!validUntil) return null;
        const diff = new Date(validUntil).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysLeft = getDaysLeft();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'trademanager', label: 'Trade Manager', icon: Minimize2 },
        { id: 'history', label: 'Session Log', icon: HistoryIcon },
        { id: 'calculator', label: 'Calculator', icon: Calculator },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Review', icon: ShieldCheck }] : []),
        { id: 'settings', label: 'Settings', icon: Settings, action: onToggleSettings },
    ];

    return (
        <div className="min-h-screen bg-background text-text-primary flex font-sans selection:bg-accent selection:text-white overflow-hidden grid-background">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-panel border-b border-border z-30 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">TRADE<span className="text-accent">FLOW</span></span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-surface border border-white/5 text-text-secondary hover:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-panel border-r border-border z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center gap-2 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">TRADE<span className="text-accent">FLOW</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (item.action) {
                                    item.action();
                                } else {
                                    onNavigate(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg ${activeView === item.id
                                ? 'bg-accent/10 text-white'
                                : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={onSignOut}
                        className="w-full py-3 flex items-center justify-center gap-2 text-sm font-black text-red-500 bg-red-500/10 border border-red-500/50 rounded-xl hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] uppercase tracking-widest relative overflow-hidden group/btn"
                    >
                        <LogOut className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Sidebar (Desktop) */}
            <aside className="w-64 glass-panel border-r border-border flex flex-col fixed h-full z-20 hidden lg:flex">
                <div className="p-8 flex items-center gap-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">TRADE<span className="text-accent">FLOW</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else {
                                    onNavigate(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg group ${activeView === item.id
                                ? 'bg-accent/10 text-white'
                                : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-accent' : 'text-text-secondary group-hover:text-white'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div
                        onClick={() => onNavigate('profile')}
                        className="p-4 rounded-xl bg-surface/50 border border-white/5 hover:border-white/10 transition-colors group cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 overflow-hidden ${activeView === 'profile' ? 'bg-accent border-accent shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#0E1338] border-white/10'}`}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-blue-600/10">
                                        <User className={`w-5 h-5 transition-colors ${activeView === 'profile' ? 'text-background' : 'text-accent/70 group-hover:text-accent'}`} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-bold text-white truncate">{userName || userEmail?.split('@')[0] || 'Trader'}</p>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    {accessStatus === 'active' ? (
                                        <>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                                {accessType === 'subscription' ? 'Pro Plan' : 'Affiliate Access'}
                                            </p>
                                        </>
                                    ) : accessStatus === 'pending' ? (
                                        <>
                                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                                            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Pending</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`w-1.5 h-1.5 rounded-full ${accessType === 'affiliate' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-red-500/50'}`} />
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${accessType === 'affiliate' ? 'text-amber-400' : 'text-text-secondary'}`}>
                                                {accessType === 'affiliate' ? 'Pending Proof' : 'Restricted'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {isTrial && daysLeft !== null && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-accent/20 to-blue-600/10 border border-accent/20 relative overflow-hidden group/trial">
                            <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">Trial Period</span>
                                    <span className="text-[10px] font-black text-white bg-accent px-2 py-0.5 rounded-full">{daysLeft} days left</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all duration-1000"
                                        style={{ width: `${(daysLeft / 7) * 100}%` }}
                                    />
                                </div>
                                <button
                                    onClick={() => onNavigate('pricing')}
                                    className="w-full mt-3 py-2 bg-accent/10 hover:bg-accent text-accent hover:text-background border border-accent/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSignOut();
                        }}
                        className="mt-3 w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/50 uppercase tracking-widest rounded-lg hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all relative z-10"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen flex flex-col pt-16 lg:pt-0">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 bg-panel/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                            {pageTitle}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Removed redundant header upgrade button to declutter */}
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    {accessStatus === 'pending' && (
                        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-400 uppercase tracking-wide">Verification Pending</p>
                                    <p className="text-[10px] text-amber-400/60 font-bold uppercase tracking-wider">We're reviewing your affiliate details. Full access will be granted soon.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(accessStatus === 'inactive' || accessStatus === 'expired') && activeView !== 'profile' && activeView !== 'pricing' && (
                        <div className="mb-8 p-4 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-accent uppercase tracking-wide">
                                        {accessStatus === 'expired' ? 'Subscription Expired' : 'Read-Only Mode Active'}
                                    </p>
                                    <p className="text-[10px] text-accent/60 font-bold uppercase tracking-wider">
                                        {accessType === 'affiliate'
                                            ? 'Your account is pending verification. Submit your Telegram proof to unlock full access.'
                                            : 'Full access is restricted. Unlock institutional tools with a plan or affiliate link.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (accessType === 'affiliate') {
                                        onNavigate('dashboard');
                                        setTimeout(() => {
                                            document.getElementById('affiliate-verification-banner')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    } else {
                                        onNavigate('pricing');
                                    }
                                }}
                                className="px-6 py-2 bg-accent text-background rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg pulse-glow"
                            >
                                {accessType === 'affiliate' ? 'Submit Proof to Get Access' : 'Upgrade Now'}
                            </button>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};
