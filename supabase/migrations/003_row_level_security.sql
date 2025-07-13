-- Row Level Security (RLS) Policies
-- Multi-tenant access control

-- ========================================
-- ENABLE RLS ON ALL TABLES
-- ========================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_compliance_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_changes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- HELPER FUNCTIONS FOR RLS
-- ========================================

-- Function to get current user's company ID
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is auditor
CREATE OR REPLACE FUNCTION is_user_auditor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'auditor'
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMPANIES TABLE POLICIES
-- ========================================

-- Users can only see their own company
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (id = get_user_company_id());

-- Only admins can update their company
CREATE POLICY "Admins can update their company" ON companies
  FOR UPDATE USING (id = get_user_company_id() AND is_user_admin());

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Users can see other users in their company
CREATE POLICY "Users can view users in their company" ON users
  FOR SELECT USING (company_id = get_user_company_id());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Admins can update any user in their company
CREATE POLICY "Admins can update users in their company" ON users
  FOR UPDATE USING (company_id = get_user_company_id() AND is_user_admin());

-- Admins can insert new users in their company
CREATE POLICY "Admins can insert users in their company" ON users
  FOR INSERT WITH CHECK (company_id = get_user_company_id() AND is_user_admin());

-- Admins can delete users in their company (soft delete)
CREATE POLICY "Admins can delete users in their company" ON users
  FOR DELETE USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- SOP FOLDERS TABLE POLICIES
-- ========================================

-- Users can view folders in their company
CREATE POLICY "Users can view folders in their company" ON sop_folders
  FOR SELECT USING (company_id = get_user_company_id());

-- Admins can manage folders in their company
CREATE POLICY "Admins can manage folders in their company" ON sop_folders
  FOR ALL USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- SOP CATEGORIES TABLE POLICIES
-- ========================================

-- Users can view categories in their company
CREATE POLICY "Users can view categories in their company" ON sop_categories
  FOR SELECT USING (company_id = get_user_company_id());

-- Admins can manage categories in their company
CREATE POLICY "Admins can manage categories in their company" ON sop_categories
  FOR ALL USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- TEAMS TABLE POLICIES
-- ========================================

-- Users can view teams in their company
CREATE POLICY "Users can view teams in their company" ON teams
  FOR SELECT USING (company_id = get_user_company_id());

-- Admins can manage teams in their company
CREATE POLICY "Admins can manage teams in their company" ON teams
  FOR ALL USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- TEAM MEMBERS TABLE POLICIES
-- ========================================

-- Users can view team members in their company
CREATE POLICY "Users can view team members in their company" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT teams.id FROM teams WHERE teams.company_id = get_user_company_id()
    )
  );

-- Admins can manage team members in their company
CREATE POLICY "Admins can manage team members in their company" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT teams.id FROM teams WHERE teams.company_id = get_user_company_id()
    ) AND is_user_admin()
  );

-- ========================================
-- SOPS TABLE POLICIES
-- ========================================

-- Users can view SOPs in their company
CREATE POLICY "Users can view SOPs in their company" ON sops
  FOR SELECT USING (company_id = get_user_company_id());

-- Users can create SOPs in their company
CREATE POLICY "Users can create SOPs in their company" ON sops
  FOR INSERT WITH CHECK (company_id = get_user_company_id() AND author_id = auth.uid());

-- Authors can update their own SOPs
CREATE POLICY "Authors can update their own SOPs" ON sops
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    author_id = auth.uid() AND 
    status != 'published'
  );

-- Admins can update any SOP in their company
CREATE POLICY "Admins can update SOPs in their company" ON sops
  FOR UPDATE USING (company_id = get_user_company_id() AND is_user_admin());

-- Admins can delete SOPs in their company
CREATE POLICY "Admins can delete SOPs in their company" ON sops
  FOR DELETE USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- SOP VERSIONS TABLE POLICIES
-- ========================================

-- Users can view SOP versions for SOPs in their company
CREATE POLICY "Users can view SOP versions in their company" ON sop_versions
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Users can create versions for SOPs they can edit
CREATE POLICY "Users can create SOP versions they can edit" ON sop_versions
  FOR INSERT WITH CHECK (
    sop_id IN (
      SELECT sops.id FROM sops 
      WHERE sops.company_id = get_user_company_id() 
      AND (sops.author_id = auth.uid() OR is_user_admin())
    )
  );

