-- Create documents tables for document collaboration feature

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  file_url text,
  file_type text,
  file_size integer,
  folder_id uuid,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  is_public boolean DEFAULT false,
  shared_with text[] DEFAULT NULL,
  tags text[] DEFAULT NULL,
  version integer DEFAULT 1,
  status text DEFAULT 'draft'
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all documents"
  ON public.documents FOR SELECT
  USING (true);

CREATE POLICY "Users can create documents"
  ON public.documents FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Create document_folders table
CREATE TABLE IF NOT EXISTS public.document_folders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES public.document_folders(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all document folders"
  ON public.document_folders FOR SELECT
  USING (true);

CREATE POLICY "Users can create document folders"
  ON public.document_folders FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update their own document folders"
  ON public.document_folders FOR UPDATE
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete their own document folders"
  ON public.document_folders FOR DELETE
  USING ((select auth.uid()) = created_by);

-- Create document_comments table
CREATE TABLE IF NOT EXISTS public.document_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all document comments"
  ON public.document_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create document comments"
  ON public.document_comments FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own document comments"
  ON public.document_comments FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own document comments"
  ON public.document_comments FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  content text,
  file_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all document versions"
  ON public.document_versions FOR SELECT
  USING (true);

CREATE POLICY "Users can create document versions"
  ON public.document_versions FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the documents bucket
CREATE POLICY "Documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND (select auth.role()) = 'authenticated');

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND (select auth.uid()) = owner);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND (select auth.uid()) = owner);

-- Create triggers for updating the updated_at timestamp
CREATE TRIGGER on_documents_updated
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
