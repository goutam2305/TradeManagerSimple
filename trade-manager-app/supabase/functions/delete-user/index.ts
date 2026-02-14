
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


serve(async (req) => {
    // Log entry
    console.log(`[delete-user] Request received: ${req.method}`);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        console.log(`[delete-user] Auth Header present: ${!!authHeader}`);

        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 1. Get the user from the JWT
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser()

        if (userError) {
            console.error(`[delete-user] getUser error:`, userError);
            throw userError;
        }

        if (!user) {
            console.error(`[delete-user] No user found`);
            throw new Error('Unauthorized - No user found')
        }

        console.log(`[delete-user] User found: ${user.id}`);

        // 2. Initialize Admin Client with Service Role Key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Cleanup Storage (Trade Evidence)
        // Files are stored in 'trade-evidence' bucket under '{userId}/' folder
        console.log(`[delete-user] Cleaning up storage for user ${user.id}`);
        const { data: files, error: listError } = await supabaseAdmin
            .storage
            .from('trade-evidence')
            .list(user.id + '/');

        if (listError) {
            console.error(`[delete-user] Storage list error:`, listError);
            // We continue? Maybe not. If we can't list, we might fail to delete user if constraint exists.
            // But if bucket is empty/folder doesn't exist, it might return empty array.
        }

        if (files && files.length > 0) {
            const filesToDelete = files.map(f => `${user.id}/${f.name}`);
            console.log(`[delete-user] Deleting ${filesToDelete.length} files`);

            const { error: deleteError } = await supabaseAdmin
                .storage
                .from('trade-evidence')
                .remove(filesToDelete);

            if (deleteError) {
                console.error(`[delete-user] Storage delete error:`, deleteError);
                throw deleteError;
            }
        }

        // 3b. Cleanup Storage (Avatars)
        console.log(`[delete-user] Cleaning up avatars for user ${user.id}`);
        const { data: avatarFiles, error: avatarListError } = await supabaseAdmin
            .storage
            .from('avatars')
            .list(user.id + '/');

        if (avatarListError) {
            console.error(`[delete-user] Avatars list error:`, avatarListError);
        }

        if (avatarFiles && avatarFiles.length > 0) {
            const avatarsToDelete = avatarFiles.map((f: any) => `${user.id}/${f.name}`);
            console.log(`[delete-user] Deleting ${avatarsToDelete.length} avatars`);

            const { error: deleteAvatarError } = await supabaseAdmin
                .storage
                .from('avatars')
                .remove(avatarsToDelete);

            if (deleteAvatarError) {
                console.error(`[delete-user] Avatars delete error:`, deleteAvatarError);
                throw deleteAvatarError;
            }
        }

        // 4. Delete the user
        console.log(`[delete-user] Deleting user record`);
        const { error } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        )

        if (error) {
            console.error(`[delete-user] Delete error:`, error);
            throw error
        }

        console.log(`[delete-user] User deleted successfully`);

        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error(`[delete-user] Catch error:`, error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
