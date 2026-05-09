CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  companion_mode TEXT NOT NULL,
  companion_name TEXT NOT NULL,
  letter_content TEXT NOT NULL,
  week_start DATE NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own letters"
  ON public.letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own letters"
  ON public.letters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own letters"
  ON public.letters FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_letters_user_unread ON public.letters(user_id, is_read);
CREATE UNIQUE INDEX idx_letters_unique_week ON public.letters(user_id, week_start);