-- ========================================
-- WORKING COPIES TABLE POLICIES
-- ========================================

-- Users can view working copies for SOPs in their company
CREATE POLICY "Users can view working copies in their company" ON working_copies
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Users can manage their own working copies
CREATE POLICY "Users can manage their own working copies" ON working_copies
  FOR ALL USING (
    user_id = auth.uid() AND
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- ========================================
-- SOP COMMENTS TABLE POLICIES
-- ========================================

-- Users can view comments on SOPs in their company
CREATE POLICY "Users can view comments on SOPs in their company" ON sop_comments
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Users can create comments on SOPs in their company
CREATE POLICY "Users can create comments on SOPs in their company" ON sop_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON sop_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON sop_comments
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- SOP ASSIGNMENTS TABLE POLICIES
-- ========================================

-- Users can view assignments for SOPs in their company
CREATE POLICY "Users can view assignments in their company" ON sop_assignments
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Admins can manage assignments in their company
CREATE POLICY "Admins can manage assignments in their company" ON sop_assignments
  FOR ALL USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    ) AND is_user_admin()
  );

-- ========================================
-- ACKNOWLEDGMENTS TABLE POLICIES
-- ========================================

-- Users can view acknowledgments for SOPs in their company
CREATE POLICY "Users can view acknowledgments in their company" ON acknowledgments
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Users can create their own acknowledgments
CREATE POLICY "Users can create their own acknowledgments" ON acknowledgments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- ========================================
-- SOP REVIEWS TABLE POLICIES
-- ========================================

-- Users can view reviews for SOPs in their company
CREATE POLICY "Users can view reviews in their company" ON sop_reviews
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Assigned reviewers can manage their own reviews
CREATE POLICY "Reviewers can manage their own reviews" ON sop_reviews
  FOR ALL USING (
    reviewer_id = auth.uid() AND
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Admins can manage all reviews in their company
CREATE POLICY "Admins can manage all reviews in their company" ON sop_reviews
  FOR ALL USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    ) AND is_user_admin()
  );

-- ========================================
-- REMINDERS TABLE POLICIES
-- ========================================

-- Users can view their own reminders
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all reminders in their company
CREATE POLICY "Admins can view all reminders in their company" ON reminders
  FOR SELECT USING (
    user_id IN (
      SELECT users.id FROM users WHERE users.company_id = get_user_company_id()
    ) AND is_user_admin()
  );

-- System can manage reminders
CREATE POLICY "System can manage reminders" ON reminders
  FOR ALL USING (true);

-- ========================================
-- NOTIFICATIONS TABLE POLICIES
-- ========================================

-- Users can view and manage their own notifications
CREATE POLICY "Users can manage their own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ========================================
-- AUDIT LOGS TABLE POLICIES
-- ========================================

-- Admins can view audit logs for their company
CREATE POLICY "Admins can view audit logs for their company" ON audit_logs
  FOR SELECT USING (company_id = get_user_company_id() AND is_user_admin());

-- Auditors can view audit logs for their company
CREATE POLICY "Auditors can view audit logs for their company" ON audit_logs
  FOR SELECT USING (company_id = get_user_company_id() AND is_user_auditor());

-- System can create audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ========================================
-- COMPLIANCE REPORTS TABLE POLICIES
-- ========================================

-- Users can view compliance reports for their company
CREATE POLICY "Users can view compliance reports for their company" ON compliance_reports
  FOR SELECT USING (company_id = get_user_company_id());

-- Admins can manage compliance reports for their company
CREATE POLICY "Admins can manage compliance reports for their company" ON compliance_reports
  FOR ALL USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- FILE ATTACHMENTS TABLE POLICIES
-- ========================================

-- Users can view file attachments for their company
CREATE POLICY "Users can view file attachments for their company" ON file_attachments
  FOR SELECT USING (company_id = get_user_company_id());

-- Users can upload file attachments for their company
CREATE POLICY "Users can upload file attachments for their company" ON file_attachments
  FOR INSERT WITH CHECK (company_id = get_user_company_id() AND uploaded_by = auth.uid());

-- Users can delete their own file attachments
CREATE POLICY "Users can delete their own file attachments" ON file_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- ========================================
-- USER SESSIONS TABLE POLICIES
-- ========================================

-- Users can view and manage their own sessions
CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL USING (user_id = auth.uid());

