-- Create a storage bucket for materials images
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the materials bucket
CREATE POLICY "Materials images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can upload materials images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own materials images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'materials' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own materials images"
ON storage.objects FOR DELETE
USING (bucket_id = 'materials' AND auth.uid() = owner);
