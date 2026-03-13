-- Migration script for AI Fashion Website
-- Provide this script to your Supabase administrator to run in the SQL Editor.

-- 1. Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup permissive policies (since the Express backend currently uses anon key)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.services FOR DELETE USING (true);

-- 2. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup permissive policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.contact_messages FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.contact_messages FOR DELETE USING (true);
