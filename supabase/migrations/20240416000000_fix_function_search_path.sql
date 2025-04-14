-- Fix function search path for security
-- This prevents potential security issues by explicitly setting the search_path

-- Fix create_user_role function
CREATE OR REPLACE FUNCTION public.create_user_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    -- Create user_roles table
    CREATE TABLE user_roles (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role text NOT NULL DEFAULT 'user',
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
    );

    -- Enable RLS
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own roles"
      ON user_roles FOR SELECT
      USING ((select auth.uid()) = user_id);

    CREATE POLICY "Admins can manage all roles"
      ON user_roles FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = (select auth.uid()) AND role = 'admin'
        )
      );
  END IF;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    INSERT INTO public.profiles (id, display_name, email, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert into user_roles if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Fix any other helper functions that might have the same issue
CREATE OR REPLACE FUNCTION public.create_projects_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
      WITH CHECK ((select auth.uid()) = created_by);

    CREATE POLICY "Users can update their own projects"
      ON projects FOR UPDATE
      USING ((select auth.uid()) = created_by);

    CREATE POLICY "Users can delete their own projects"
      ON projects FOR DELETE
      USING ((select auth.uid()) = created_by);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_materials_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  END IF;
END;
$$;
