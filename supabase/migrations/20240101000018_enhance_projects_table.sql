-- Enhance projects table with additional fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS progress numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget numeric(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS client_name text,
ADD COLUMN IF NOT EXISTS client_contact text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS project_type text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES auth.users(id);

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  due_date date,
  status text DEFAULT 'pending',
  completion_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all project milestones"
  ON public.project_milestones FOR SELECT
  USING (true);

CREATE POLICY "Users can insert project milestones"
  ON public.project_milestones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update project milestones"
  ON public.project_milestones FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete project milestones"
  ON public.project_milestones FOR DELETE
  USING (true);

-- Create project_notes table
CREATE TABLE IF NOT EXISTS public.project_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all project notes"
  ON public.project_notes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert project notes"
  ON public.project_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update project notes"
  ON public.project_notes FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete project notes"
  ON public.project_notes FOR DELETE
  USING (true);

-- Create project_attachments table
CREATE TABLE IF NOT EXISTS public.project_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size integer,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all project attachments"
  ON public.project_attachments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert project attachments"
  ON public.project_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update project attachments"
  ON public.project_attachments FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete project attachments"
  ON public.project_attachments FOR DELETE
  USING (true);

-- Create a trigger for updating the updated_at timestamp
CREATE TRIGGER on_project_milestones_updated
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_project_notes_updated
  BEFORE UPDATE ON public.project_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_project_attachments_updated
  BEFORE UPDATE ON public.project_attachments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to update project progress based on milestones
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  progress_value NUMERIC;
BEGIN
  -- Count total and completed milestones
  SELECT 
    COUNT(*), 
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO 
    total_milestones, 
    completed_milestones
  FROM 
    public.project_milestones
  WHERE 
    project_id = NEW.project_id;
  
  -- Calculate progress
  IF total_milestones > 0 THEN
    progress_value := (completed_milestones::NUMERIC / total_milestones::NUMERIC) * 100;
  ELSE
    progress_value := 0;
  END IF;
  
  -- Update project progress
  UPDATE public.projects
  SET 
    progress = progress_value,
    updated_at = now(),
    last_updated_by = NEW.created_by
  WHERE 
    id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update project progress
CREATE TRIGGER update_project_progress_on_milestone_insert
  AFTER INSERT ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

CREATE TRIGGER update_project_progress_on_milestone_update
  AFTER UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

CREATE TRIGGER update_project_progress_on_milestone_delete
  AFTER DELETE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- Insert sample project types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type_enum') THEN
    CREATE TYPE project_type_enum AS ENUM (
      'residential',
      'commercial',
      'industrial',
      'infrastructure',
      'renovation',
      'other'
    );
  END IF;
END
$$;
