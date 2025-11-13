-- Create user_roles table and enum for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if a user has admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Only admins can update activity metrics
CREATE POLICY "Admins can update activity metrics"
ON public.activity_metrics
FOR UPDATE
USING (public.has_admin_role(updated_by))
WITH CHECK (public.has_admin_role(updated_by));

-- Anyone can view user roles (for checking admin status)
CREATE POLICY "Anyone can view user roles"
ON public.user_roles
FOR SELECT
USING (true);