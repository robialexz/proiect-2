-- Check if profiles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Create profiles table
    CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Check if user_roles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    -- Create user_roles table
    CREATE TABLE user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all user roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own role"
  ON user_roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Check if triggers exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'on_profiles_updated') THEN
      CREATE TRIGGER on_profiles_updated
        BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'on_user_roles_updated') THEN
      CREATE TRIGGER on_user_roles_updated
        BEFORE UPDATE ON user_roles
        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
  END IF;
END $$;

-- Create or replace function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    INSERT INTO public.profiles (id, display_name, email, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert into user_roles if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;
