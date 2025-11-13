-- Create table to store pool pause status
CREATE TABLE public.pool_pause_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id INTEGER NOT NULL UNIQUE,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  paused_by TEXT,
  paused_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pool_pause_status ENABLE ROW LEVEL SECURITY;

-- Anyone can view pause status
CREATE POLICY "Anyone can view pool pause status"
ON public.pool_pause_status
FOR SELECT
USING (true);

-- Only admin address can update pause status
CREATE POLICY "Only admin can update pool pause status"
ON public.pool_pause_status
FOR ALL
USING (lower(paused_by) = '0x9d86ab0c305633a1e77cfeadf62d07ab70e7ccf5')
WITH CHECK (lower(paused_by) = '0x9d86ab0c305633a1e77cfeadf62d07ab70e7ccf5');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_pool_pause_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_pool_pause_timestamp
BEFORE UPDATE ON public.pool_pause_status
FOR EACH ROW
EXECUTE FUNCTION public.update_pool_pause_timestamp();