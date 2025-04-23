-- Script pentru a configura baza de date și a face utilizatorul admin

-- Verificăm dacă extensia uuid-ossp este instalată
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creăm tabelul profiles dacă nu există
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer',
  is_site_admin BOOLEAN DEFAULT false,
  current_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creăm tabelul user_roles dacă nu există
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Creăm tabelul site_admins dacă nu există
CREATE TABLE IF NOT EXISTS site_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Creăm tabelul companies dacă nu există
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  registration_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  subscription_plan TEXT,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creăm tabelul company_users dacă nu există
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Creăm tabelul company_invitations dacă nu există
CREATE TABLE IF NOT EXISTS company_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creăm tabelul projects dacă nu există
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creăm tabelul materials dacă nu există
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dimension TEXT,
  unit TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  manufacturer TEXT,
  category TEXT,
  image_url TEXT,
  suplimentar NUMERIC DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  cost_per_unit NUMERIC,
  supplier_id UUID,
  last_order_date TIMESTAMP WITH TIME ZONE,
  min_stock_level NUMERIC,
  max_stock_level NUMERIC,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adăugăm politici de securitate pentru tabelele

-- Politici pentru profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizatorii pot vedea propriul profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilizatorii pot actualiza propriul profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Administratorii pot vedea toate profilurile"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

CREATE POLICY "Administratorii pot actualiza toate profilurile"
  ON profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Politici pentru user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizatorii pot vedea propriul rol"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Administratorii pot vedea toate rolurile"
  ON user_roles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

CREATE POLICY "Administratorii pot actualiza toate rolurile"
  ON user_roles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

CREATE POLICY "Administratorii pot adăuga roluri"
  ON user_roles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Politici pentru site_admins
ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Toți utilizatorii autentificați pot vedea administratorii de site"
  ON site_admins FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Doar administratorii de site pot adăuga alți administratori de site"
  ON site_admins FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doar administratorii de site pot șterge alți administratori de site"
  ON site_admins FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Politici pentru companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companiile active sunt vizibile pentru toți utilizatorii autentificați"
  ON companies FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'active');

