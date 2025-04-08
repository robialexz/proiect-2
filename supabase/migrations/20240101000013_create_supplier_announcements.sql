-- Create supplier_announcements table
CREATE TABLE IF NOT EXISTS public.supplier_announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  message text,
  contact_info text,
  quantity integer,
  unit text,
  material_name text,
  price numeric(10, 2)
);

-- Enable RLS
ALTER TABLE public.supplier_announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all supplier announcements"
  ON public.supplier_announcements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert supplier announcements"
  ON public.supplier_announcements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update supplier announcements"
  ON public.supplier_announcements FOR UPDATE
  USING (true);

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER on_supplier_announcements_updated
  BEFORE UPDATE ON public.supplier_announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data
INSERT INTO public.supplier_announcements (supplier_name, status, project_id, message, material_name, quantity, unit, price)
SELECT 
  'Sample Supplier ' || i, 
  CASE 
    WHEN i % 3 = 0 THEN 'pending'
    WHEN i % 3 = 1 THEN 'confirmed'
    ELSE 'rejected'
  END,
  (SELECT id FROM public.projects ORDER BY created_at DESC LIMIT 1),
  'Sample announcement message ' || i,
  'Material ' || i,
  i * 10,
  'pcs',
  i * 100
FROM generate_series(1, 5) AS i
ON CONFLICT DO NOTHING;
