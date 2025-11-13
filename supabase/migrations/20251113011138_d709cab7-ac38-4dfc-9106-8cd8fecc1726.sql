-- Create activity_metrics table for manual admin input
CREATE TABLE public.activity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Enable RLS
ALTER TABLE public.activity_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public data)
CREATE POLICY "Anyone can view activity metrics"
ON public.activity_metrics
FOR SELECT
USING (true);

-- Insert default metrics
INSERT INTO public.activity_metrics (metric_name, value) VALUES
  ('lp_burn', 0),
  ('corn_burn', 0),
  ('staking_pool', 0),
  ('buyback', 0);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_activity_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activity_metrics_timestamp
BEFORE UPDATE ON public.activity_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_metrics_timestamp();