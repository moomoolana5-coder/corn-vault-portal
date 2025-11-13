-- Create staking_locks table to track lock periods
CREATE TABLE IF NOT EXISTS public.staking_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  pool_id INTEGER NOT NULL,
  lock_duration_days INTEGER NOT NULL CHECK (lock_duration_days >= 1 AND lock_duration_days <= 30),
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE NOT NULL,
  amount NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_staking_locks_user_pool ON public.staking_locks(user_address, pool_id, is_active);

-- Enable RLS
ALTER TABLE public.staking_locks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read their own locks
CREATE POLICY "Users can view their own locks"
ON public.staking_locks
FOR SELECT
USING (true);

-- Allow anyone to insert their own locks
CREATE POLICY "Users can create their own locks"
ON public.staking_locks
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their own locks
CREATE POLICY "Users can update their own locks"
ON public.staking_locks
FOR UPDATE
USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_staking_locks_updated_at
  BEFORE UPDATE ON public.staking_locks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pool_pause_timestamp();