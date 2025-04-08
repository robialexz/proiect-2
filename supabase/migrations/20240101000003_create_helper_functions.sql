-- Function to create projects table if it doesn't exist
CREATE OR REPLACE FUNCTION create_projects_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) THEN
    -- Create projects table
    CREATE TABLE projects (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL,
      description text,
      status text DEFAULT 'active',
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      created_by uuid REFERENCES auth.users(id)
    );

    -- Enable RLS
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view all projects"
      ON projects FOR SELECT
      USING (true);

    CREATE POLICY "Users can create projects"
      ON projects FOR INSERT
      WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Users can update their own projects"
      ON projects FOR UPDATE
      USING (auth.uid() = created_by);

    CREATE POLICY "Users can delete their own projects"
      ON projects FOR DELETE
      USING (auth.uid() = created_by);
  END IF;
END;
$$;

-- Function to create materials table if it doesn't exist
CREATE OR REPLACE FUNCTION create_materials_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- First ensure projects table exists
  PERFORM create_projects_table();
  
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'materials'
  ) THEN
    -- Create materials table
    CREATE TABLE materials (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
      name text NOT NULL,
      dimension text,
      unit text NOT NULL,
      quantity numeric NOT NULL DEFAULT 0,
      manufacturer text,
      category text,
      suplimentar numeric DEFAULT 0,
      cost_per_unit numeric,
      supplier_id text,
      last_order_date date,
      min_stock_level numeric,
      max_stock_level numeric,
      location text,
      notes text,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
    );

    -- Enable RLS
    ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view all materials"
      ON materials FOR SELECT
      USING (true);

    CREATE POLICY "Users can create materials"
      ON materials FOR INSERT
      USING (true);

    CREATE POLICY "Users can update materials"
      ON materials FOR UPDATE
      USING (true);

    CREATE POLICY "Users can delete materials"
      ON materials FOR DELETE
      USING (true);

    -- Create function to update the updated_at timestamp
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS trigger AS $$
    BEGIN
      new.updated_at = now();
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger for updating the updated_at timestamp
    CREATE TRIGGER on_materials_updated
      BEFORE UPDATE ON materials
      FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END;
$$;
