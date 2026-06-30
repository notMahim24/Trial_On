-- SECURITY LOCKDOWN
-- Run this in your Supabase SQL Editor to secure your database.
-- Because your Node.js backend now uses the Service Role Key, it will bypass these locks,
-- but hackers on the internet will be blocked from making unauthorized changes.

-- 1. Remove the wide-open permissions we added for development
DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow all for chat_messages" ON public.chat_messages;

-- 2. (Optional but recommended) Ensure RLS is still enabled on the tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Note: We are NOT adding any new permissive policies. 
-- By having RLS enabled and NO permissive policies, the tables are completely locked down 
-- to the public, which is exactly what we want!
