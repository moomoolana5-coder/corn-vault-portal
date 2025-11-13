-- Drop trigger and function, then recreate with proper search_path
DROP TRIGGER IF EXISTS update_activity_metrics_timestamp ON public.activity_metrics;
DROP FUNCTION IF EXISTS public.update_activity_metrics_timestamp();

-- Recreate function with security definer and search_path set
CREATE OR REPLACE FUNCTION public.update_activity_metrics_timestamp()
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

-- Recreate trigger
CREATE TRIGGER update_activity_metrics_timestamp
BEFORE UPDATE ON public.activity_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_metrics_timestamp();