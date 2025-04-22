-- Script pentru crearea tabelelor necesare pentru gestionarea operațiunilor de materiale

-- Tabel pentru operațiuni de materiale (recepție, consum, retururi)
CREATE TABLE IF NOT EXISTS public.material_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  operation_type VARCHAR NOT NULL CHECK (operation_type IN ('reception', 'consumption', 'return')),
  quantity NUMERIC(12, 2) NOT NULL,
  unit_price NUMERIC(12, 2),
  location VARCHAR,
  notes TEXT,
  qr_code VARCHAR,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel pentru cereri interne de materiale
CREATE TABLE IF NOT EXISTS public.material_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users(id),
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  needed_by_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel pentru elementele cererii de materiale
CREATE TABLE IF NOT EXISTS public.material_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.material_requests(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity NUMERIC(12, 2) NOT NULL,
  approved_quantity NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel pentru aprobări cereri
CREATE TABLE IF NOT EXISTS public.material_request_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.material_requests(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  status VARCHAR NOT NULL CHECK (status IN ('approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel pentru coduri QR
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR NOT NULL UNIQUE,
  type VARCHAR NOT NULL CHECK (type IN ('material', 'equipment', 'pallet', 'location')),
  reference_id UUID NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel pentru alerte de stoc
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  alert_type VARCHAR NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring')),
  threshold NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adăugare politici RLS pentru securitate
ALTER TABLE public.material_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- Politici pentru material_operations
CREATE POLICY "Users can view material operations for their projects" 
  ON public.material_operations FOR SELECT 
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid() OR manager_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can create material operations for their projects" 
  ON public.material_operations FOR INSERT 
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid() OR manager_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politici pentru material_requests
CREATE POLICY "Users can view material requests for their projects" 
  ON public.material_requests FOR SELECT 
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid() OR manager_id = auth.uid()
    )
    OR requester_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can create material requests" 
  ON public.material_requests FOR INSERT 
  WITH CHECK (
    requester_id = auth.uid()
  );

-- Politici pentru material_request_items
CREATE POLICY "Users can view material request items for their requests" 
  ON public.material_request_items FOR SELECT 
  USING (
    request_id IN (
      SELECT id FROM public.material_requests 
      WHERE requester_id = auth.uid()
      OR project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid() OR manager_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politici pentru material_request_approvals
CREATE POLICY "Users can view material request approvals for their requests" 
  ON public.material_request_approvals FOR SELECT 
  USING (
    request_id IN (
      SELECT id FROM public.material_requests 
      WHERE requester_id = auth.uid()
      OR project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid() OR manager_id = auth.uid()
      )
    )
    OR approver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politici pentru qr_codes
CREATE POLICY "Users can view QR codes" 
  ON public.qr_codes FOR SELECT 
  USING (
    true
  );

-- Politici pentru stock_alerts
CREATE POLICY "Users can view stock alerts for their projects" 
  ON public.stock_alerts FOR SELECT 
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid() OR manager_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Adăugare indecși pentru performanță
CREATE INDEX IF NOT EXISTS idx_material_operations_material_id ON public.material_operations(material_id);
CREATE INDEX IF NOT EXISTS idx_material_operations_project_id ON public.material_operations(project_id);
CREATE INDEX IF NOT EXISTS idx_material_operations_operation_type ON public.material_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_material_requests_project_id ON public.material_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_requester_id ON public.material_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON public.material_requests(status);
CREATE INDEX IF NOT EXISTS idx_material_request_items_request_id ON public.material_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_material_request_items_material_id ON public.material_request_items(material_id);
CREATE INDEX IF NOT EXISTS idx_material_request_approvals_request_id ON public.material_request_approvals(request_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_reference_id ON public.qr_codes(reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_material_id ON public.stock_alerts(material_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_project_id ON public.stock_alerts(project_id);
