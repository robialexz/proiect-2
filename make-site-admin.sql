-- Script pentru a face un utilizator admin de site

-- Verificăm dacă tabelul site_admins există, dacă nu, îl creăm
CREATE TABLE IF NOT EXISTS site_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Adăugăm politici de securitate pentru tabelul site_admins
ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;

-- Toți utilizatorii autentificați pot vedea administratorii de site
CREATE POLICY IF NOT EXISTS "Toți utilizatorii autentificați pot vedea administratorii de site"
  ON site_admins FOR SELECT
  USING (auth.role() = 'authenticated');

-- Doar administratorii de site pot adăuga alți administratori de site
CREATE POLICY IF NOT EXISTS "Doar administratorii de site pot adăuga alți administratori de site"
  ON site_admins FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Doar administratorii de site pot șterge alți administratori de site
CREATE POLICY IF NOT EXISTS "Doar administratorii de site pot șterge alți administratori de site"
  ON site_admins FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  ));

-- Adăugăm utilizatorul ca admin de site
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Obținem ID-ul utilizatorului după email
  SELECT id INTO user_id FROM auth.users WHERE email = 'robialexzi0@gmail.com';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilizatorul cu email-ul specificat nu există';
  END IF;
  
  -- Adăugăm utilizatorul ca admin de site
  INSERT INTO site_admins (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Actualizăm profilul utilizatorului
  UPDATE profiles
  SET role = 'site_admin', is_site_admin = true
  WHERE id = user_id;
  
  -- Adăugăm utilizatorul în tabelul user_roles cu rolul de site_admin
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'site_admin')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'site_admin';
  
  RAISE NOTICE 'Utilizatorul a fost făcut admin de site cu succes!';
END $$;
