import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart2, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot_password';

interface AuthUIProps {
    initialView?: AuthView;
    signupType?: 'subscription' | 'trial' | 'affiliate';
}

export const AuthUI = ({ initialView = 'login', signupType }: AuthUIProps) => {
    const [view, setView] = useState<AuthView>(initialView);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const derivedSignupType = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        const flow = params.get('flow');

        if (ref === 'affiliate') {
            return 'affiliate';
        } else if (flow === 'paid') {
            return 'subscription';
        }
        return signupType || 'subscription';
    }, [signupType]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [cooldown]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else if (view === 'signup') {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            signup_type: derivedSignupType
                        },
                    },
                });
                if (error) throw error;
            } else if (view === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setResetSent(true);
                setCooldown(60);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 grid-background relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-md relative z-10">
                {view === 'forgot_password' && resetSent ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 glow-box">
                                <CheckCircle2 className="w-8 h-8 text-success" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase text-glow">Verification Sent</h2>
                            <p className="text-text-secondary font-medium">
                                Check <span className="text-white">{email}</span> for instructions.
                            </p>
                        </div>
                        <div className="premium-glass p-8 rounded-[2rem] text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <p className="text-sm text-text-secondary mb-4 relative z-10">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => setResetSent(false)}
                                disabled={cooldown > 0}
                                className={`font-bold text-sm transition-all relative z-10 ${cooldown > 0
                                    ? 'text-text-secondary cursor-not-allowed'
                                    : 'text-accent hover:text-accent-hover hover:scale-105'
                                    }`}
                            >
                                {cooldown > 0 ? `Try again in ${cooldown}s` : 'Try again'}
                            </button>
                            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                                <button
                                    onClick={() => setView('login')}
                                    className="flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors text-sm w-full"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg shadow-accent/20 relative group overflow-hidden">
                                    <BarChart2 className="w-7 h-7 text-white relative z-10" />
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase text-glow">
                                {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Access'}
                            </h2>
                            <p className="text-text-secondary font-medium">
                                {view === 'login'
                                    ? 'Enter your credentials to access the terminal'
                                    : view === 'signup'
                                        ? 'Join institutional-grade traders'
                                        : 'Enter your email to receive a reset link'}
                            </p>
                        </div>

                        <div className="premium-glass p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/20 transition-all duration-1000" />

                            <form onSubmit={handleAuth} className="space-y-5 relative z-10">
                                {error && (
                                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                {view === 'signup' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="input-field w-full py-4 pl-11 pr-4 text-white font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="input-field w-full py-4 pl-11 pr-4 text-white font-medium"
                                        />
                                    </div>
                                </div>

                                {view !== 'forgot_password' && (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Password</label>
                                            {view === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setView('forgot_password')}
                                                    className="text-xs text-accent hover:text-accent-hover font-bold transition-colors"
                                                >
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="input-field w-full py-4 pl-11 pr-4 text-white font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                {view === 'signup' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="input-field w-full py-4 pl-11 pr-4 text-white font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-4 flex items-center justify-center gap-3 font-black text-xs transition-all mt-4 relative overflow-hidden shadow-xl shadow-accent/20"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-white">
                                                {view === 'login' ? 'Sign In to terminal' : view === 'signup' ? 'Access System' : 'Reset Access'}
                                            </span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                {view === 'forgot_password' ? (
                                    <button
                                        onClick={() => setView('login')}
                                        className="text-text-secondary hover:text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </button>
                                ) : (
                                    <p className="text-text-secondary text-sm font-medium">
                                        {view === 'login' ? "New to the platform?" : "Already have an account?"}{" "}
                                        <button
                                            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                            className="text-accent hover:text-accent-hover font-black uppercase tracking-tighter hover:underline transition-all"
                                        >
                                            {view === 'login' ? "Create account" : "Sign In"}
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                Terminal Encrypted & Secure
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/30 flex justify-center gap-6">
                                <a href="#" className="hover:text-accent transition-colors cursor-pointer">Security</a>
                                <a href="#" className="hover:text-accent transition-colors cursor-pointer">Privacy</a>
                                <a href="#" className="hover:text-accent transition-colors cursor-pointer">Terms</a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
