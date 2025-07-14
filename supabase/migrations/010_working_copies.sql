-- Add working copies table for git-style SOP editing
CREATE TABLE working_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  description TEXT,
  changes JSONB DEFAULT '{}',
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sop_id, user_id) -- One working copy per user per SOP
);

-- Add indexes for performance
CREATE INDEX idx_working_copies_sop_id ON working_copies(sop_id);
CREATE INDEX idx_working_copies_user_id ON working_copies(user_id);
CREATE INDEX idx_working_copies_is_submitted ON working_copies(is_submitted);

-- Add RLS policies
ALTER TABLE working_copies ENABLE ROW LEVEL SECURITY;

-- Users can view their own working copies
CREATE POLICY "Users can view their own working copies" ON working_copies
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own working copies
CREATE POLICY "Users can insert their own working copies" ON working_copies
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own working copies
CREATE POLICY "Users can update their own working copies" ON working_copies
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own working copies (before submission)
CREATE POLICY "Users can delete their own working copies" ON working_copies
  FOR DELETE USING (user_id = auth.uid() AND is_submitted = FALSE);

-- Admins can view all working copies
CREATE POLICY "Admins can view all working copies" ON working_copies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_working_copies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_working_copies_updated_at
  BEFORE UPDATE ON working_copies
  FOR EACH ROW
  EXECUTE FUNCTION update_working_copies_updated_at(); 