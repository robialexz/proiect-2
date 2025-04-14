-- Create resources table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  status text DEFAULT 'available',
  acquisition_date date,
  acquisition_cost numeric,
  current_value numeric,
  location text,
  assigned_to uuid REFERENCES auth.users(id),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  maintenance_schedule jsonb,
  last_maintenance_date date,
  next_maintenance_date date,
  specifications jsonb,
  image_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Users can create resources"
  ON public.resources FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update resources"
  ON public.resources FOR UPDATE
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete resources"
  ON public.resources FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Create resource_allocations table
CREATE TABLE IF NOT EXISTS public.resource_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resource allocations"
  ON public.resource_allocations FOR SELECT
  USING (true);

CREATE POLICY "Users can create resource allocations"
  ON public.resource_allocations FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update resource allocations"
  ON public.resource_allocations FOR UPDATE
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete resource allocations"
  ON public.resource_allocations FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Create resource_maintenance table
CREATE TABLE IF NOT EXISTS public.resource_maintenance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  maintenance_date date NOT NULL,
  maintenance_type text NOT NULL,
  cost numeric,
  performed_by text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.resource_maintenance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resource maintenance"
  ON public.resource_maintenance FOR SELECT
  USING (true);

CREATE POLICY "Users can create resource maintenance"
  ON public.resource_maintenance FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update resource maintenance"
  ON public.resource_maintenance FOR UPDATE
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete resource maintenance"
  ON public.resource_maintenance FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER on_resources_updated
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_resource_allocations_updated
  BEFORE UPDATE ON public.resource_allocations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_resource_maintenance_updated
  BEFORE UPDATE ON public.resource_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
