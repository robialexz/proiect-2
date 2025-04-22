-- Tabel pentru alerte de stoc
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring')),
  threshold NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS stock_alerts_material_id_idx ON stock_alerts(material_id);
CREATE INDEX IF NOT EXISTS stock_alerts_project_id_idx ON stock_alerts(project_id);
CREATE INDEX IF NOT EXISTS stock_alerts_alert_type_idx ON stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS stock_alerts_is_active_idx ON stock_alerts(is_active);
CREATE INDEX IF NOT EXISTS stock_alerts_created_at_idx ON stock_alerts(created_at);

-- Trigger pentru actualizarea câmpului updated_at
CREATE OR REPLACE FUNCTION update_stock_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_alerts_updated_at
BEFORE UPDATE ON stock_alerts
FOR EACH ROW
EXECUTE FUNCTION update_stock_alerts_updated_at();

-- Funcție pentru verificarea alertelor de stoc
CREATE OR REPLACE FUNCTION check_stock_alerts(
  p_material_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_triggered_alerts JSONB := '[]'::JSONB;
  v_alert RECORD;
  v_material RECORD;
  v_is_triggered BOOLEAN;
BEGIN
  -- Obținem alertele active
  FOR v_alert IN
    SELECT
      sa.*,
      m.name AS material_name,
      m.unit AS material_unit,
      m.quantity AS material_quantity,
      p.name AS project_name
    FROM
      stock_alerts sa
      JOIN materials m ON sa.material_id = m.id
      LEFT JOIN projects p ON sa.project_id = p.id
    WHERE
      sa.is_active = TRUE
      AND (p_material_id IS NULL OR sa.material_id = p_material_id)
      AND (p_project_id IS NULL OR sa.project_id = p_project_id)
  LOOP
    -- Verificăm dacă alerta este declanșată
    v_is_triggered := FALSE;
    
    IF v_alert.alert_type = 'low_stock' AND v_alert.threshold IS NOT NULL THEN
      v_is_triggered := v_alert.material_quantity <= v_alert.threshold;
    ELSIF v_alert.alert_type = 'out_of_stock' THEN
      v_is_triggered := v_alert.material_quantity <= 0;
    END IF;
    
    -- Dacă alerta este declanșată, o adăugăm la lista de alerte declanșate
    IF v_is_triggered THEN
      -- Actualizăm data ultimei declanșări
      UPDATE stock_alerts
      SET last_triggered_at = NOW()
      WHERE id = v_alert.id;
      
      -- Adăugăm alerta la lista de alerte declanșate
      v_triggered_alerts := v_triggered_alerts || jsonb_build_object(
        'id', v_alert.id,
        'material_id', v_alert.material_id,
        'project_id', v_alert.project_id,
        'alert_type', v_alert.alert_type,
        'threshold', v_alert.threshold,
        'is_active', v_alert.is_active,
        'last_triggered_at', NOW(),
        'created_at', v_alert.created_at,
        'updated_at', v_alert.updated_at,
        'material_name', v_alert.material_name,
        'material_unit', v_alert.material_unit,
        'material_quantity', v_alert.material_quantity,
        'project_name', v_alert.project_name
      );
    END IF;
  END LOOP;
  
  -- Returnăm rezultatul
  RETURN jsonb_build_object(
    'triggered', jsonb_array_length(v_triggered_alerts) > 0,
    'alerts', v_triggered_alerts
  );
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru crearea alertelor pentru toate materialele dintr-un proiect
CREATE OR REPLACE FUNCTION create_alerts_for_project(
  p_project_id UUID,
  p_threshold_percent INTEGER DEFAULT 20
)
RETURNS JSONB AS $$
DECLARE
  v_material RECORD;
  v_threshold NUMERIC;
  v_created_alerts JSONB := '[]'::JSONB;
  v_alert_id UUID;
BEGIN
  -- Verificăm dacă proiectul există
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Project with ID % does not exist', p_project_id;
  END IF;
  
  -- Verificăm dacă procentul este valid
  IF p_threshold_percent <= 0 OR p_threshold_percent >= 100 THEN
    RAISE EXCEPTION 'Threshold percent must be between 1 and 99';
  END IF;
  
  -- Creăm alerte pentru toate materialele din proiect
  FOR v_material IN
    SELECT id, max_stock_level
    FROM materials
    WHERE project_id = p_project_id
    AND max_stock_level IS NOT NULL
  LOOP
    -- Calculăm pragul
    v_threshold := ROUND((v_material.max_stock_level * p_threshold_percent) / 100);
    
    -- Inserăm alerta
    INSERT INTO stock_alerts (
      material_id,
      project_id,
      alert_type,
      threshold,
      is_active
    )
    VALUES (
      v_material.id,
      p_project_id,
      'low_stock',
      v_threshold,
      TRUE
    )
    RETURNING id INTO v_alert_id;
    
    -- Adăugăm alerta la lista de alerte create
    v_created_alerts := v_created_alerts || jsonb_build_object(
      'id', v_alert_id,
      'material_id', v_material.id,
      'project_id', p_project_id,
      'alert_type', 'low_stock',
      'threshold', v_threshold,
      'is_active', TRUE,
      'created_at', NOW()
    );
  END LOOP;
  
  -- Returnăm rezultatul
  RETURN v_created_alerts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politici RLS pentru alerte de stoc
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Politică pentru vizualizare
CREATE POLICY stock_alerts_select_policy ON stock_alerts
FOR SELECT
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    (
      project_id IS NULL
      OR
      project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  )
);

-- Politică pentru inserare
CREATE POLICY stock_alerts_insert_policy ON stock_alerts
FOR INSERT
WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    (
      project_id IS NULL
      OR
      project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  )
);

-- Politică pentru actualizare
CREATE POLICY stock_alerts_update_policy ON stock_alerts
FOR UPDATE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    (
      project_id IS NULL
      OR
      project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  )
);

-- Politică pentru ștergere
CREATE POLICY stock_alerts_delete_policy ON stock_alerts
FOR DELETE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    (
      project_id IS NULL
      OR
      project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  )
);
