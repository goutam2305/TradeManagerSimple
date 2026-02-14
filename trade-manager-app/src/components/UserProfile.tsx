
import React, { useState, useEffect } from 'react'; // Force Update
import { User, Mail, Lock, Key, FileDown, Loader2, AlertTriangle, AlertOctagon, Camera } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { exportTradeData } from '../utils/exportUtils';
import { DeleteAccountModal } from './DeleteAccountModal';

interface UserProfileProps {
    session: Session;
    onProfileUpdate?: (data: any) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ session, onProfileUpdate }) => {
    const user = session.user;
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [exporting, setExporting] = useState(false);

    // Form State
    const [email] = useState(user.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Profile Data
    const [profileData, setProfileData] = useState({
        full_name: '',
        bio: '',
        avatar_url: ''
    });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user.id]);

    // Auto-dismiss toast
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setProfileData({
                    full_name: data.full_name || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const updates = {
                id: user.id,
                ...profileData,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('user_profiles')
                .upsert(updates);

            if (error) throw error;

            if (onProfileUpdate) {
                onProfileUpdate(updates);
            }

            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            setLoading(true);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const updates = {
                id: user.id,
                avatar_url: publicUrl,
                updated_at: new Date().toISOString()
            };

            const { error: updateError } = await supabase
                .from('user_profiles')
                .upsert(updates);

            if (updateError) throw updateError;

            setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));

            if (onProfileUpdate) {
                onProfileUpdate(updates);
            }

            setMessage({ type: 'success', text: 'Avatar uploaded successfully' });

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) return;

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        setExporting(true);
        try {
            await exportTradeData({ userId: user.id, userEmail: user.email, includeUserSummary: true });
        } catch (error) {
            alert('Failed to export data. Please try again.');
        } finally {
            setExporting(false);
        }
    };



    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

                {/* Left Column: Personal Info */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 space-y-6">

                        <div className="flex items-center gap-3 text-accent-primary mb-2">
                            <User size={20} />
                            <h3 className="font-bold text-lg text-white">Personal Information</h3>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex justify-center mb-6">
                            <div className="relative group/avatar cursor-pointer">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-primary/50 group-hover/avatar:border-accent-primary transition-all">
                                    {profileData.avatar_url ? (
                                        <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#0B0E14] flex items-center justify-center text-text-secondary">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-full cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full bg-[#0B0E14] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-text-muted cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-colors hover:border-white/20"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Me Section */}
                    <div className="glass-panel p-6 space-y-6 flex flex-col">

                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <User size={20} />
                            <h3 className="font-bold text-lg text-white">About Me</h3>
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">
                                Bio / Notes
                            </label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                className="w-full h-32 bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-colors hover:border-white/20 resize-none"
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-auto shadow-lg shadow-accent/20 hover:shadow-accent/40 contrast-125"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                            Save Profile
                        </button>
                    </div>
                </div>

                {/* Right Column: Security */}
                <div className="glass-panel p-6 h-full flex flex-col">

                    <div className="flex items-center gap-3 text-orange-500 mb-8">
                        <Lock size={20} />
                        <h3 className="font-bold text-lg text-white">Security Settings</h3>
                    </div>

                    <div className="space-y-8 flex-1">
                        {/* Password Update */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                                Update Password
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password"
                                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-text-muted hover:border-white/20"
                                    />
                                </div>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm Password"
                                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-text-muted hover:border-white/20"
                                    />
                                </div>



                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={loading || !newPassword}
                                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? 'Updating...' : 'Reset Password'}
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-white/5 my-6"></div>

                        {/* Account Actions */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                                Account Actions
                            </label>
                            <div className="space-y-3">
                                <button
                                    onClick={handleExportData}
                                    disabled={exporting}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                        Export Data
                                    </div>
                                </button>

                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 border-none animate-pulse-slow"
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertOctagon className="w-4 h-4" />
                                        Delete Account
                                    </div>
                                </button>
                                <p className="text-[10px] text-red-400/60 text-center font-bold uppercase tracking-widest mt-2">
                                    Caution: Deleting your account will erase all data permanently
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                }}
            />

            {/* Toast Message */}
            {message && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`px-6 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? (
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ) : (
                            <AlertTriangle size={16} />
                        )}
                        <span className="font-bold text-sm tracking-wide">{message.text}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
