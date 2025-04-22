-- Funcții RPC pentru crearea tabelelor în Supabase

-- Funcție pentru crearea tabelei profiles
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificăm dacă tabela există deja
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      full_name TEXT,
      avatar_url TEXT,
      job_title TEXT,
      phone TEXT,
      location TEXT,
      bio TEXT,
      skills TEXT[],
      theme_preference TEXT DEFAULT 'system',
      language_preference TEXT DEFAULT 'ro',
      email_notifications BOOLEAN DEFAULT true,
      mobile_notifications BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Adăugăm politici RLS pentru tabela profiles
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Politică pentru a permite utilizatorilor să-și vadă propriul profil
    CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
    
    -- Politică pentru a permite utilizatorilor să-și actualizeze propriul profil
    CREATE POLICY "Users can update their own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id);
    
    -- Politică pentru a permite inserarea profilului la înregistrare
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
    
    -- Trigger pentru actualizarea câmpului updated_at
    CREATE TRIGGER set_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Funcție pentru crearea tabelei projects
CREATE OR REPLACE FUNCTION create_projects_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificăm dacă tabela există deja
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    -- Creăm tipul enum pentru statusul proiectului
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
      CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');
    END IF;
    
    -- Creăm tabela projects
    CREATE TABLE public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      status project_status DEFAULT 'active',
      start_date DATE,
      end_date DATE,
      budget NUMERIC(12, 2),
      client TEXT,
      location TEXT,
      manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Adăugăm politici RLS pentru tabela projects
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    
    -- Politică pentru a permite tuturor utilizatorilor autentificați să vadă proiectele
    CREATE POLICY "All authenticated users can view projects"
      ON public.projects
      FOR SELECT
      USING (auth.role() = 'authenticated');
    
    -- Politică pentru a permite utilizatorilor să creeze proiecte
    CREATE POLICY "Authenticated users can create projects"
      ON public.projects
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
    
    -- Politică pentru a permite managerilor să actualizeze proiectele lor
    CREATE POLICY "Managers can update their projects"
      ON public.projects
      FOR UPDATE
      USING (auth.uid() = manager_id OR auth.uid() = created_by);
    
    -- Trigger pentru actualizarea câmpului updated_at
    CREATE TRIGGER set_projects_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Funcție pentru crearea tabelei materials
CREATE OR REPLACE FUNCTION create_materials_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificăm dacă tabela există deja
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    -- Creăm tabela materials
    CREATE TABLE public.materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      dimension TEXT,
      unit TEXT NOT NULL,
      quantity NUMERIC(12, 2) DEFAULT 0,
      manufacturer TEXT,
      category TEXT,
      image_url TEXT,
      cost_per_unit NUMERIC(12, 2),
      supplier_id UUID,
      last_order_date DATE,
      min_stock_level NUMERIC(12, 2),
      max_stock_level NUMERIC(12, 2),
      location TEXT,
      notes TEXT,
      project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      suplimentar JSONB DEFAULT '{}'::jsonb
    );
    
    -- Adăugăm politici RLS pentru tabela materials
    ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
    
    -- Politică pentru a permite tuturor utilizatorilor autentificați să vadă materialele
    CREATE POLICY "All authenticated users can view materials"
      ON public.materials
      FOR SELECT
      USING (auth.role() = 'authenticated');
    
    -- Politică pentru a permite utilizatorilor să creeze materiale
    CREATE POLICY "Authenticated users can create materials"
      ON public.materials
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
    
    -- Politică pentru a permite utilizatorilor să actualizeze materialele
    CREATE POLICY "Authenticated users can update materials"
      ON public.materials
      FOR UPDATE
      USING (auth.role() = 'authenticated');
    
    -- Politică pentru a permite utilizatorilor să șteargă materialele
    CREATE POLICY "Authenticated users can delete materials"
      ON public.materials
      FOR DELETE
      USING (auth.role() = 'authenticated');
    
    -- Trigger pentru actualizarea câmpului updated_at
    CREATE TRIGGER set_materials_updated_at
      BEFORE UPDATE ON public.materials
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Funcție helper pentru actualizarea câmpului updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