CREATE POLICY "Doar administratorii de site pot crea companii"
  ON companies FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doar administratorii de site pot actualiza companii"
  ON companies FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doar administratorii de site pot șterge companii"
  ON companies FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Politici pentru company_users
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizatorii pot vedea alți utilizatori din companiile lor"
  ON company_users FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      -- Utilizatorul este în aceeași companie
      company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
      )
      OR
      -- Sau utilizatorul este admin de site
      EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Doar administratorii pot adăuga utilizatori în companii"
  ON company_users FOR INSERT
  WITH CHECK (
    -- Utilizatorul este admin în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = NEW.company_id AND is_admin = true
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar administratorii pot actualiza utilizatori în companii"
  ON company_users FOR UPDATE
  USING (
    -- Utilizatorul este admin în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = OLD.company_id AND is_admin = true
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar administratorii pot șterge utilizatori din companii"
  ON company_users FOR DELETE
  USING (
    -- Utilizatorul este admin în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = OLD.company_id AND is_admin = true
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- Politici pentru company_invitations
ALTER TABLE company_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizatorii pot vedea invitațiile pentru companiile lor"
  ON company_invitations FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      -- Utilizatorul este admin în compania respectivă
      EXISTS (
        SELECT 1 FROM company_users 
        WHERE user_id = auth.uid() AND company_id = company_id AND is_admin = true
      )
      OR
      -- Sau utilizatorul este admin de site
      EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
      OR
      -- Sau invitația este pentru email-ul utilizatorului
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doar administratorii pot crea invitații"
  ON company_invitations FOR INSERT
  WITH CHECK (
    -- Utilizatorul este admin în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = NEW.company_id AND is_admin = true
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar administratorii pot actualiza invitații"
  ON company_invitations FOR UPDATE
  USING (
    -- Utilizatorul este admin în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = OLD.company_id AND is_admin = true
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar administratorii pot șterge invitații"
  ON company_invitations FOR DELETE
  USING (
    -- Utilizatorul este admin în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = OLD.company_id AND is_admin = true
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- Politici pentru projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizatorii pot vedea proiectele din companiile lor"
  ON projects FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      -- Utilizatorul este în compania proiectului
      company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
      )
      OR
      -- Sau utilizatorul este admin de site
      EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Doar administratorii și managerii pot crea proiecte"
  ON projects FOR INSERT
  WITH CHECK (
    -- Utilizatorul este admin sau manager în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = NEW.company_id AND 
      (is_admin = true OR role IN ('admin', 'manager'))
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar administratorii și managerii pot actualiza proiecte"
  ON projects FOR UPDATE
  USING (
    -- Utilizatorul este admin sau manager în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = OLD.company_id AND 
      (is_admin = true OR role IN ('admin', 'manager'))
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar administratorii și managerii pot șterge proiecte"
  ON projects FOR DELETE
  USING (
    -- Utilizatorul este admin sau manager în compania respectivă
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE user_id = auth.uid() AND company_id = OLD.company_id AND 
      (is_admin = true OR role IN ('admin', 'manager'))
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- Politici pentru materials
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizatorii pot vedea materialele din proiectele companiilor lor"
  ON materials FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      -- Utilizatorul este în compania proiectului
      project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON p.company_id = cu.company_id
        WHERE cu.user_id = auth.uid()
      )
      OR
      -- Sau utilizatorul este admin de site
      EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Doar utilizatorii autorizați pot adăuga materiale"
  ON materials FOR INSERT
  WITH CHECK (
    -- Utilizatorul are rol de admin, manager sau inventory_manager în compania proiectului
    EXISTS (
      SELECT 1 FROM company_users cu
      JOIN projects p ON cu.company_id = p.company_id
      WHERE cu.user_id = auth.uid() AND p.id = NEW.project_id AND 
      (cu.is_admin = true OR cu.role IN ('admin', 'manager', 'inventory_manager'))
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar utilizatorii autorizați pot actualiza materiale"
  ON materials FOR UPDATE
  USING (
    -- Utilizatorul are rol de admin, manager sau inventory_manager în compania proiectului
    EXISTS (
      SELECT 1 FROM company_users cu
      JOIN projects p ON cu.company_id = p.company_id
      WHERE cu.user_id = auth.uid() AND p.id = OLD.project_id AND 
      (cu.is_admin = true OR cu.role IN ('admin', 'manager', 'inventory_manager'))
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Doar utilizatorii autorizați pot șterge materiale"
  ON materials FOR DELETE
  USING (
    -- Utilizatorul are rol de admin, manager sau inventory_manager în compania proiectului
    EXISTS (
      SELECT 1 FROM company_users cu
      JOIN projects p ON cu.company_id = p.company_id
      WHERE cu.user_id = auth.uid() AND p.id = OLD.project_id AND 
      (cu.is_admin = true OR cu.role IN ('admin', 'manager', 'inventory_manager'))
    )
    OR
    -- Sau utilizatorul este admin de site
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- Funcții pentru verificarea rolurilor

-- Funcție pentru a verifica dacă un utilizator este admin de site
CREATE OR REPLACE FUNCTION is_site_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru a verifica dacă un utilizator este admin într-o companie
CREATE OR REPLACE FUNCTION is_company_admin(user_id UUID, company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_users 
    WHERE user_id = $1 AND company_id = $2 AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru a obține rolul unui utilizator într-o companie
CREATE OR REPLACE FUNCTION get_user_company_role(user_id UUID, company_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM company_users 
  WHERE user_id = $1 AND company_id = $2;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru a face un utilizator admin de site
CREATE OR REPLACE FUNCTION make_site_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Obținem ID-ul utilizatorului după email
  SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilizatorul cu email-ul % nu există', admin_email;
  END IF;
  
  -- Adăugăm utilizatorul ca admin de site
  INSERT INTO site_admins (user_id) VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Actualizăm profilul utilizatorului
  UPDATE profiles SET is_site_admin = true, role = 'site_admin' WHERE id = user_id;
  
  -- Actualizăm rolul utilizatorului
  INSERT INTO user_roles (user_id, role) VALUES (user_id, 'site_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'site_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Facem utilizatorul admin de site
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Obținem ID-ul utilizatorului după email
  SELECT id INTO user_id FROM auth.users WHERE email = 'robialexzi0@gmail.com';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilizatorul cu email-ul specificat nu există';
  END IF;
  
  -- Verificăm dacă există profilul utilizatorului
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Creăm profilul utilizatorului dacă nu există
    INSERT INTO profiles (id, email, display_name, role, is_site_admin)
    VALUES (user_id, 'robialexzi0@gmail.com', 'Admin', 'site_admin', true);
  ELSE
    -- Actualizăm profilul utilizatorului
    UPDATE profiles
    SET role = 'site_admin', is_site_admin = true
    WHERE id = user_id;
  END IF;
  
  -- Adăugăm utilizatorul ca admin de site
  INSERT INTO site_admins (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Adăugăm utilizatorul în tabelul user_roles cu rolul de site_admin
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'site_admin')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'site_admin';
  
  RAISE NOTICE 'Utilizatorul a fost făcut admin de site cu succes!';
END $$;
