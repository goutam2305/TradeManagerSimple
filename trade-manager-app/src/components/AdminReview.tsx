
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, XCircle, Clock, ExternalLink, User, Shield, AlertCircle, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingSubmission {
    id: string;
    user_id: string;
    platform_name: string;
    platform_account_id: string;
    proof_url: string;
    status: string;
    created_at: string;
    email?: string;
    full_name?: string;
}

export const AdminReview: React.FC = () => {
    const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            // Fetch pending submissions
            const { data: accessData, error: accessError } = await supabase
                .from('user_access')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (accessError) throw accessError;

            // Fetch profiles for emails and names
            if (accessData && accessData.length > 0) {
                const userIds = accessData.map(s => s.user_id);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .in('id', userIds);

                const { data: userProfileData } = await supabase
                    .from('user_profiles')
                    .select('id, full_name')
                    .in('id', userIds);

                const merged = accessData.map(s => ({
                    ...s,
                    email: profileData?.find(p => p.id === s.user_id)?.email,
                    full_name: userProfileData?.find(p => p.id === s.user_id)?.full_name
                }));

                setSubmissions(merged);
            } else {
                setSubmissions([]);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleApprove = async (submission: PendingSubmission) => {
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('user_access')
                .update({
                    status: 'active',
                    plan_tier: 'affiliate_free',
                    updated_at: new Date().toISOString()
                })
                .eq('id', submission.id);

            if (error) throw error;

            setSubmissions(prev => prev.filter(s => s.id !== submission.id));
            setSelectedSubmission(null);
        } catch (error) {
            console.error('Error approving submission:', error);
            alert('Failed to approve submission');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedSubmission || !rejectionReason) return;

        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('user_access')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedSubmission.id);

            if (error) throw error;

            setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
            setSelectedSubmission(null);
            setIsRejecting(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting submission:', error);
            alert('Failed to reject submission');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredSubmissions = submissions.filter(s =>
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.platform_account_id.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Shield className="text-accent" /> Affiliate Review Queue
                    </h1>
                    <p className="text-text-secondary text-sm">Review and approve user registrations for broker affiliate access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    <p className="text-sm font-medium">Scanning for new submissions...</p>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 bg-surface/30 border border-dashed border-white/10 rounded-3xl text-text-secondary">
                    <CheckCircle className="w-12 h-12 text-emerald-500/20" />
                    <p className="text-sm font-medium">Clear Queue. No pending submissions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* List View */}
                    <div className="xl:col-span-5 space-y-3">
                        {filteredSubmissions.map((submission) => (
                            <motion.button
                                layoutId={submission.id}
                                key={submission.id}
                                onClick={() => {
                                    setSelectedSubmission(submission);
                                    setIsRejecting(false);
                                }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedSubmission?.id === submission.id
                                    ? 'bg-accent/10 border-accent/30 ring-1 ring-accent/30'
                                    : 'bg-surface hover:bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                            <User size={14} className="text-text-secondary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white leading-none mb-1">
                                                {submission.full_name || 'Incognito User'}
                                            </span>
                                            <span className="text-[10px] text-text-secondary lowercase">
                                                {submission.email}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                        <Clock size={10} className="text-amber-500" />
                                        <span className="text-[9px] font-black uppercase text-amber-500">Pending</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-medium text-text-secondary">
                                    <span className="uppercase tracking-widest">{submission.platform_name}</span>
                                    <span className="opacity-50">•</span>
                                    <span>ID: {submission.platform_account_id}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Detail View */}
                    <div className="xl:col-span-7">
                        <AnimatePresence mode="wait">
                            {selectedSubmission ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-surface border border-white/5 rounded-3xl overflow-hidden sticky top-8"
                                >
                                    {/* Proof Preview */}
                                    <div className="aspect-video bg-black/40 relative group">
                                        <img
                                            src={selectedSubmission.proof_url}
                                            alt="Verification Proof"
                                            className="w-full h-full object-contain p-4"
                                        />
                                        <a
                                            href={selectedSubmission.proof_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>

                                    {/* Info & Actions */}
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Trading Platform</p>
                                                <p className="text-lg font-bold text-white">{selectedSubmission.platform_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Account ID</p>
                                                <p className="text-lg font-mono font-bold text-accent">{selectedSubmission.platform_account_id}</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            {isRejecting ? (
                                                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-white">Reason for Rejection</label>
                                                        <textarea
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            placeholder="e.g. Account ID mismatch, Missing deposit proof..."
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-red-500/50"
                                                        />
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            disabled={isProcessing || !rejectionReason}
                                                            onClick={handleReject}
                                                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle size={18} />}
                                                            Confirm Rejection
                                                        </button>
                                                        <button
                                                            onClick={() => setIsRejecting(false)}
                                                            className="px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-4">
                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={() => handleApprove(selectedSubmission)}
                                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                                                    >
                                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={18} />}
                                                        Approve Access
                                                    </button>
                                                    <button
                                                        onClick={() => setIsRejecting(true)}
                                                        className="px-6 bg-white/5 hover:bg-red-500/20 hover:text-red-500 border border-white/5 hover:border-red-500/30 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 bg-surface/30 border border-dashed border-white/10 rounded-3xl text-text-secondary text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <AlertCircle className="w-8 h-8 opacity-20" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">No Selection</h3>
                                    <p className="text-sm max-w-xs">Select a submission from the list to review the details and proof.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};
