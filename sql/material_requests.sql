-- Tabel pentru cereri de materiale
CREATE TABLE IF NOT EXISTS material_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  needed_by_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tabel pentru elementele cererii de materiale
CREATE TABLE IF NOT EXISTS material_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  approved_quantity NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tabel pentru aprobări cereri
CREATE TABLE IF NOT EXISTS material_request_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS material_requests_project_id_idx ON material_requests(project_id);
CREATE INDEX IF NOT EXISTS material_requests_requester_id_idx ON material_requests(requester_id);
CREATE INDEX IF NOT EXISTS material_requests_status_idx ON material_requests(status);
CREATE INDEX IF NOT EXISTS material_requests_created_at_idx ON material_requests(created_at);

CREATE INDEX IF NOT EXISTS material_request_items_request_id_idx ON material_request_items(request_id);
CREATE INDEX IF NOT EXISTS material_request_items_material_id_idx ON material_request_items(material_id);

CREATE INDEX IF NOT EXISTS material_request_approvals_request_id_idx ON material_request_approvals(request_id);
CREATE INDEX IF NOT EXISTS material_request_approvals_approver_id_idx ON material_request_approvals(approver_id);

-- Trigger pentru actualizarea câmpului updated_at pentru cereri
CREATE OR REPLACE FUNCTION update_material_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_requests_updated_at
BEFORE UPDATE ON material_requests
FOR EACH ROW
EXECUTE FUNCTION update_material_requests_updated_at();

-- Trigger pentru actualizarea câmpului updated_at pentru elementele cererii
CREATE OR REPLACE FUNCTION update_material_request_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_request_items_updated_at
BEFORE UPDATE ON material_request_items
FOR EACH ROW
EXECUTE FUNCTION update_material_request_items_updated_at();

-- Funcție pentru crearea unei cereri de materiale
CREATE OR REPLACE FUNCTION create_material_request(
  p_project_id UUID,
  p_priority TEXT DEFAULT 'medium',
  p_needed_by_date DATE DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_request_id UUID;
  v_item JSONB;
  v_material_id UUID;
  v_quantity NUMERIC;
  v_item_notes TEXT;
BEGIN
  -- Verificăm dacă proiectul există
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Project with ID % does not exist', p_project_id;
  END IF;
  
  -- Verificăm dacă prioritatea este validă
  IF p_priority IS NOT NULL AND p_priority NOT IN ('low', 'medium', 'high', 'urgent') THEN
    RAISE EXCEPTION 'Invalid priority: %', p_priority;
  END IF;
  
  -- Verificăm dacă există cel puțin un element
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one item is required';
  END IF;
  
  -- Inserăm cererea
  INSERT INTO material_requests (
    project_id,
    requester_id,
    status,
    priority,
    needed_by_date,
    notes
  )
  VALUES (
    p_project_id,
    auth.uid(),
    'pending',
    p_priority,
    p_needed_by_date,
    p_notes
  )
  RETURNING id INTO v_request_id;
  
  -- Inserăm elementele cererii
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_material_id := (v_item->>'material_id')::UUID;
    v_quantity := (v_item->>'quantity')::NUMERIC;
    v_item_notes := v_item->>'notes';
    
    -- Verificăm dacă materialul există
    IF NOT EXISTS (SELECT 1 FROM materials WHERE id = v_material_id) THEN
      RAISE EXCEPTION 'Material with ID % does not exist', v_material_id;
    END IF;
    
    -- Verificăm dacă cantitatea este pozitivă
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be positive';
    END IF;
    
    -- Inserăm elementul
    INSERT INTO material_request_items (
      request_id,
      material_id,
      quantity,
      notes
    )
    VALUES (
      v_request_id,
      v_material_id,
      v_quantity,
      v_item_notes
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'id', v_request_id,
    'project_id', p_project_id,
    'requester_id', auth.uid(),
    'status', 'pending',
    'priority', p_priority,
    'needed_by_date', p_needed_by_date,
    'notes', p_notes,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru aprobarea/respingerea unei cereri de materiale
CREATE OR REPLACE FUNCTION approve_material_request(
  p_request_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL,
  p_items JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_request material_requests;
  v_approval_id UUID;
  v_item JSONB;
  v_item_id UUID;
  v_approved_quantity NUMERIC;
BEGIN
  -- Verificăm dacă cererea există
  SELECT * INTO v_request FROM material_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request with ID % does not exist', p_request_id;
  END IF;
  
  -- Verificăm dacă statusul este valid
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;
  
  -- Verificăm dacă cererea este în starea 'pending'
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is not in pending state';
  END IF;
  
  -- Inserăm aprobarea
  INSERT INTO material_request_approvals (
    request_id,
    approver_id,
    status,
    notes
  )
  VALUES (
    p_request_id,
    auth.uid(),
    p_status,
    p_notes
  )
  RETURNING id INTO v_approval_id;
  
  -- Actualizăm statusul cererii
  UPDATE material_requests
  SET status = p_status
  WHERE id = p_request_id;
  
  -- Dacă cererea este aprobată și sunt furnizate cantitățile aprobate
  IF p_status = 'approved' AND p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    -- Actualizăm cantitățile aprobate pentru fiecare element
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_item_id := (v_item->>'id')::UUID;
      v_approved_quantity := (v_item->>'approved_quantity')::NUMERIC;
      
      -- Verificăm dacă elementul există
      IF NOT EXISTS (SELECT 1 FROM material_request_items WHERE id = v_item_id AND request_id = p_request_id) THEN
        RAISE EXCEPTION 'Item with ID % does not exist in request %', v_item_id, p_request_id;
      END IF;
      
      -- Verificăm dacă cantitatea aprobată este pozitivă
      IF v_approved_quantity < 0 THEN
        RAISE EXCEPTION 'Approved quantity must be non-negative';
      END IF;
      
      -- Actualizăm cantitatea aprobată
      UPDATE material_request_items
      SET approved_quantity = v_approved_quantity
      WHERE id = v_item_id;
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'id', v_approval_id,
    'request_id', p_request_id,
    'approver_id', auth.uid(),
    'status', p_status,
    'notes', p_notes,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru obținerea statisticilor cererilor de materiale
CREATE OR REPLACE FUNCTION get_material_request_stats(
  p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  status TEXT,
  total_requests BIGINT,
  total_items BIGINT,
  total_quantity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mr.status,
    COUNT(DISTINCT mr.id) AS total_requests,
    COUNT(mri.id) AS total_items,
    SUM(mri.quantity) AS total_quantity
  FROM
    material_requests mr
    LEFT JOIN material_request_items mri ON mr.id = mri.request_id
  WHERE
    (p_project_id IS NULL OR mr.project_id = p_project_id)
  GROUP BY
    mr.status
  ORDER BY
    mr.status;
END;
$$ LANGUAGE plpgsql;

-- Politici RLS pentru cereri de materiale
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_request_approvals ENABLE ROW LEVEL SECURITY;

-- Politici pentru cereri de materiale
-- Politică pentru vizualizare
CREATE POLICY material_requests_select_policy ON material_requests
FOR SELECT
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  requester_id = auth.uid()
  OR
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

-- Politică pentru inserare
CREATE POLICY material_requests_insert_policy ON material_requests
FOR INSERT
WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager', 'user')
  AND
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

-- Politică pentru actualizare
CREATE POLICY material_requests_update_policy ON material_requests
FOR UPDATE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    requester_id = auth.uid()
    AND status = 'pending'
  )
);

-- Politică pentru ștergere
CREATE POLICY material_requests_delete_policy ON material_requests
FOR DELETE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    requester_id = auth.uid()
    AND status = 'pending'
    AND created_at > NOW() - INTERVAL '24 hours'
  )
);

