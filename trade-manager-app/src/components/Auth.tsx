
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

export const AuthUI = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
            <div className="w-full max-w-md p-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Trade Master
                </h2>
                <p className="text-slate-400 text-center mb-8">
                    Sign in to track your sessions and analyze your performance.
                </p>
                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        className: {
                            button: 'font-semibold',
                            input: 'font-mono text-sm',
                        }
                    }}
                    providers={[]}
                />
            </div>
        </div>
    );
};
