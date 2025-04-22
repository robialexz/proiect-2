-- Crearea tabelului pentru jurnalele de activitate
CREATE TABLE IF NOT EXISTS user_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adăugăm indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_action ON user_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_logs_resource ON user_logs(resource);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON user_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_logs_severity ON user_logs(severity);

-- Crearea tabelului pentru permisiuni
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crearea tabelului pentru asocierea permisiunilor cu rolurile
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Crearea tabelului pentru setările sistemului
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  security JSONB NOT NULL DEFAULT '{}',
  email JSONB NOT NULL DEFAULT '{}',
  maintenance JSONB NOT NULL DEFAULT '{}',
  backup JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adăugăm politici RLS pentru securitate

-- Politici pentru user_logs
ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administratorii pot vedea toate jurnalele"
  ON user_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Utilizatorii pot vedea doar propriile jurnale"
  ON user_logs FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Doar administratorii pot insera jurnale pentru alți utilizatori"
  ON user_logs FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    ) OR auth.uid() = user_id
  );

-- Politici pentru permissions
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doar administratorii pot gestiona permisiunile"
  ON permissions
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Politici pentru role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doar administratorii pot gestiona asocierile de permisiuni"
  ON role_permissions
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Politici pentru system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doar administratorii pot gestiona setările sistemului"
  ON system_settings
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Inserăm permisiunile implicite
INSERT INTO permissions (name, description, resource, action)
VALUES
  ('create_projects', 'Permite crearea proiectelor', 'projects', 'create'),
  ('edit_projects', 'Permite editarea proiectelor', 'projects', 'update'),
  ('delete_projects', 'Permite ștergerea proiectelor', 'projects', 'delete'),
  ('view_all_projects', 'Permite vizualizarea tuturor proiectelor', 'projects', 'read'),
  ('manage_users', 'Permite gestionarea utilizatorilor', 'users', 'manage'),
  ('manage_inventory', 'Permite gestionarea inventarului', 'inventory', 'manage'),
  ('view_reports', 'Permite vizualizarea rapoartelor', 'reports', 'read'),
  ('create_reports', 'Permite crearea rapoartelor', 'reports', 'create'),
  ('view_budget', 'Permite vizualizarea bugetului', 'budget', 'read'),
  ('manage_budget', 'Permite gestionarea bugetului', 'budget', 'manage'),
  ('view_teams', 'Permite vizualizarea echipelor', 'teams', 'read'),
  ('manage_teams', 'Permite gestionarea echipelor', 'teams', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Inserăm setările implicite ale sistemului
INSERT INTO system_settings (security, email, maintenance, backup)
VALUES (
  '{
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true,
      "maxAge": 90
    },
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "accountLockDuration": 15,
    "twoFactorAuth": {
      "enabled": false,
      "required": false
    }
  }',
  '{
    "sender": "noreply@example.com",
    "enableWelcomeEmail": true,
    "enablePasswordResetEmail": true,
    "enableNotificationEmails": true
  }',
  '{
    "enabled": false,
    "message": "The system is currently under maintenance. Please try again later."
  }',
  '{
    "autoBackup": true,
    "backupFrequency": 24,
    "retentionDays": 30
  }'
)
ON CONFLICT (id) DO NOTHING;

-- Funcție pentru a înregistra acțiunile utilizatorilor
CREATE OR REPLACE FUNCTION log_user_action()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  resource_type TEXT;
  resource_id TEXT;
  details TEXT;
BEGIN
  -- Determinăm tipul acțiunii
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
  END IF;

  -- Determinăm tipul resursei
  resource_type := TG_TABLE_NAME;

  -- Determinăm ID-ul resursei
  IF TG_OP = 'DELETE' THEN
    resource_id := OLD.id::TEXT;
  ELSE
    resource_id := NEW.id::TEXT;
  END IF;

  -- Creăm detaliile
  IF TG_OP = 'INSERT' THEN
    details := 'Created ' || resource_type || ' with ID ' || resource_id;
  ELSIF TG_OP = 'UPDATE' THEN
    details := 'Updated ' || resource_type || ' with ID ' || resource_id;
  ELSIF TG_OP = 'DELETE' THEN
    details := 'Deleted ' || resource_type || ' with ID ' || resource_id;
  END IF;

  -- Inserăm jurnalul
  INSERT INTO user_logs (user_id, action, resource, resource_id, details)
  VALUES (auth.uid(), action_type, resource_type, resource_id, details);

  -- Returnăm valoarea corespunzătoare
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adăugăm triggere pentru a înregistra acțiunile pe tabelele importante
CREATE TRIGGER log_projects_changes
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER log_materials_changes
AFTER INSERT OR UPDATE OR DELETE ON materials
FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER log_user_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER log_suppliers_changes
AFTER INSERT OR UPDATE OR DELETE ON suppliers
FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER log_teams_changes
AFTER INSERT OR UPDATE OR DELETE ON teams
FOR EACH ROW EXECUTE FUNCTION log_user_action();

-- Adăugăm o funcție pentru a obține utilizatorii cu rolurile lor
CREATE OR REPLACE FUNCTION get_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    p.display_name,
    r.role,
    u.created_at,
    u.last_sign_in_at
  FROM
    auth.users u
  LEFT JOIN
    profiles p ON u.id = p.id
  LEFT JOIN
    user_roles r ON u.id = r.user_id
  ORDER BY
    u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
