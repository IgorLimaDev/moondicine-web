-- Add user_id to user_answers for web app
ALTER TABLE public.user_answers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);

-- Enable RLS and add policies for user_answers
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own answers" ON public.user_answers;
CREATE POLICY "Users can view own answers"
    ON public.user_answers FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own answers" ON public.user_answers;
CREATE POLICY "Users can insert own answers"
    ON public.user_answers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own answers" ON public.user_answers;
CREATE POLICY "Users can update own answers"
    ON public.user_answers FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow authenticated users to read questions and options (already have policies but ensure)
-- Questions and answer_options already have read policies for authenticated