-- Politici pentru elementele cererii de materiale
-- Politică pentru vizualizare
CREATE POLICY material_request_items_select_policy ON material_request_items
FOR SELECT
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  request_id IN (
    SELECT id FROM material_requests WHERE requester_id = auth.uid()
  )
  OR
  request_id IN (
    SELECT mr.id FROM material_requests mr
    JOIN project_members pm ON mr.project_id = pm.project_id
    WHERE pm.user_id = auth.uid()
  )
);

-- Politică pentru inserare
CREATE POLICY material_request_items_insert_policy ON material_request_items
FOR INSERT
WITH CHECK (
  request_id IN (
    SELECT id FROM material_requests WHERE requester_id = auth.uid() AND status = 'pending'
  )
);

-- Politică pentru actualizare
CREATE POLICY material_request_items_update_policy ON material_request_items
FOR UPDATE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  request_id IN (
    SELECT id FROM material_requests WHERE requester_id = auth.uid() AND status = 'pending'
  )
);

-- Politică pentru ștergere
CREATE POLICY material_request_items_delete_policy ON material_request_items
FOR DELETE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  request_id IN (
    SELECT id FROM material_requests WHERE requester_id = auth.uid() AND status = 'pending'
  )
);

-- Politici pentru aprobări cereri
-- Politică pentru vizualizare
CREATE POLICY material_request_approvals_select_policy ON material_request_approvals
FOR SELECT
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  request_id IN (
    SELECT id FROM material_requests WHERE requester_id = auth.uid()
  )
  OR
  request_id IN (
    SELECT mr.id FROM material_requests mr
    JOIN project_members pm ON mr.project_id = pm.project_id
    WHERE pm.user_id = auth.uid()
  )
);

-- Politică pentru inserare
CREATE POLICY material_request_approvals_insert_policy ON material_request_approvals
FOR INSERT
WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);
