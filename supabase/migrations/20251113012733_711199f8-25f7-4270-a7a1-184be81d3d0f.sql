-- Replace update policy to allow admin address via updated_by column
DROP POLICY IF EXISTS "Admins can update activity metrics" ON public.activity_metrics;

-- Allow anyone to attempt update, but require the row's updated_by to be the admin address
CREATE POLICY "Only admin address can update activity metrics"
ON public.activity_metrics
FOR UPDATE
USING (true)
WITH CHECK (lower(updated_by) = '0x9d86ab0c305633a1e77cfeadf62d07ab70e7ccf5');