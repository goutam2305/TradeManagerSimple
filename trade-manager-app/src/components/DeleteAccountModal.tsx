
import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [status, setStatus] = useState<'idle' | 'deleting' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (confirmationText !== 'DELETE') return;

        setStatus('deleting');
        setErrorMessage('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            // Call Supabase Edge Function
            const { error: invokeError, data } = await supabase.functions.invoke('delete-user', {
                method: 'POST',
            });

            if (invokeError) {
                // Try to parse the error body if available
                let errorMessage = invokeError.message;
                try {
                    if (invokeError instanceof Error && 'context' in invokeError) {
                        // @ts-ignore
                        const body = await invokeError.context.json();
                        if (body && body.error) {
                            errorMessage = body.error;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing response body', e);
                }
                throw new Error(errorMessage || 'Failed to invoke delete-user function');
            }

            // Check for application level error in data
            if (data && data.error) {
                throw new Error(data.error);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Delete account error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to delete account. Please try again.');
        } finally {
            if (status !== 'error') {
                // on success we redirect, so no need to stop loading really
            } else {
                setStatus('idle');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0E1338] border border-red-500/20 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-red-500/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Delete Account</h2>
                            <p className="text-xs text-red-400 font-bold uppercase tracking-widest mt-1">Permanent Action</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={status === 'deleting'}
                        className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-text-secondary text-sm leading-relaxed">
                        This action cannot be undone. This will permanently delete your account, session history, and all trading data.
                    </p>

                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                        <label className="block text-xs font-bold text-red-400 uppercase tracking-widest mb-2">
                            Type "DELETE" to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="DELETE"
                            disabled={status === 'deleting'}
                            className="w-full bg-[#0B0E14] border border-red-500/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-red-500 transition-colors font-mono"
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg">
                            Error: {errorMessage}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={status === 'deleting'}
                        className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={confirmationText !== 'DELETE' || status === 'deleting'}
                        className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-2 ${confirmationText === 'DELETE'
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {status === 'deleting' ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Account'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
