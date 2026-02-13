import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Briefcase, TrendingUp, Save, Loader2, CheckCircle, PenSquare } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface UserProfileProps {
    session: Session;
}

interface ProfileData {
    full_name: string;
    country: string;
    experience_level: string;
    trading_style: string;
    bio: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ session }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        full_name: '',
        country: '',
        experience_level: 'Beginner',
        trading_style: 'Day Trader',
        bio: ''
    });

    useEffect(() => {
        loadProfile();
    }, [session]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    country: data.country || '',
                    experience_level: data.experience_level || 'Beginner',
                    trading_style: data.trading_style || 'Day Trader',
                    bio: data.bio || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaved(false);

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: session.user.id,
                    ...profile,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please make sure you have created the user_profiles table in your Supabase dashboard.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-text-secondary animate-pulse">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="relative group p-1 rounded-3xl bg-gradient-to-r from-accent/20 via-blue-500/10 to-transparent">
                <div className="glass-panel p-8 rounded-[22px] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-accent/30 flex items-center justify-center shadow-2xl relative group-hover:border-accent transition-all duration-500">
                            <User className="w-16 h-16 text-accent/50 group-hover:text-accent transition-all duration-500" />
                            <div className="absolute -bottom-2 -right-2 bg-accent text-background p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                <PenSquare className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {profile.full_name || 'Anonymous Trader'}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-text-secondary text-sm">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                <Mail className="w-3.5 h-3.5" />
                                {session.user.email}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold">
                                PRO ACCOUNT
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-accent" />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight">Personal Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors">
                                        <User className="w-full h-full" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Country</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors">
                                        <Globe className="w-full h-full" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. United Kingdom"
                                        value={profile.country}
                                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                        className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">About Me</label>
                            <textarea
                                placeholder="Tell us about your trading journey..."
                                rows={4}
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight">Trading Persona</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Experience Level</label>
                                <select
                                    value={profile.experience_level}
                                    onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #475569 50%), linear-gradient(135deg, #475569 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
                                >
                                    <option value="Beginner">Beginner (&lt; 1 Year)</option>
                                    <option value="Intermediate">Intermediate (1-3 Years)</option>
                                    <option value="Pro">Professional (3+ Years)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Trading Style</label>
                                <select
                                    value={profile.trading_style}
                                    onChange={(e) => setProfile({ ...profile, trading_style: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #475569 50%), linear-gradient(135deg, #475569 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
                                >
                                    <option value="Scalper">Scalper</option>
                                    <option value="Day Trader">Day Trader</option>
                                    <option value="Swing Trader">Swing Trader</option>
                                    <option value="Position Trader">Position Trader</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${saved
                                ? 'bg-success text-background'
                                : 'bg-accent text-background hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                                }`}
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : saved ? (
                                <>
                                    <CheckCircle className="w-5 h-5" /> Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Account Stats / Badges */}
                <div className="space-y-8">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Your Statistics</h3>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-white/5">
                                    <TrendingUp className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary font-medium">Trader Level</p>
                                    <p className="text-white font-bold">{profile.experience_level}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-white/5">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary font-medium">Main Strategy</p>
                                    <p className="text-white font-bold">{profile.trading_style}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Status</p>
                                <p className="text-white text-sm">Account Verified and optimized for high performance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
