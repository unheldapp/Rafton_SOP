-- Storage Buckets Setup
-- Create buckets for file storage with proper security

-- ========================================
-- CREATE STORAGE BUCKETS
-- ========================================

-- Create bucket for SOP documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sop-documents',
  'sop-documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/html',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
);

-- Create bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- Create bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
);

-- Create bucket for SOP template preview images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'template-previews',
  'template-previews',
  true,
  2097152, -- 2MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- Create bucket for comment attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comment-attachments',
  'comment-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- ========================================
-- STORAGE SECURITY POLICIES
-- ========================================

-- SOP Documents bucket policies
CREATE POLICY "Users can view SOP documents from their company"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'sop-documents' AND
    (
      -- Check if the object belongs to a SOP from user's company
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM sops WHERE company_id = (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
      OR
      -- Check if the object belongs to a file attachment from user's company
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM file_attachments WHERE company_id = (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can upload SOP documents to their company"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sop-documents' AND
    auth.uid() IS NOT NULL AND
    -- Users can only upload to their company's folder structure
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM sops WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update SOP documents from their company"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'sop-documents' AND
    auth.uid() IS NOT NULL AND
    (
      -- Check if user is admin or owner of the SOP
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM sops 
        WHERE company_id = (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
        AND (
          author_id = auth.uid() 
          OR 
          (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can delete SOP documents from their company"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sop-documents' AND
    auth.uid() IS NOT NULL AND
    (
      -- Check if user is admin or owner of the SOP
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM sops 
        WHERE company_id = (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
        AND (
          author_id = auth.uid() 
          OR 
          (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        )
      )
    )
  );

-- User Avatars bucket policies
CREATE POLICY "Anyone can view user avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Company Logos bucket policies
CREATE POLICY "Anyone can view company logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Admins can upload company logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update company logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete company logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Template Previews bucket policies
CREATE POLICY "Anyone can view template previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'template-previews');

-- Only platform admins can manage template previews
-- (This would be managed by service role key)

-- Comment Attachments bucket policies
CREATE POLICY "Users can view comment attachments from their company"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'comment-attachments' AND
    (
      -- Check if the attachment belongs to a comment on SOP from user's company
      (storage.foldername(name))[1] IN (
        SELECT sc.id::text FROM sop_comments sc
        JOIN sops s ON sc.sop_id = s.id
        WHERE s.company_id = (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can upload comment attachments to their company"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'comment-attachments' AND
    auth.uid() IS NOT NULL AND
    -- Users can only upload to comments on SOPs from their company
    (storage.foldername(name))[1] IN (
      SELECT sc.id::text FROM sop_comments sc
      JOIN sops s ON sc.sop_id = s.id
      WHERE s.company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
      AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comment attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'comment-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT sc.id::text FROM sop_comments sc
      WHERE sc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comment attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'comment-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT sc.id::text FROM sop_comments sc
      WHERE sc.user_id = auth.uid()
    )
  );

-- ========================================
-- STORAGE HELPER FUNCTIONS
-- ========================================

-- Function to get file extension
CREATE OR REPLACE FUNCTION get_file_extension(file_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(SPLIT_PART(file_name, '.', -1));
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure file name
CREATE OR REPLACE FUNCTION generate_secure_filename(
  original_name TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT AS $$
DECLARE
  extension TEXT;
  timestamp_str TEXT;
  random_str TEXT;
BEGIN
  extension := get_file_extension(original_name);
  timestamp_str := EXTRACT(EPOCH FROM NOW())::TEXT;
  random_str := SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8);
  
  RETURN user_id::TEXT || '/' || timestamp_str || '_' || random_str || '.' || extension;
END;
$$ LANGUAGE plpgsql;

-- Function to get file size limit for bucket
CREATE OR REPLACE FUNCTION get_bucket_file_size_limit(bucket_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  size_limit INTEGER;
BEGIN
  SELECT file_size_limit INTO size_limit
  FROM storage.buckets
  WHERE id = bucket_name;
  
  RETURN COALESCE(size_limit, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to check if file type is allowed
CREATE OR REPLACE FUNCTION is_file_type_allowed(
  bucket_name TEXT,
  mime_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  allowed_types TEXT[];
BEGIN
  SELECT allowed_mime_types INTO allowed_types
  FROM storage.buckets
  WHERE id = bucket_name;
  
  RETURN mime_type = ANY(allowed_types);
END;
$$ LANGUAGE plpgsql; 