-- Îmbunătățirea securității în Supabase

-- 1. Modificarea bucket-urilor de stocare pentru a nu mai fi publice
UPDATE storage.buckets SET public = false WHERE id IN ('materials', 'documents');

-- 2. Îmbunătățirea politicilor RLS pentru bucket-uri de stocare
-- Înlocuim politicile pentru bucket-ul materials
DROP POLICY IF EXISTS "Materials images are publicly accessible" ON storage.objects;
CREATE POLICY "Materials images are accessible to authenticated users"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'materials' AND (select auth.role()) = 'authenticated');

-- Înlocuim politicile pentru bucket-ul documents
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
CREATE POLICY "Documents are accessible to authenticated users"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (select auth.role()) = 'authenticated');

-- 3. Adăugarea unei funcții pentru validarea datelor de intrare
CREATE OR REPLACE FUNCTION public.validate_input(input_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifică dacă textul conține caractere potențial periculoase
  IF input_text ~ '[<>]' OR input_text ~ 'script' THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

-- 4. Adăugarea unei funcții pentru validarea email-urilor
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifică dacă email-ul are un format valid
  IF email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- 5. Adăugarea unei funcții pentru validarea URL-urilor
CREATE OR REPLACE FUNCTION public.validate_url(url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifică dacă URL-ul are un format valid
  IF url ~ '^https?://[A-Za-z0-9.-]+[.][A-Za-z]+(/[A-Za-z0-9._~:/?#[\]@!$&''()*+,;=%-]*)?$' THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- 6. Adăugarea unui trigger pentru validarea datelor înainte de inserare în profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validăm display_name
  IF NEW.display_name IS NOT NULL AND NOT validate_input(NEW.display_name) THEN
    RAISE EXCEPTION 'Invalid display name';
  END IF;
  
  -- Validăm email
  IF NEW.email IS NOT NULL AND NOT validate_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validăm avatar_url
  IF NEW.avatar_url IS NOT NULL AND NOT validate_url(NEW.avatar_url) THEN
    RAISE EXCEPTION 'Invalid avatar URL';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adăugăm trigger-ul la tabelul profiles
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON public.profiles;
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_data();

-- 7. Adăugarea unui trigger pentru validarea datelor înainte de inserare în projects
CREATE OR REPLACE FUNCTION public.validate_project_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validăm name
  IF NEW.name IS NOT NULL AND NOT validate_input(NEW.name) THEN
    RAISE EXCEPTION 'Invalid project name';
  END IF;
  
  -- Validăm description
  IF NEW.description IS NOT NULL AND NOT validate_input(NEW.description) THEN
    RAISE EXCEPTION 'Invalid project description';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adăugăm trigger-ul la tabelul projects
DROP TRIGGER IF EXISTS validate_project_data_trigger ON public.projects;
CREATE TRIGGER validate_project_data_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.validate_project_data();

-- 8. Adăugarea unui trigger pentru validarea datelor înainte de inserare în materials
CREATE OR REPLACE FUNCTION public.validate_material_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validăm name
  IF NEW.name IS NOT NULL AND NOT validate_input(NEW.name) THEN
    RAISE EXCEPTION 'Invalid material name';
  END IF;
  
  -- Validăm dimension
  IF NEW.dimension IS NOT NULL AND NOT validate_input(NEW.dimension) THEN
    RAISE EXCEPTION 'Invalid material dimension';
  END IF;
  
  -- Validăm unit
  IF NEW.unit IS NOT NULL AND NOT validate_input(NEW.unit) THEN
    RAISE EXCEPTION 'Invalid material unit';
  END IF;
  
  -- Validăm manufacturer
  IF NEW.manufacturer IS NOT NULL AND NOT validate_input(NEW.manufacturer) THEN
    RAISE EXCEPTION 'Invalid manufacturer name';
  END IF;
  
  -- Validăm category
  IF NEW.category IS NOT NULL AND NOT validate_input(NEW.category) THEN
    RAISE EXCEPTION 'Invalid category name';
  END IF;
  
  -- Validăm image_url
  IF NEW.image_url IS NOT NULL AND NOT validate_url(NEW.image_url) THEN
    RAISE EXCEPTION 'Invalid image URL';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adăugăm trigger-ul la tabelul materials
DROP TRIGGER IF EXISTS validate_material_data_trigger ON public.materials;
CREATE TRIGGER validate_material_data_trigger
  BEFORE INSERT OR UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.validate_material_data();

-- 9. Adăugarea unui trigger pentru validarea datelor înainte de inserare în documents
CREATE OR REPLACE FUNCTION public.validate_document_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validăm title
  IF NEW.title IS NOT NULL AND NOT validate_input(NEW.title) THEN
    RAISE EXCEPTION 'Invalid document title';
  END IF;
  
  -- Validăm content
  IF NEW.content IS NOT NULL AND NOT validate_input(NEW.content) THEN
    RAISE EXCEPTION 'Invalid document content';
  END IF;
  
  -- Validăm file_url
  IF NEW.file_url IS NOT NULL AND NOT validate_url(NEW.file_url) THEN
    RAISE EXCEPTION 'Invalid file URL';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adăugăm trigger-ul la tabelul documents
DROP TRIGGER IF EXISTS validate_document_data_trigger ON public.documents;
CREATE TRIGGER validate_document_data_trigger
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_document_data();

-- 10. Adăugarea unui trigger pentru validarea datelor înainte de inserare în teams
CREATE OR REPLACE FUNCTION public.validate_team_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validăm name
  IF NEW.name IS NOT NULL AND NOT validate_input(NEW.name) THEN
    RAISE EXCEPTION 'Invalid team name';
  END IF;
  
  -- Validăm description
  IF NEW.description IS NOT NULL AND NOT validate_input(NEW.description) THEN
    RAISE EXCEPTION 'Invalid team description';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adăugăm trigger-ul la tabelul teams
DROP TRIGGER IF EXISTS validate_team_data_trigger ON public.teams;
CREATE TRIGGER validate_team_data_trigger
  BEFORE INSERT OR UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.validate_team_data();

-- 11. Adăugarea unui trigger pentru validarea datelor înainte de inserare în resources
CREATE OR REPLACE FUNCTION public.validate_resource_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validăm name
  IF NEW.name IS NOT NULL AND NOT validate_input(NEW.name) THEN
    RAISE EXCEPTION 'Invalid resource name';
  END IF;
  
  -- Validăm description
  IF NEW.description IS NOT NULL AND NOT validate_input(NEW.description) THEN
    RAISE EXCEPTION 'Invalid resource description';
  END IF;
  
  -- Validăm type
  IF NEW.type IS NOT NULL AND NOT validate_input(NEW.type) THEN
    RAISE EXCEPTION 'Invalid resource type';
  END IF;
  
  -- Validăm location
  IF NEW.location IS NOT NULL AND NOT validate_input(NEW.location) THEN
    RAISE EXCEPTION 'Invalid resource location';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adăugăm trigger-ul la tabelul resources
DROP TRIGGER IF EXISTS validate_resource_data_trigger ON public.resources;
CREATE TRIGGER validate_resource_data_trigger
  BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.validate_resource_data();
