-- Tabel pentru coduri QR
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('material', 'equipment', 'pallet', 'location')),
  reference_id UUID NOT NULL,
  data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS qr_codes_code_idx ON qr_codes(code);
CREATE INDEX IF NOT EXISTS qr_codes_type_idx ON qr_codes(type);
CREATE INDEX IF NOT EXISTS qr_codes_reference_id_idx ON qr_codes(reference_id);
CREATE INDEX IF NOT EXISTS qr_codes_created_at_idx ON qr_codes(created_at);

-- Trigger pentru actualizarea câmpului updated_at
CREATE OR REPLACE FUNCTION update_qr_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON qr_codes
FOR EACH ROW
EXECUTE FUNCTION update_qr_codes_updated_at();

-- Funcție pentru generarea unui cod QR unic
CREATE OR REPLACE FUNCTION generate_unique_qr_code(
  p_type TEXT,
  p_prefix TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_prefix TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Stabilim prefixul
  IF p_prefix IS NULL THEN
    CASE p_type
      WHEN 'material' THEN v_prefix := 'MAT';
      WHEN 'equipment' THEN v_prefix := 'EQP';
      WHEN 'pallet' THEN v_prefix := 'PAL';
      WHEN 'location' THEN v_prefix := 'LOC';
      ELSE v_prefix := 'QR';
    END CASE;
  ELSE
    v_prefix := p_prefix;
  END IF;
  
  -- Generăm un cod unic
  LOOP
    -- Generăm un cod aleatoriu
    v_code := v_prefix || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    -- Verificăm dacă codul există deja
    SELECT EXISTS (
      SELECT 1 FROM qr_codes WHERE code = v_code
    ) INTO v_exists;
    
    -- Dacă codul nu există, ieșim din buclă
    IF NOT v_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru scanarea unui cod QR
CREATE OR REPLACE FUNCTION scan_qr_code(
  p_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_qr_code qr_codes;
  v_reference_name TEXT;
  v_reference_type TEXT;
BEGIN
  -- Verificăm dacă codul QR există
  SELECT * INTO v_qr_code FROM qr_codes WHERE code = p_code;
  
  IF v_qr_code IS NULL THEN
    RETURN jsonb_build_object(
      'found', FALSE,
      'code', p_code,
      'error', 'QR code not found'
    );
  END IF;
  
  -- Obținem informații despre referință
  CASE v_qr_code.type
    WHEN 'material' THEN
      SELECT name INTO v_reference_name FROM materials WHERE id = v_qr_code.reference_id;
      v_reference_type := 'Material';
    WHEN 'equipment' THEN
      SELECT name INTO v_reference_name FROM equipment WHERE id = v_qr_code.reference_id;
      v_reference_type := 'Equipment';
    WHEN 'pallet' THEN
      SELECT code INTO v_reference_name FROM pallets WHERE id = v_qr_code.reference_id;
      v_reference_name := 'Pallet ' || v_reference_name;
      v_reference_type := 'Pallet';
    WHEN 'location' THEN
      SELECT name INTO v_reference_name FROM locations WHERE id = v_qr_code.reference_id;
      v_reference_type := 'Location';
    ELSE
      v_reference_name := 'Unknown';
      v_reference_type := 'Unknown';
  END CASE;
  
  -- Returnăm rezultatul
  RETURN jsonb_build_object(
    'found', TRUE,
    'code', p_code,
    'qr_code', jsonb_build_object(
      'id', v_qr_code.id,
      'code', v_qr_code.code,
      'type', v_qr_code.type,
      'reference_id', v_qr_code.reference_id,
      'data', v_qr_code.data,
      'created_at', v_qr_code.created_at,
      'updated_at', v_qr_code.updated_at,
      'reference_name', v_reference_name,
      'reference_type', v_reference_type
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Politici RLS pentru coduri QR
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Politică pentru vizualizare
CREATE POLICY qr_codes_select_policy ON qr_codes
FOR SELECT
USING (TRUE);

-- Politică pentru inserare
CREATE POLICY qr_codes_insert_policy ON qr_codes
FOR INSERT
WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    (
      (type = 'material' AND reference_id IN (SELECT id FROM materials))
      OR
      (type = 'equipment' AND reference_id IN (SELECT id FROM equipment))
      OR
      (type = 'pallet' AND reference_id IN (SELECT id FROM pallets))
      OR
      (type = 'location' AND reference_id IN (SELECT id FROM locations))
    )
  )
);

-- Politică pentru actualizare
CREATE POLICY qr_codes_update_policy ON qr_codes
FOR UPDATE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

-- Politică pentru ștergere
CREATE POLICY qr_codes_delete_policy ON qr_codes
FOR DELETE
USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);
