-- Create budget table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  total_amount numeric NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all budgets"
  ON budgets FOR SELECT
  USING (true);

CREATE POLICY "Users can create budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = created_by);

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  planned_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all budget categories"
  ON budget_categories FOR SELECT
  USING (true);

CREATE POLICY "Users can create budget categories"
  ON budget_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE id = budget_categories.budget_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update budget categories"
  ON budget_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE id = budget_categories.budget_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete budget categories"
  ON budget_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE id = budget_categories.budget_id AND created_by = auth.uid()
    )
  );

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES budget_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  amount numeric NOT NULL,
  date date NOT NULL,
  receipt_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = created_by);

-- Create budget_revisions table to track changes
CREATE TABLE IF NOT EXISTS budget_revisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  previous_amount numeric NOT NULL,
  new_amount numeric NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE budget_revisions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all budget revisions"
  ON budget_revisions FOR SELECT
  USING (true);

CREATE POLICY "Users can create budget revisions"
  ON budget_revisions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create triggers for updating the updated_at timestamp
CREATE TRIGGER on_budgets_updated
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_budget_categories_updated
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_expenses_updated
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
