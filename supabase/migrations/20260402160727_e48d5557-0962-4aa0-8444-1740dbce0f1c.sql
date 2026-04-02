CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
TO public
USING (auth.uid() = user_id);