-- Tabel pentru furnizori
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  category TEXT,
  notes TEXT,
  rating NUMERIC(3, 1) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tabel pentru materiale furnizate
CREATE TABLE IF NOT EXISTS supplier_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  unit_price NUMERIC(12, 2),
  min_order_quantity NUMERIC(12, 2),
  lead_time_days INTEGER,
  notes TEXT,
  is_preferred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(supplier_id, material_id)
);

-- Tabel pentru comenzi către furnizori
CREATE TABLE IF NOT EXISTS supplier_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  order_number TEXT,
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_delivery_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(12, 2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tabel pentru elementele comenzii
CREATE TABLE IF NOT EXISTS supplier_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity NUMERIC(12, 2) NOT NULL,
  unit_price NUMERIC(12, 2),
  total_price NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS suppliers_name_idx ON suppliers(name);
CREATE INDEX IF NOT EXISTS suppliers_status_idx ON suppliers(status);
CREATE INDEX IF NOT EXISTS supplier_materials_supplier_id_idx ON supplier_materials(supplier_id);
CREATE INDEX IF NOT EXISTS supplier_materials_material_id_idx ON supplier_materials(material_id);
CREATE INDEX IF NOT EXISTS supplier_orders_supplier_id_idx ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS supplier_orders_project_id_idx ON supplier_orders(project_id);
CREATE INDEX IF NOT EXISTS supplier_orders_status_idx ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS supplier_order_items_order_id_idx ON supplier_order_items(order_id);
CREATE INDEX IF NOT EXISTS supplier_order_items_material_id_idx ON supplier_order_items(material_id);

-- Trigger pentru actualizarea câmpului updated_at pentru furnizori
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_suppliers_updated_at();

-- Trigger pentru actualizarea câmpului updated_at pentru materiale furnizate
CREATE OR REPLACE FUNCTION update_supplier_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supplier_materials_updated_at
BEFORE UPDATE ON supplier_materials
FOR EACH ROW
EXECUTE FUNCTION update_supplier_materials_updated_at();

-- Trigger pentru actualizarea câmpului updated_at pentru comenzi
CREATE OR REPLACE FUNCTION update_supplier_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supplier_orders_updated_at
BEFORE UPDATE ON supplier_orders
FOR EACH ROW
EXECUTE FUNCTION update_supplier_orders_updated_at();

-- Trigger pentru actualizarea câmpului updated_at pentru elementele comenzii
CREATE OR REPLACE FUNCTION update_supplier_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supplier_order_items_updated_at
BEFORE UPDATE ON supplier_order_items
FOR EACH ROW
EXECUTE FUNCTION update_supplier_order_items_updated_at();

-- Trigger pentru calcularea prețului total al elementului comenzii
CREATE OR REPLACE FUNCTION calculate_order_item_total_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_order_item_total_price
BEFORE INSERT OR UPDATE ON supplier_order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_item_total_price();

-- Trigger pentru actualizarea sumei totale a comenzii
CREATE OR REPLACE FUNCTION update_order_total_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE supplier_orders
  SET total_amount = (
    SELECT SUM(total_price)
    FROM supplier_order_items
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total_amount
AFTER INSERT OR UPDATE OR DELETE ON supplier_order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total_amount();

-- Funcție pentru obținerea ultimei comenzi pentru un furnizor
CREATE OR REPLACE FUNCTION get_supplier_last_order(p_supplier_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_last_order JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', so.id,
    'order_number', so.order_number,
    'order_date', so.order_date,
    'status', so.status,
    'total_amount', so.total_amount
  ) INTO v_last_order
  FROM supplier_orders so
  WHERE so.supplier_id = p_supplier_id
  ORDER BY so.order_date DESC
  LIMIT 1;
  
  RETURN v_last_order;
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru obținerea numărului de materiale pentru un furnizor
CREATE OR REPLACE FUNCTION get_supplier_materials_count(p_supplier_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM supplier_materials
  WHERE supplier_id = p_supplier_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru obținerea furnizorilor cu detalii suplimentare
CREATE OR REPLACE FUNCTION get_suppliers_with_details()
RETURNS TABLE (
  id UUID,
  name TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  category TEXT,
  notes TEXT,
  rating NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_order JSONB,
  materials_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.contact_person,
    s.email,
    s.phone,
    s.address,
    s.website,
    s.category,
    s.notes,
    s.rating,
    s.status,
    s.created_at,
    s.updated_at,
    get_supplier_last_order(s.id) AS last_order,
    get_supplier_materials_count(s.id) AS materials_count
  FROM
    suppliers s
  ORDER BY
    s.name;
END;
$$ LANGUAGE plpgsql;

-- Politici RLS pentru furnizori
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_order_items ENABLE ROW LEVEL SECURITY;

-- Politici pentru furnizori
CREATE POLICY suppliers_select_policy ON suppliers
FOR SELECT USING (TRUE);

CREATE POLICY suppliers_insert_policy ON suppliers
FOR INSERT WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY suppliers_update_policy ON suppliers
FOR UPDATE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY suppliers_delete_policy ON suppliers
FOR DELETE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

-- Politici pentru materiale furnizate
CREATE POLICY supplier_materials_select_policy ON supplier_materials
FOR SELECT USING (TRUE);

CREATE POLICY supplier_materials_insert_policy ON supplier_materials
FOR INSERT WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY supplier_materials_update_policy ON supplier_materials
FOR UPDATE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY supplier_materials_delete_policy ON supplier_materials
FOR DELETE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
);

-- Politici pentru comenzi
CREATE POLICY supplier_orders_select_policy ON supplier_orders
FOR SELECT USING (TRUE);

CREATE POLICY supplier_orders_insert_policy ON supplier_orders
FOR INSERT WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY supplier_orders_update_policy ON supplier_orders
FOR UPDATE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    created_by = auth.uid()
    AND
    status IN ('pending', 'confirmed')
  )
);

CREATE POLICY supplier_orders_delete_policy ON supplier_orders
FOR DELETE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    created_by = auth.uid()
    AND
    status = 'pending'
  )
);

-- Politici pentru elementele comenzii
CREATE POLICY supplier_order_items_select_policy ON supplier_order_items
FOR SELECT USING (TRUE);

CREATE POLICY supplier_order_items_insert_policy ON supplier_order_items
FOR INSERT WITH CHECK (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    order_id IN (
      SELECT id FROM supplier_orders WHERE created_by = auth.uid() AND status = 'pending'
    )
  )
);

CREATE POLICY supplier_order_items_update_policy ON supplier_order_items
FOR UPDATE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    order_id IN (
      SELECT id FROM supplier_orders WHERE created_by = auth.uid() AND status = 'pending'
    )
  )
);

CREATE POLICY supplier_order_items_delete_policy ON supplier_order_items
FOR DELETE USING (
  (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) IN ('admin', 'manager')
  OR
  (
    (SELECT auth.role() FROM auth.users WHERE auth.uid() = auth.uid()) = 'user'
    AND
    order_id IN (
      SELECT id FROM supplier_orders WHERE created_by = auth.uid() AND status = 'pending'
    )
  )
);
