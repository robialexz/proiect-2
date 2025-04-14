-- Fix RLS performance issues by replacing auth.uid() with (select auth.uid())
-- This prevents re-evaluation of auth functions for each row

-- Fix teams table policies
DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own teams" ON teams;
CREATE POLICY "Users can update their own teams"
  ON teams FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own teams" ON teams;
CREATE POLICY "Users can delete their own teams"
  ON teams FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix team_members table policies
DROP POLICY IF EXISTS "Users can create team members" ON team_members;
CREATE POLICY "Users can create team members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_members.team_id AND created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update team members" ON team_members;
CREATE POLICY "Users can update team members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_members.team_id AND created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete team members" ON team_members;
CREATE POLICY "Users can delete team members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_members.team_id AND created_by = (select auth.uid())
    )
  );

-- Fix team_projects table policies
DROP POLICY IF EXISTS "Users can create team projects" ON team_projects;
CREATE POLICY "Users can create team projects"
  ON team_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_projects.team_id AND created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete team projects" ON team_projects;
CREATE POLICY "Users can delete team projects"
  ON team_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_projects.team_id AND created_by = (select auth.uid())
    )
  );

-- Fix projects table policies
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- Fix user_roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
CREATE POLICY "Users can update their own role"
  ON user_roles FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
CREATE POLICY "Users can insert their own role"
  ON user_roles FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Fix reports table policies
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix report_templates table policies
DROP POLICY IF EXISTS "Users can create report templates" ON report_templates;
CREATE POLICY "Users can create report templates"
  ON report_templates FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own report templates" ON report_templates;
CREATE POLICY "Users can update their own report templates"
  ON report_templates FOR UPDATE
  USING ((select auth.uid()) = created_by AND is_system = false);

DROP POLICY IF EXISTS "Users can delete their own report templates" ON report_templates;
CREATE POLICY "Users can delete their own report templates"
  ON report_templates FOR DELETE
  USING ((select auth.uid()) = created_by AND is_system = false);

-- Fix report_exports table policies
DROP POLICY IF EXISTS "Users can create report exports" ON report_exports;
CREATE POLICY "Users can create report exports"
  ON report_exports FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own report exports" ON report_exports;
CREATE POLICY "Users can update their own report exports"
  ON report_exports FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own report exports" ON report_exports;
CREATE POLICY "Users can delete their own report exports"
  ON report_exports FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix resources table policies
DROP POLICY IF EXISTS "Users can create resources" ON resources;
CREATE POLICY "Users can create resources"
  ON resources FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own resources" ON resources;
CREATE POLICY "Users can update their own resources"
  ON resources FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own resources" ON resources;
CREATE POLICY "Users can delete their own resources"
  ON resources FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix resource_categories table policies
DROP POLICY IF EXISTS "Users can create resource categories" ON resource_categories;
CREATE POLICY "Users can create resource categories"
  ON resource_categories FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own resource categories" ON resource_categories;
CREATE POLICY "Users can update their own resource categories"
  ON resource_categories FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own resource categories" ON resource_categories;
CREATE POLICY "Users can delete their own resource categories"
  ON resource_categories FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix resource_allocations table policies
DROP POLICY IF EXISTS "Users can create resource allocations" ON resource_allocations;
CREATE POLICY "Users can create resource allocations"
  ON resource_allocations FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own resource allocations" ON resource_allocations;
CREATE POLICY "Users can update their own resource allocations"
  ON resource_allocations FOR UPDATE
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their own resource allocations" ON resource_allocations;
CREATE POLICY "Users can delete their own resource allocations"
  ON resource_allocations FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Fix storage policies
DROP POLICY IF EXISTS "Authenticated users can upload materials images" ON storage.objects;
CREATE POLICY "Authenticated users can upload materials images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'materials' AND (select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own materials images" ON storage.objects;
CREATE POLICY "Users can update their own materials images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'materials' AND (select auth.uid()) = owner);

DROP POLICY IF EXISTS "Users can delete their own materials images" ON storage.objects;
CREATE POLICY "Users can delete their own materials images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'materials' AND (select auth.uid()) = owner);

-- Fix budget_revisions table policies
DROP POLICY IF EXISTS "Users can create budget revisions" ON budget_revisions;
CREATE POLICY "Users can create budget revisions"
  ON budget_revisions FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);
