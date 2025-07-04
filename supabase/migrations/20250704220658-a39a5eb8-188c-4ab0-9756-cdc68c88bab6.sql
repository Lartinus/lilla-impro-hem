-- Create storage bucket for image management
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create policies for image uploads
CREATE POLICY "Admins can view all images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);