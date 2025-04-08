-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.user_roles;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all user roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own role"
  ON public.user_roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_roles_updated
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, display_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'avatar_url');
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert current user into profiles and user_roles if they don't exist
INSERT INTO public.profiles (id, display_name, email)
SELECT id, email, email
FROM auth.users
WHERE id = '91aabd8a-aa95-42ba-ab95-1b7602fc98bf'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('91aabd8a-aa95-42ba-ab95-1b7602fc98bf', 'admin')
ON CONFLICT (user_id) DO NOTHING;
