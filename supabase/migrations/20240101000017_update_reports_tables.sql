-- Add additional fields to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS report_type text,
ADD COLUMN IF NOT EXISTS auto_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS materials_data jsonb,
ADD COLUMN IF NOT EXISTS delivery_data jsonb,
ADD COLUMN IF NOT EXISTS purchase_data jsonb,
ADD COLUMN IF NOT EXISTS project_status text;

-- Create a new table for report_materials to track materials in reports
CREATE TABLE IF NOT EXISTS public.report_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  material_id uuid REFERENCES public.materials(id) ON DELETE SET NULL,
  material_name text NOT NULL,
  quantity_used numeric,
  quantity_remaining numeric,
  last_delivery_date timestamptz,
  next_delivery_date timestamptz,
  supplier_name text,
  purchase_date timestamptz,
  purchase_price numeric(10, 2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.report_materials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all report materials"
  ON public.report_materials FOR SELECT
  USING (true);

CREATE POLICY "Users can insert report materials"
  ON public.report_materials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update report materials"
  ON public.report_materials FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete report materials"
  ON public.report_materials FOR DELETE
  USING (true);

-- Create a function to generate automatic reports
CREATE OR REPLACE FUNCTION public.generate_project_report(project_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_report_id uuid;
  project_record record;
  report_data jsonb;
  materials_data jsonb = '[]'::jsonb;
  material_record record;
BEGIN
  -- Get project information
  SELECT * INTO project_record FROM public.projects WHERE id = project_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project with ID % not found', project_id_param;
  END IF;
  
  -- Create report data structure
  report_data = jsonb_build_object(
    'project_name', project_record.name,
    'project_description', project_record.description,
    'project_status', project_record.status,
    'generation_date', now(),
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Project Overview',
        'type', 'text',
        'content', 'This is an automatically generated report for project: ' || project_record.name
      ),
      jsonb_build_object(
        'title', 'Project Status',
        'type', 'status',
        'content', project_record.status
      )
    )
  );
  
  -- Gather materials data
  FOR material_record IN 
    SELECT m.*, 
           COALESCE(s.supplier_name, 'Unknown') as supplier_name
    FROM public.materials m
    LEFT JOIN public.supplier_announcements s ON m.supplier_id = s.id::text
    WHERE m.project_id = project_id_param
  LOOP
    materials_data = materials_data || jsonb_build_object(
      'id', material_record.id,
      'name', material_record.name,
      'quantity', material_record.quantity,
      'unit', material_record.unit,
      'supplier', material_record.supplier_name,
      'last_order_date', material_record.last_order_date,
      'cost_per_unit', material_record.cost_per_unit
    );
  END LOOP;
  
  -- Add materials section to report data
  report_data = jsonb_set(
    report_data,
    '{sections}',
    report_data->'sections' || jsonb_build_object(
      'title', 'Materials Overview',
      'type', 'materials',
      'content', materials_data
    )
  );
  
  -- Insert the new report
  INSERT INTO public.reports (
    project_id, 
    name, 
    description, 
    type, 
    status, 
    data, 
    created_by,
    auto_generated,
    report_type,
    generation_date,
    materials_data,
    project_status
  )
  VALUES (
    project_id_param,
    'Automatic Report for ' || project_record.name,
    'Automatically generated report with project status and materials information',
    'project',
    'published',
    report_data,
    (SELECT created_by FROM public.projects WHERE id = project_id_param),
    true,
    'automatic',
    now(),
    materials_data,
    project_record.status
  )
  RETURNING id INTO new_report_id;
  
  -- Insert materials data into report_materials
  FOR material_record IN 
    SELECT m.*, 
           COALESCE(s.supplier_name, 'Unknown') as supplier_name
    FROM public.materials m
    LEFT JOIN public.supplier_announcements s ON m.supplier_id = s.id::text
    WHERE m.project_id = project_id_param
  LOOP
    INSERT INTO public.report_materials (
      report_id,
      material_id,
      material_name,
      quantity_used,
      quantity_remaining,
      supplier_name,
      purchase_date,
      purchase_price
    )
    VALUES (
      new_report_id,
      material_record.id,
      material_record.name,
      material_record.quantity,
      COALESCE(material_record.max_stock_level, 0) - material_record.quantity,
      material_record.supplier_name,
      material_record.last_order_date,
      material_record.cost_per_unit
    );
  END LOOP;
  
  RETURN new_report_id;
END;
$$;

-- Create a trigger for updating the updated_at timestamp
CREATE TRIGGER on_report_materials_updated
  BEFORE UPDATE ON public.report_materials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
