-- Add working copy reviews table for git-style approval system
CREATE TABLE working_copy_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  working_copy_id UUID REFERENCES working_copies(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  comments TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(working_copy_id, reviewer_id)
);

-- Add indexes for performance
CREATE INDEX idx_working_copy_reviews_working_copy_id ON working_copy_reviews(working_copy_id);
CREATE INDEX idx_working_copy_reviews_reviewer_id ON working_copy_reviews(reviewer_id);
CREATE INDEX idx_working_copy_reviews_status ON working_copy_reviews(status);

-- Add RLS policies
ALTER TABLE working_copy_reviews ENABLE ROW LEVEL SECURITY;

-- Users can view reviews they are assigned to
CREATE POLICY "Users can view their assigned reviews" ON working_copy_reviews
  FOR SELECT USING (reviewer_id = auth.uid());

-- Users can update their assigned reviews
CREATE POLICY "Users can update their assigned reviews" ON working_copy_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON working_copy_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Working copy authors can view reviews for their copies
CREATE POLICY "Working copy authors can view reviews" ON working_copy_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM working_copies 
      WHERE working_copies.id = working_copy_reviews.working_copy_id 
      AND working_copies.user_id = auth.uid()
    )
  );

-- Only system can insert reviews (done via service)
CREATE POLICY "System can insert reviews" ON working_copy_reviews
  FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_working_copy_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on review updates
CREATE TRIGGER update_working_copy_reviews_updated_at
  BEFORE UPDATE ON working_copy_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_working_copy_reviews_updated_at(); 