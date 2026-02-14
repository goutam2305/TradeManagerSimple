import { LayoutDashboard, Minimize2, History as HistoryIcon, Calculator, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';

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
    avatarUrl
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'trademanager', label: 'Trade Manager', icon: Minimize2 },
        { id: 'history', label: 'Session Log', icon: HistoryIcon },
        { id: 'calculator', label: 'Calculator', icon: Calculator },
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
                                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Pro Plan</p>
                            </div>
                        </div>
                    </div>
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
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
