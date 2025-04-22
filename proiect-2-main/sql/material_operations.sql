-- Tabel pentru operațiuni de materiale
CREATE TABLE IF NOT EXISTS material_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('reception', 'consumption', 'return')),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC,
  location TEXT,
  notes TEXT,
  qr_code TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS material_operations_material_id_idx ON material_operations(material_id);
CREATE INDEX IF NOT EXISTS material_operations_project_id_idx ON material_operations(project_id);
CREATE INDEX IF NOT EXISTS material_operations_operation_type_idx ON material_operations(operation_type);
CREATE INDEX IF NOT EXISTS material_operations_created_at_idx ON material_operations(created_at);

-- Trigger pentru actualizarea câmpului updated_at
CREATE OR REPLACE FUNCTION update_material_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_operations_updated_at
BEFORE UPDATE ON material_operations
FOR EACH ROW
EXECUTE FUNCTION update_material_operations_updated_at();

-- Trigger pentru actualizarea cantității materialului la adăugarea unei operațiuni
CREATE OR REPLACE FUNCTION update_material_quantity_on_operation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.operation_type = 'reception' THEN
    UPDATE materials
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.material_id;
  ELSIF NEW.operation_type = 'consumption' THEN
    UPDATE materials
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.material_id;
  ELSIF NEW.operation_type = 'return' THEN
    UPDATE materials
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.material_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_quantity_on_operation
AFTER INSERT ON material_operations
FOR EACH ROW
EXECUTE FUNCTION update_material_quantity_on_operation();

-- Trigger pentru actualizarea cantității materialului la actualizarea unei operațiuni
CREATE OR REPLACE FUNCTION update_material_quantity_on_operation_update()
RETURNS TRIGGER AS $$
DECLARE
  quantity_diff NUMERIC;
BEGIN
  IF NEW.operation_type = OLD.operation_type AND NEW.material_id = OLD.material_id THEN
    -- Doar cantitatea s-a schimbat
    quantity_diff = NEW.quantity - OLD.quantity;
    
    IF NEW.operation_type = 'reception' OR NEW.operation_type = 'return' THEN
      UPDATE materials
      SET quantity = quantity + quantity_diff
      WHERE id = NEW.material_id;
    ELSIF NEW.operation_type = 'consumption' THEN
      UPDATE materials
      SET quantity = quantity - quantity_diff
      WHERE id = NEW.material_id;
    END IF;
  ELSE
    -- Tipul operațiunii sau materialul s-a schimbat, tratăm ca o ștergere și o adăugare
    -- Mai întâi anulăm efectul vechii operațiuni
    IF OLD.operation_type = 'reception' OR OLD.operation_type = 'return' THEN
      UPDATE materials
      SET quantity = quantity - OLD.quantity
      WHERE id = OLD.material_id;
    ELSIF OLD.operation_type = 'consumption' THEN
      UPDATE materials
      SET quantity = quantity + OLD.quantity
      WHERE id = OLD.material_id;
    END IF;
    
    -- Apoi aplicăm efectul noii operațiuni
    IF NEW.operation_type = 'reception' OR NEW.operation_type = 'return' THEN
      UPDATE materials
      SET quantity = quantity + NEW.quantity
      WHERE id = NEW.material_id;
    ELSIF NEW.operation_type = 'consumption' THEN
      UPDATE materials
      SET quantity = quantity - NEW.quantity
      WHERE id = NEW.material_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_quantity_on_operation_update
AFTER UPDATE ON material_operations
FOR EACH ROW
EXECUTE FUNCTION update_material_quantity_on_operation_update();

-- Trigger pentru actualizarea cantității materialului la ștergerea unei operațiuni
CREATE OR REPLACE FUNCTION update_material_quantity_on_operation_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.operation_type = 'reception' OR OLD.operation_type = 'return' THEN
    UPDATE materials
    SET quantity = quantity - OLD.quantity
    WHERE id = OLD.material_id;
  ELSIF OLD.operation_type = 'consumption' THEN
    UPDATE materials
    SET quantity = quantity + OLD.quantity
    WHERE id = OLD.material_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_quantity_on_operation_delete
AFTER DELETE ON material_operations
FOR EACH ROW
EXECUTE FUNCTION update_material_quantity_on_operation_delete();

-- Funcție pentru crearea unei operațiuni de materiale
CREATE OR REPLACE FUNCTION create_material_operation(
  p_material_id UUID,
  p_project_id UUID,
  p_operation_type TEXT,
  p_quantity NUMERIC,
  p_unit_price NUMERIC DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_qr_code TEXT DEFAULT NULL
)
RETURNS material_operations AS $$
DECLARE
  v_operation material_operations;
