-- Fix handle_updated_at function to set search_path explicitly
-- This prevents potential security issues by explicitly setting the search_path

-- Drop all existing triggers that use handle_updated_at
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname, relname
        FROM pg_trigger
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
        WHERE tgfoid = (SELECT oid FROM pg_proc WHERE proname = 'handle_updated_at')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_record.tgname, trigger_record.relname);
    END LOOP;
END $$;

-- Drop and recreate the handle_updated_at function with explicit search_path
DROP FUNCTION IF EXISTS public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Recreate all triggers for tables that have an updated_at column
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('CREATE TRIGGER on_%s_updated
                        BEFORE UPDATE ON public.%I
                        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
                       table_record.table_name, table_record.table_name);
    END LOOP;
END $$;
