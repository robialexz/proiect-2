-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  status text DEFAULT 'draft',
  data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all reports"
  ON reports FOR SELECT
  USING (true);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (auth.uid() = created_by);

-- Create report_templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  template jsonb NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all report templates"
  ON report_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create report templates"
  ON report_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own report templates"
  ON report_templates FOR UPDATE
  USING (auth.uid() = created_by AND is_system = false);

CREATE POLICY "Users can delete their own report templates"
  ON report_templates FOR DELETE
  USING (auth.uid() = created_by AND is_system = false);

-- Create report_schedules table
CREATE TABLE IF NOT EXISTS report_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_template_id uuid REFERENCES report_templates(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  frequency text NOT NULL,
  next_run_date timestamptz NOT NULL,
  recipients jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all report schedules"
  ON report_schedules FOR SELECT
  USING (true);

CREATE POLICY "Users can create report schedules"
  ON report_schedules FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own report schedules"
  ON report_schedules FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own report schedules"
  ON report_schedules FOR DELETE
  USING (auth.uid() = created_by);

-- Create report_exports table
CREATE TABLE IF NOT EXISTS report_exports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  format text NOT NULL,
  file_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all report exports"
  ON report_exports FOR SELECT
  USING (true);

CREATE POLICY "Users can create report exports"
  ON report_exports FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own report exports"
  ON report_exports FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own report exports"
  ON report_exports FOR DELETE
  USING (auth.uid() = created_by);

-- Create triggers for updating the updated_at timestamp
CREATE TRIGGER on_reports_updated
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_report_templates_updated
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_report_schedules_updated
  BEFORE UPDATE ON report_schedules
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_report_exports_updated
  BEFORE UPDATE ON report_exports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert default report templates
INSERT INTO report_templates (name, description, type, template, is_system)
VALUES
  ('Raport de inventar', 'Raport standard pentru inventar', 'inventory', '{"sections": ["inventory_summary", "low_stock", "expiring_items"]}', true),
  ('Raport de proiect', 'Raport standard pentru proiecte', 'project', '{"sections": ["project_summary", "timeline", "budget", "resources"]}', true),
  ('Raport financiar', 'Raport standard financiar', 'financial', '{"sections": ["income", "expenses", "profit_loss", "forecast"]}', true),
  ('Raport de echipă', 'Raport standard pentru echipe', 'team', '{"sections": ["team_summary", "performance", "allocation"]}', true);