BEGIN
  -- Verificăm dacă materialul există
  IF NOT EXISTS (SELECT 1 FROM materials WHERE id = p_material_id) THEN
    RAISE EXCEPTION 'Material with ID % does not exist', p_material_id;
  END IF;
  
  -- Verificăm dacă proiectul există (dacă este furnizat)
  IF p_project_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Project with ID % does not exist', p_project_id;
  END IF;
  
  -- Verificăm dacă tipul operațiunii este valid
  IF p_operation_type NOT IN ('reception', 'consumption', 'return') THEN
    RAISE EXCEPTION 'Invalid operation type: %', p_operation_type;
  END IF;
  
  -- Verificăm dacă cantitatea este pozitivă
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;
  
  -- Verificăm dacă există suficient stoc pentru consum
  IF p_operation_type = 'consumption' THEN
    IF NOT EXISTS (
      SELECT 1 FROM materials 
      WHERE id = p_material_id AND quantity >= p_quantity
    ) THEN
      RAISE EXCEPTION 'Insufficient stock for material with ID %', p_material_id;
    END IF;
  END IF;
  
  -- Inserăm operațiunea
  INSERT INTO material_operations (
    material_id,
    project_id,
    operation_type,
    quantity,
    unit_price,
    location,
    notes,
    qr_code,
    created_by
  )
  VALUES (
    p_material_id,
    p_project_id,
    p_operation_type,
    p_quantity,
    p_unit_price,
    p_location,
    p_notes,
    p_qr_code,
    auth.uid()
  )
  RETURNING * INTO v_operation;
  
  RETURN v_operation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru actualizarea unei operațiuni de materiale
CREATE OR REPLACE FUNCTION update_material_operation(
  p_operation_id UUID,
  p_quantity NUMERIC DEFAULT NULL,
  p_unit_price NUMERIC DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_qr_code TEXT DEFAULT NULL
)
RETURNS material_operations AS $$
DECLARE
  v_operation material_operations;
  v_old_operation material_operations;
BEGIN
  -- Verificăm dacă operațiunea există
  SELECT * INTO v_old_operation FROM material_operations WHERE id = p_operation_id;
  
  IF v_old_operation IS NULL THEN
    RAISE EXCEPTION 'Operation with ID % does not exist', p_operation_id;
  END IF;
  
  -- Verificăm dacă cantitatea este pozitivă (dacă este furnizată)
  IF p_quantity IS NOT NULL AND p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;
  
  -- Verificăm dacă există suficient stoc pentru consum (dacă cantitatea este mărită)
  IF v_old_operation.operation_type = 'consumption' AND p_quantity > v_old_operation.quantity THEN
    IF NOT EXISTS (
      SELECT 1 FROM materials 
      WHERE id = v_old_operation.material_id AND quantity >= (p_quantity - v_old_operation.quantity)
    ) THEN
      RAISE EXCEPTION 'Insufficient stock for material with ID %', v_old_operation.material_id;
    END IF;
  END IF;
  
  -- Actualizăm operațiunea
  UPDATE material_operations
  SET
    quantity = COALESCE(p_quantity, quantity),
    unit_price = COALESCE(p_unit_price, unit_price),
    location = COALESCE(p_location, location),
    notes = COALESCE(p_notes, notes),
    qr_code = COALESCE(p_qr_code, qr_code),
    updated_at = NOW()
  WHERE id = p_operation_id
  RETURNING * INTO v_operation;
  
  RETURN v_operation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru ștergerea unei operațiuni de materiale
CREATE OR REPLACE FUNCTION delete_material_operation(
  p_operation_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_operation material_operations;
BEGIN
  -- Verificăm dacă operațiunea există
  SELECT * INTO v_operation FROM material_operations WHERE id = p_operation_id;
  
  IF v_operation IS NULL THEN
    RAISE EXCEPTION 'Operation with ID % does not exist', p_operation_id;
  END IF;
  
  -- Ștergem operațiunea
  DELETE FROM material_operations WHERE id = p_operation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru obținerea statisticilor operațiunilor de materiale
CREATE OR REPLACE FUNCTION get_material_operation_stats(
  p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  operation_type TEXT,
  total_operations BIGINT,
  total_quantity NUMERIC,
  total_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mo.operation_type,
    COUNT(mo.id) AS total_operations,
    SUM(mo.quantity) AS total_quantity,
    SUM(mo.quantity * COALESCE(mo.unit_price, 0)) AS total_value
  FROM
    material_operations mo
  WHERE
    (p_project_id IS NULL OR mo.project_id = p_project_id)
  GROUP BY
    mo.operation_type
  ORDER BY
    mo.operation_type;
END;
$$ LANGUAGE plpgsql;

-- Politici RLS pentru operațiuni de materiale
ALTER TABLE material_operations ENABLE ROW LEVEL SECURITY;

-- Politică pentru vizualizare
CREATE POLICY material_operations_select_policy ON material_operations
FOR SELECT
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
);

-- Politică pentru inserare
CREATE POLICY material_operations_insert_policy ON material_operations
FOR INSERT
WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    (
      operation_type = 'consumption'
      OR
      (
        project_id IN (
          SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
      )
    )
  )
);

-- Politică pentru actualizare
CREATE POLICY material_operations_update_policy ON material_operations
FOR UPDATE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND created_by = auth.uid()
    AND created_at > NOW() - INTERVAL '24 hours'
  )
);

-- Politică pentru ștergere
CREATE POLICY material_operations_delete_policy ON material_operations
FOR DELETE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND created_by = auth.uid()
    AND created_at > NOW() - INTERVAL '1 hour'
  )
);
