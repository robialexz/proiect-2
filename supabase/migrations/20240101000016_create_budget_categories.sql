-- Create budget_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid REFERENCES public.budgets(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all budget categories"
  ON public.budget_categories FOR SELECT
  USING (true);

CREATE POLICY "Users can insert budget categories"
  ON public.budget_categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update budget categories"
  ON public.budget_categories FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete budget categories"
  ON public.budget_categories FOR DELETE
  USING (true);

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER on_budget_categories_updated
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add category_id column to expenses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN category_id uuid REFERENCES public.budget_categories(id);
    END IF;
END
$$;

-- Add receipt_url column to expenses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'receipt_url'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN receipt_url text;
    END IF;
END
$$;

-- Add status column to expenses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN status text DEFAULT 'pending';
    END IF;
END
$$;