-- ========================================
-- ERROR LOGS TABLE POLICIES
-- ========================================

-- Admins can view error logs for their company
CREATE POLICY "Admins can view error logs for their company" ON error_logs
  FOR SELECT USING (company_id = get_user_company_id() AND is_user_admin());

-- System can create error logs
CREATE POLICY "System can create error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- ========================================
-- WEBHOOKS TABLE POLICIES
-- ========================================

-- Admins can manage webhooks for their company
CREATE POLICY "Admins can manage webhooks for their company" ON webhooks
  FOR ALL USING (company_id = get_user_company_id() AND is_user_admin());

-- ========================================
-- COMPLIANCE FRAMEWORKS TABLE POLICIES
-- ========================================

-- All authenticated users can view compliance frameworks
CREATE POLICY "All users can view compliance frameworks" ON compliance_frameworks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only platform admins can manage compliance frameworks
-- (This would be handled by service role key, not regular users)

-- ========================================
-- SOP COMPLIANCE MAPPINGS TABLE POLICIES
-- ========================================

-- Users can view compliance mappings for SOPs in their company
CREATE POLICY "Users can view compliance mappings for their company" ON sop_compliance_mappings
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    )
  );

-- Admins can manage compliance mappings for their company
CREATE POLICY "Admins can manage compliance mappings for their company" ON sop_compliance_mappings
  FOR ALL USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    ) AND is_user_admin()
  );

-- ========================================
-- SOP TEMPLATES TABLE POLICIES
-- ========================================

-- All authenticated users can view SOP templates
CREATE POLICY "All users can view SOP templates" ON sop_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only platform admins can manage SOP templates
-- (This would be handled by service role key, not regular users)

-- ========================================
-- DOCUMENT BLOCKS TABLE POLICIES
-- ========================================

-- Users can view document blocks for SOPs in their company
CREATE POLICY "Users can view document blocks for their company" ON document_blocks
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    ) OR
    working_copy_id IN (
      SELECT wc.id FROM working_copies wc
      JOIN sops s ON wc.sop_id = s.id
      WHERE s.company_id = get_user_company_id()
    )
  );

-- Users can manage document blocks for their working copies
CREATE POLICY "Users can manage document blocks for their working copies" ON document_blocks
  FOR ALL USING (
    working_copy_id IN (
      SELECT working_copies.id FROM working_copies 
      WHERE working_copies.user_id = auth.uid()
    ) OR
    (sop_id IN (
      SELECT sops.id FROM sops 
      WHERE sops.company_id = get_user_company_id() 
      AND (sops.author_id = auth.uid() OR is_user_admin())
    ) AND working_copy_id IS NULL)
  );

-- ========================================
-- DOCUMENT COLLABORATIONS TABLE POLICIES
-- ========================================

-- Users can view collaborations for SOPs in their company
CREATE POLICY "Users can view collaborations for their company" ON document_collaborations
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    ) OR
    working_copy_id IN (
      SELECT wc.id FROM working_copies wc
      JOIN sops s ON wc.sop_id = s.id
      WHERE s.company_id = get_user_company_id()
    )
  );

-- Users can manage their own collaborations
CREATE POLICY "Users can manage their own collaborations" ON document_collaborations
  FOR ALL USING (user_id = auth.uid());

-- ========================================
-- DOCUMENT CHANGES TABLE POLICIES
-- ========================================

-- Users can view document changes for SOPs in their company
CREATE POLICY "Users can view document changes for their company" ON document_changes
  FOR SELECT USING (
    sop_id IN (
      SELECT sops.id FROM sops WHERE sops.company_id = get_user_company_id()
    ) OR
    working_copy_id IN (
      SELECT wc.id FROM working_copies wc
      JOIN sops s ON wc.sop_id = s.id
      WHERE s.company_id = get_user_company_id()
    )
  );

-- Users can create document changes for their working copies
CREATE POLICY "Users can create document changes for their working copies" ON document_changes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      working_copy_id IN (
        SELECT working_copies.id FROM working_copies 
        WHERE working_copies.user_id = auth.uid()
      ) OR
      sop_id IN (
        SELECT sops.id FROM sops 
        WHERE sops.company_id = get_user_company_id() 
        AND (sops.author_id = auth.uid() OR is_user_admin())
      )
    )
  ); 