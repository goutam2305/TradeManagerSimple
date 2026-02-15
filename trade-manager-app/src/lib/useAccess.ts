import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { isAdmin } from '../config/adminConfig';

export type AccessStatus = 'inactive' | 'pending' | 'active' | 'expired';
export type AccessType = 'subscription' | 'affiliate' | 'trial' | null;

export interface UserAccess {
    status: AccessStatus;
    access_type: AccessType;
    plan_tier: string | null;
    valid_until: string | null;
    rejection_reason: string | null;
}

export const useAccess = (userId: string | undefined) => {
    const [access, setAccess] = useState<UserAccess>({
        status: 'inactive',
        access_type: null,
        plan_tier: null,
        valid_until: null,
        rejection_reason: null
    });
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | undefined>();

    const refreshAccess = async () => {
        if (!userId) {
            console.log('[useAccess] No userId provided, skipping refresh.');
            setLoading(false);
            return;
        }

        console.log('[useAccess] Refreshing access for user:', userId);
        setLoading(true);

        try {
            // Get current user for email check
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError) throw authError;

            const email = user?.email;
            setUserEmail(email);
            console.log('[useAccess] User email retrieved:', email);

            // If it's an admin, give them full access immediately
            if (isAdmin(email)) {
                console.log('[useAccess] Admin access detected.');
                setAccess({
                    status: 'active',
                    access_type: 'subscription',
                    plan_tier: 'Admin',
                    valid_until: null,
                    rejection_reason: null
                });
                return;
            }

            // 1. Check DB record
            const { data, error } = await supabase
                .from('user_access')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle(); // Better than single() as it doesn't throw on 0 rows

            if (error) {
                console.error('[useAccess] DB Fetch Error:', error);
                throw error;
            }

            if (data) {
                console.log('[useAccess] Access record found:', data.status, data.access_type);
                setAccess({
                    status: data.status,
                    access_type: data.access_type,
                    plan_tier: data.plan_tier,
                    valid_until: data.valid_until,
                    rejection_reason: data.rejection_reason
                });
            } else {
                // 2. Fallback: Check user metadata if DB record doesn't exist yet
                const signupType = user?.user_metadata?.signup_type || 'subscription';
                console.log('[useAccess] No DB record found. Fallback to metadata:', signupType);

                setAccess({
                    status: 'inactive',
                    access_type: signupType as AccessType,
                    plan_tier: null,
                    valid_until: null,
                    rejection_reason: null
                });

                // 3. Self-healing: Attempt to create the missing row
                console.log('[useAccess] Attempting self-heal for user:', userId);
                try {
                    await supabase
                        .from('user_access')
                        .insert({
                            user_id: userId,
                            access_type: signupType,
                            status: 'inactive'
                        });
                } catch (healErr) {
                    console.error('[useAccess] Self-heal failed (non-critical):', healErr);
                }
            }
        } catch (err) {
            console.error('[useAccess] Critical Error in refreshAccess:', err);
        } finally {
            console.log('[useAccess] Refresh complete, settling loading state.');
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAccess();

        // Subscribe to changes
        const subscription = supabase
            .channel('user_access_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_access',
                filter: `user_id=eq.${userId}`
            }, () => {
                refreshAccess();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [userId]);

    const isTrialExpired = access.plan_tier === 'trial' && access.valid_until && new Date(access.valid_until) < new Date();
    const hasFullAccess = (access.status === 'active' && !isTrialExpired) || isAdmin(userEmail);

    return { access, loading, hasFullAccess, isTrialExpired, refreshAccess, userEmail };
};
