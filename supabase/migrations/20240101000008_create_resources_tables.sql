-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  status text DEFAULT 'available',
  cost_per_day numeric,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resources"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Users can create resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own resources"
  ON resources FOR DELETE
  USING (auth.uid() = created_by);

-- Create resource_categories table
CREATE TABLE IF NOT EXISTS resource_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resource categories"
  ON resource_categories FOR SELECT
  USING (true);

CREATE POLICY "Users can create resource categories"
  ON resource_categories FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own resource categories"
  ON resource_categories FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own resource categories"
  ON resource_categories FOR DELETE
  USING (auth.uid() = created_by);

-- Create resource_allocations table
CREATE TABLE IF NOT EXISTS resource_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  quantity numeric DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resource allocations"
  ON resource_allocations FOR SELECT
  USING (true);

CREATE POLICY "Users can create resource allocations"
  ON resource_allocations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own resource allocations"
  ON resource_allocations FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own resource allocations"
  ON resource_allocations FOR DELETE
  USING (auth.uid() = created_by);

-- Create resource_maintenance table
CREATE TABLE IF NOT EXISTS resource_maintenance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  scheduled_date date NOT NULL,
  completed_date date,
  cost numeric,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE resource_maintenance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resource maintenance"
  ON resource_maintenance FOR SELECT
  USING (true);

CREATE POLICY "Users can create resource maintenance"
  ON resource_maintenance FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own resource maintenance"
  ON resource_maintenance FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own resource maintenance"
  ON resource_maintenance FOR DELETE
  USING (auth.uid() = created_by);

-- Create many-to-many relationship between resources and categories
CREATE TABLE IF NOT EXISTS resource_category_mappings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES resource_categories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(resource_id, category_id)
);

-- Enable RLS
ALTER TABLE resource_category_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all resource category mappings"
  ON resource_category_mappings FOR SELECT
  USING (true);

CREATE POLICY "Users can create resource category mappings"
  ON resource_category_mappings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resources
      WHERE id = resource_category_mappings.resource_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete resource category mappings"
  ON resource_category_mappings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM resources
      WHERE id = resource_category_mappings.resource_id AND created_by = auth.uid()
    )
  );

-- Create triggers for updating the updated_at timestamp
CREATE TRIGGER on_resources_updated
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_resource_categories_updated
  BEFORE UPDATE ON resource_categories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_resource_allocations_updated
  BEFORE UPDATE ON resource_allocations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_resource_maintenance_updated
  BEFORE UPDATE ON resource_maintenance
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
