-- 1. Create user_access table
CREATE TABLE IF NOT EXISTS public.user_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    access_type TEXT CHECK (access_type IN ('subscription', 'affiliate')),
    plan_tier TEXT CHECK (plan_tier IN ('monthly', 'yearly', 'affiliate_free')),
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'pending', 'active', 'expired')),
    valid_until TIMESTAMPTZ,
    platform_name TEXT,
    platform_account_id TEXT,
    proof_url TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- Policies for user_access
CREATE POLICY "Users can view their own access status"
    ON public.user_access FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data (for affiliate submission)"
    ON public.user_access FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access record"
    ON public.user_access FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_access
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2. Storage Setup (Run these or use the Dashboard UI)
-- Create bucket: verification-proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-proofs', 'verification-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage bucket
CREATE POLICY "Users can upload their own proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
