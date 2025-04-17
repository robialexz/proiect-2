-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own teams"
  ON teams FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own teams"
  ON teams FOR DELETE
  USING (auth.uid() = created_by);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  role text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT team_members_user_or_name_email CHECK (
    (user_id IS NOT NULL) OR (name IS NOT NULL AND email IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Users can create team members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_members.team_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update team members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_members.team_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete team members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_members.team_id AND created_by = auth.uid()
    )
  );

-- Create team_projects table for many-to-many relationship
CREATE TABLE IF NOT EXISTS team_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(team_id, project_id)
);

-- Enable RLS
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all team projects"
  ON team_projects FOR SELECT
  USING (true);

CREATE POLICY "Users can create team projects"
  ON team_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_projects.team_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete team projects"
  ON team_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_projects.team_id AND created_by = auth.uid()
    )
  );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updating the updated_at timestamp
CREATE TRIGGER on_teams_updated
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_team_members_updated
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
