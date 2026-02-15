import { supabase } from '../supabaseClient';

export const startTrial = async (userId: string) => {
    try {
        // 1. Check if user already has a trial history
        const { data: existingAccess, error: fetchError } = await supabase
            .from('user_access')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (existingAccess && existingAccess.plan_tier === 'trial') {
            throw new Error('Trial already used by this account');
        }

        // 2. Initialize Trial Record
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 7);

        const { data, error } = await supabase
            .from('user_access')
            .upsert({
                user_id: userId,
                access_type: 'trial',
                plan_tier: 'trial',
                status: 'active',
                valid_until: validUntil.toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;
        return data;

    } catch (err) {
        console.error('[trialService] Error starting trial:', err);
        throw err;
    }
};

/**
 * DEBUG ONLY: Fast-forward or rewind trial expiration
 * @param userId User ID
 * @param daysInFuture Number of days from now the trial should expire (use negative for past)
 */
export const debugSetTrialExpiration = async (userId: string, daysInFuture: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysInFuture);

    const { data, error } = await supabase
        .from('user_access')
        .update({ valid_until: newDate.toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
