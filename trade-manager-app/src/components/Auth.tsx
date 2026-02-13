import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart2, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const AuthUI = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg shadow-accent/20">
                        <BarChart2 className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Create your account'}
                </h2>
                <p className="text-text-secondary">
                    {isLogin
                        ? 'Enter your credentials to access your dashboard'
                        : 'Join 10,000+ traders optimizing their flow'}
                </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative background glow inside card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                <form onSubmit={handleAuth} className="space-y-5 relative z-10">
                    {error && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                    className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Password</label>
                            {isLogin && (
                                <button type="button" className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={!isLogin}
                                    className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent-hover text-background font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 group mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <p className="text-text-secondary text-sm">
                        {isLogin ? "New to the platform?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-accent hover:text-accent-hover font-bold hover:underline transition-all"
                        >
                            {isLogin ? "Create an account" : "Log in"}
                        </button>
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-text-secondary/60">
                    <span className="w-2 h-2 rounded-full bg-success/80 animate-pulse" />
                    All Systems Operational
                </div>
                <div className="text-[10px] text-text-secondary/40 flex justify-center gap-4">
                    <a href="#" className="hover:text-text-primary transition-colors">Security</a>
                    <span>•</span>
                    <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
                </div>
            </div>
        </div>
    );
};
