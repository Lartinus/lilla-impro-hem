-- Upload the logo to the existing images bucket
-- First, let's ensure we can store logos in the images bucket by checking the structure

-- The logo file needs to be uploaded manually through the Supabase dashboard or client
-- Since we already have an 'images' bucket that is public, we can use that

-- Let's create a specific storage policy for logo access if needed
CREATE POLICY "Logo files are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'logos');

-- Ensure the images bucket allows public uploads for logos folder
CREATE POLICY "Allow logo uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'logos');