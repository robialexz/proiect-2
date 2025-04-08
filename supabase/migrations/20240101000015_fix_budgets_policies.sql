-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can view all budgets' AND polrelid = 'public.budgets'::regclass
    ) THEN
        DROP POLICY "Users can view all budgets" ON public.budgets;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can insert budgets' AND polrelid = 'public.budgets'::regclass
    ) THEN
        DROP POLICY "Users can insert budgets" ON public.budgets;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can update budgets' AND polrelid = 'public.budgets'::regclass
    ) THEN
        DROP POLICY "Users can update budgets" ON public.budgets;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can delete budgets' AND polrelid = 'public.budgets'::regclass
    ) THEN
        DROP POLICY "Users can delete budgets" ON public.budgets;
    END IF;
END
$$;

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

-- Do the same for expenses table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can view all expenses' AND polrelid = 'public.expenses'::regclass
    ) THEN
        DROP POLICY "Users can view all expenses" ON public.expenses;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can insert expenses' AND polrelid = 'public.expenses'::regclass
    ) THEN
        DROP POLICY "Users can insert expenses" ON public.expenses;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can update expenses' AND polrelid = 'public.expenses'::regclass
    ) THEN
        DROP POLICY "Users can update expenses" ON public.expenses;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can delete expenses' AND polrelid = 'public.expenses'::regclass
    ) THEN
        DROP POLICY "Users can delete expenses" ON public.expenses;
    END IF;
END
$$;

-- Create policies for expenses
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
