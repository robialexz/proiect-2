-- Create budgets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all budgets"
  ON public.budgets FOR SELECT
  USING (true);

CREATE POLICY "Users can insert budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update budgets"
  ON public.budgets FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete budgets"
  ON public.budgets FOR DELETE
  USING (true);

-- Create expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid REFERENCES public.budgets(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  date date,
  category text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all expenses"
  ON public.expenses FOR SELECT
  USING (true);

CREATE POLICY "Users can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update expenses"
  ON public.expenses FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete expenses"
  ON public.expenses FOR DELETE
  USING (true);

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER on_budgets_updated
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_expenses_updated
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
