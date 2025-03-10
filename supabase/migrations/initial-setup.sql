-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text,
    name text,
    full_name text,
    image text,
    avatar_url text,
    user_id text UNIQUE,
    token_identifier text NOT NULL UNIQUE,
    subscription text,
    credits text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS user_id_idx ON public.users(user_id);