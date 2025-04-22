-- Funcții RPC pentru gestionarea bazei de date Supabase

-- Funcție pentru resetarea bazei de date
CREATE OR REPLACE FUNCTION reset_database()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_name text;
BEGIN
  -- Dezactivăm temporar RLS pentru a permite ștergerea tuturor datelor
  ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.materials DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.budgets DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.budget_categories DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.report_templates DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resources DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resource_allocations DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resource_categories DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resource_category_mappings DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.health_check DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.supplier_announcements DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.supplier_announcement_files DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.material_orders DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.project_order_settings DISABLE ROW LEVEL SECURITY;
  
  -- Ștergem datele din toate tabelele
  TRUNCATE TABLE IF EXISTS public.profiles CASCADE;
  TRUNCATE TABLE IF EXISTS public.projects CASCADE;
  TRUNCATE TABLE IF EXISTS public.materials CASCADE;
  TRUNCATE TABLE IF EXISTS public.budgets CASCADE;
  TRUNCATE TABLE IF EXISTS public.expenses CASCADE;
  TRUNCATE TABLE IF EXISTS public.budget_categories CASCADE;
  TRUNCATE TABLE IF EXISTS public.reports CASCADE;
  TRUNCATE TABLE IF EXISTS public.report_templates CASCADE;
  TRUNCATE TABLE IF EXISTS public.resources CASCADE;
  TRUNCATE TABLE IF EXISTS public.resource_allocations CASCADE;
  TRUNCATE TABLE IF EXISTS public.resource_categories CASCADE;
  TRUNCATE TABLE IF EXISTS public.resource_category_mappings CASCADE;
  TRUNCATE TABLE IF EXISTS public.tasks CASCADE;
  TRUNCATE TABLE IF EXISTS public.user_roles CASCADE;
  TRUNCATE TABLE IF EXISTS public.health_check CASCADE;
  TRUNCATE TABLE IF EXISTS public.supplier_announcements CASCADE;
  TRUNCATE TABLE IF EXISTS public.supplier_announcement_files CASCADE;
  TRUNCATE TABLE IF EXISTS public.material_orders CASCADE;
  TRUNCATE TABLE IF EXISTS public.project_order_settings CASCADE;
  
  -- Reactivăm RLS pentru toate tabelele
  ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.budgets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.budget_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.report_templates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resources ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resource_allocations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resource_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.resource_category_mappings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.health_check ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.supplier_announcements ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.supplier_announcement_files ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.material_orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.project_order_settings ENABLE ROW LEVEL SECURITY;
END;
$$;

-- Funcție pentru popularea bazei de date cu date de test
CREATE OR REPLACE FUNCTION seed_database()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user_id uuid;
  project_id1 uuid;
  project_id2 uuid;
BEGIN
  -- Verificăm dacă există utilizatorul de test
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com' LIMIT 1;
  
  -- Dacă nu există utilizatorul de test, nu putem continua
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Please create a test user first.';
  END IF;
  
  -- Creăm profilul utilizatorului de test dacă nu există
  INSERT INTO public.profiles (id, email, display_name, full_name)
  VALUES (test_user_id, 'test@example.com', 'Test User', 'Test User')
  ON CONFLICT (id) DO NOTHING;
  
  -- Creăm proiecte de test
  INSERT INTO public.projects (name, description, status, start_date, end_date, budget, client, location, manager_id, created_by)
  VALUES ('Proiect de test 1', 'Acesta este un proiect de test pentru dezvoltare', 'active', '2023-01-01', '2023-12-31', 100000, 'Client de test', 'București', test_user_id, test_user_id)
  RETURNING id INTO project_id1;
  
  INSERT INTO public.projects (name, description, status, start_date, end_date, budget, client, location, manager_id, created_by)
  VALUES ('Proiect de test 2', 'Al doilea proiect de test pentru dezvoltare', 'on_hold', '2023-02-01', '2023-11-30', 75000, 'Alt client de test', 'Cluj', test_user_id, test_user_id)
  RETURNING id INTO project_id2;
  
  -- Creăm materiale pentru primul proiect
  INSERT INTO public.materials (name, dimension, unit, quantity, manufacturer, category, cost_per_unit, min_stock_level, max_stock_level, location, project_id, created_by)
  VALUES 
    ('Material de test 1 (Proiect 1)', '10x10', 'buc', 100, 'Producător de test', 'Categoria 1', 10.5, 20, 200, 'Depozit A', project_id1, test_user_id),
    ('Material de test 2 (Proiect 1)', '20x20', 'kg', 50, 'Alt producător', 'Categoria 2', 25.75, 10, 100, 'Depozit B', project_id1, test_user_id),
    ('Material de test 3 (Proiect 1)', '30x30', 'm', 200, 'Producător de test', 'Categoria 1', 5.25, 50, 500, 'Depozit A', project_id1, test_user_id);
  
  -- Creăm materiale pentru al doilea proiect
  INSERT INTO public.materials (name, dimension, unit, quantity, manufacturer, category, cost_per_unit, min_stock_level, max_stock_level, location, project_id, created_by)
  VALUES 
    ('Material de test 1 (Proiect 2)', '10x10', 'buc', 100, 'Producător de test', 'Categoria 1', 10.5, 20, 200, 'Depozit A', project_id2, test_user_id),
    ('Material de test 2 (Proiect 2)', '20x20', 'kg', 50, 'Alt producător', 'Categoria 2', 25.75, 10, 100, 'Depozit B', project_id2, test_user_id),
    ('Material de test 3 (Proiect 2)', '30x30', 'm', 200, 'Producător de test', 'Categoria 1', 5.25, 50, 500, 'Depozit A', project_id2, test_user_id);
  
  -- Creăm materiale fără proiect (inventar general)
  INSERT INTO public.materials (name, dimension, unit, quantity, manufacturer, category, cost_per_unit, min_stock_level, max_stock_level, location, created_by)
  VALUES 
    ('Material de test 1 (General)', '10x10', 'buc', 100, 'Producător de test', 'Categoria 1', 10.5, 20, 200, 'Depozit A', test_user_id),
    ('Material de test 2 (General)', '20x20', 'kg', 50, 'Alt producător', 'Categoria 2', 25.75, 10, 100, 'Depozit B', test_user_id),
    ('Material de test 3 (General)', '30x30', 'm', 200, 'Producător de test', 'Categoria 1', 5.25, 50, 500, 'Depozit A', test_user_id);
END;
$$;
