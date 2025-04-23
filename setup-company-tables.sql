-- Crearea tabelelor pentru gestionarea companiilor și rolurilor

-- Tabel pentru companii
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

-- Tabel pentru asocierea utilizatorilor cu companiile
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

-- Tabel pentru invitații în companii
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

-- Tabel pentru administratorii de site
CREATE TABLE IF NOT EXISTS site_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Adăugăm câmpuri noi în tabelul de profile pentru a stoca informații despre companie
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_site_admin BOOLEAN DEFAULT false;

-- Creăm politici de securitate pentru tabelele noi

-- Politici pentru companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Oricine poate vedea companiile active
CREATE POLICY "Companiile active sunt vizibile pentru toți utilizatorii autentificați"
  ON companies FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'active');

-- Doar administratorii de site pot crea, actualiza și șterge companii
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

-- Utilizatorii pot vedea alți utilizatori din companiile lor
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

-- Doar administratorii de companie și administratorii de site pot adăuga utilizatori
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

-- Doar administratorii de companie și administratorii de site pot actualiza utilizatori
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

-- Doar administratorii de companie și administratorii de site pot șterge utilizatori
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

-- Utilizatorii pot vedea invitațiile pentru companiile lor
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

-- Doar administratorii de companie și administratorii de site pot crea invitații
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

-- Doar administratorii de companie și administratorii de site pot actualiza invitații
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

-- Doar administratorii de companie și administratorii de site pot șterge invitații
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

-- Politici pentru site_admins
ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;

-- Toți utilizatorii autentificați pot vedea administratorii de site
CREATE POLICY "Toți utilizatorii autentificați pot vedea administratorii de site"
  ON site_admins FOR SELECT
  USING (auth.role() = 'authenticated');

-- Doar administratorii de site pot adăuga alți administratori de site
CREATE POLICY "Doar administratorii de site pot adăuga alți administratori de site"
  ON site_admins FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Doar administratorii de site pot șterge alți administratori de site
CREATE POLICY "Doar administratorii de site pot șterge alți administratori de site"
  ON site_admins FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

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
  UPDATE profiles SET is_site_admin = true WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
