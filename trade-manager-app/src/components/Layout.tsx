import { LayoutDashboard, Minimize2, History as HistoryIcon, Settings, LogOut, User } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    userEmail?: string;
    onSignOut: () => void;
    onToggleSettings: () => void;
    activeView: string;
    onNavigate: (view: string) => void;
    pageTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    userEmail,
    onSignOut,
    onToggleSettings,
    activeView,
    onNavigate,
    pageTitle = 'Analytics Dashboard'
}) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'trademanager', label: 'Trade Manager', icon: Minimize2 },
        { id: 'history', label: 'Session Log', icon: HistoryIcon },
        { id: 'settings', label: 'Settings', icon: Settings, action: onToggleSettings },
    ];

    return (
        <div className="min-h-screen bg-background text-text-primary flex font-sans selection:bg-accent selection:text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-panel border-r border-border flex flex-col fixed h-full z-20 hidden lg:flex">
                <div className="p-6 flex items-center gap-2 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">TRADE<span className="text-accent">FLOW</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
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
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 group relative overflow-hidden ${activeView === item.id
                                ? 'bg-gradient-to-r from-accent/10 to-transparent border-l-2 border-accent text-white'
                                : 'text-text-secondary hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-accent' : 'text-text-secondary group-hover:text-white'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="p-4 rounded-xl bg-surface/50 border border-white/5 hover:border-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-white/10">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{userEmail?.split('@')[0] || 'Trader'}</p>
                                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Pro Plan</p>
                            </div>
                        </div>
                        <button
                            onClick={onSignOut}
                            className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider bg-red-500/10 rounded-lg hover:bg-red-500/20"
                        >
                            <LogOut className="w-3 h-3" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                {/* Top Header */}
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">{pageTitle}</h2>
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
