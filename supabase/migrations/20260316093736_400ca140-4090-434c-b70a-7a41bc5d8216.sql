
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS mode text;
