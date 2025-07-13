-- Database Functions, Triggers, and Indexes
-- Part 2 of the schema setup

-- ========================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to compute folder path automatically
CREATE OR REPLACE FUNCTION update_folder_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = '/' || NEW.name;
    NEW.depth = 0;
  ELSE
    SELECT 
      COALESCE(f.path, '') || '/' || NEW.name,
      COALESCE(f.depth, 0) + 1
    INTO NEW.path, NEW.depth
    FROM sop_folders f 
    WHERE f.id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update path on folder insert/update
CREATE TRIGGER sop_folders_path_trigger
  BEFORE INSERT OR UPDATE ON sop_folders
  FOR EACH ROW EXECUTE FUNCTION update_folder_path();

-- Function to prevent folder cycles
CREATE OR REPLACE FUNCTION prevent_folder_cycles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if the parent is a descendant of the current folder
    IF EXISTS (
      WITH RECURSIVE folder_hierarchy AS (
        SELECT id, parent_id, 1 as depth
        FROM sop_folders 
        WHERE id = NEW.parent_id
        
        UNION ALL
        
        SELECT f.id, f.parent_id, fh.depth + 1
        FROM sop_folders f
        JOIN folder_hierarchy fh ON f.parent_id = fh.id
        WHERE fh.depth < 10 -- Prevent infinite recursion
      )
      SELECT 1 FROM folder_hierarchy WHERE id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Folder cycle detected: Cannot make folder a child of its descendant';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent folder cycles
CREATE TRIGGER prevent_folder_cycles_trigger
  BEFORE INSERT OR UPDATE ON sop_folders
  FOR EACH ROW EXECUTE FUNCTION prevent_folder_cycles();

-- Function to create audit logs automatically
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Get company_id from the record or derive it from related tables
  DECLARE
    company_id_value UUID;
  BEGIN
    -- Try to get company_id from the record directly
    BEGIN
      company_id_value := COALESCE(NEW.company_id, OLD.company_id);
    EXCEPTION
      WHEN undefined_column THEN
        -- If company_id doesn't exist, derive it from related tables
        CASE TG_TABLE_NAME
          WHEN 'sop_assignments' THEN
            -- Get company_id from the related SOP
            SELECT s.company_id INTO company_id_value
            FROM sops s
            WHERE s.id = COALESCE(NEW.sop_id, OLD.sop_id);
          WHEN 'acknowledgments' THEN
            -- Get company_id from the related SOP
            SELECT s.company_id INTO company_id_value
            FROM sops s
            WHERE s.id = COALESCE(NEW.sop_id, OLD.sop_id);
          WHEN 'sop_reviews' THEN
            -- Get company_id from the related SOP
            SELECT s.company_id INTO company_id_value
            FROM sops s
            WHERE s.id = COALESCE(NEW.sop_id, OLD.sop_id);
          WHEN 'reminders' THEN
            -- Get company_id from the related assignment or review
            IF COALESCE(NEW.assignment_id, OLD.assignment_id) IS NOT NULL THEN
              SELECT s.company_id INTO company_id_value
              FROM sops s
              JOIN sop_assignments sa ON s.id = sa.sop_id
              WHERE sa.id = COALESCE(NEW.assignment_id, OLD.assignment_id);
            ELSIF COALESCE(NEW.review_id, OLD.review_id) IS NOT NULL THEN
              SELECT s.company_id INTO company_id_value
              FROM sops s
              JOIN sop_reviews sr ON s.id = sr.sop_id
              WHERE sr.id = COALESCE(NEW.review_id, OLD.review_id);
            END IF;
          ELSE
            -- Default to null if we can't determine company_id
            company_id_value := NULL;
        END CASE;
    END;
  END;

  INSERT INTO audit_logs (
    company_id, user_id, action, resource_type, resource_id, 
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    company_id_value,
    COALESCE(
      NULLIF(current_setting('app.current_user_id', true), '')::UUID,
      auth.uid()
    ),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr(),
    current_setting('app.user_agent', true)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_sops_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sops
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_sop_assignments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sop_assignments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_sop_reviews_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sop_reviews
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to set retention dates automatically
CREATE OR REPLACE FUNCTION set_retention_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention based on company policies
  NEW.retention_expires_at = NEW.created_at + 
    COALESCE(
      (SELECT (settings->>'audit_retention_days')::INTEGER 
       FROM companies WHERE id = NEW.company_id), 
      365
    )::TEXT || ' days'::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to audit logs
CREATE TRIGGER audit_retention_trigger
  BEFORE INSERT ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION set_retention_date();

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at columns
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_folders_updated_at
  BEFORE UPDATE ON sop_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_categories_updated_at
  BEFORE UPDATE ON sop_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sops_updated_at
  BEFORE UPDATE ON sops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_working_copies_updated_at
  BEFORE UPDATE ON working_copies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_comments_updated_at
  BEFORE UPDATE ON sop_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_assignments_updated_at
  BEFORE UPDATE ON sop_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_reviews_updated_at
  BEFORE UPDATE ON sop_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_compliance_frameworks_updated_at
  BEFORE UPDATE ON compliance_frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_compliance_mappings_updated_at
  BEFORE UPDATE ON sop_compliance_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sop_templates_updated_at
  BEFORE UPDATE ON sop_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_document_blocks_updated_at
  BEFORE UPDATE ON document_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Core indexes for multi-tenant queries
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);

CREATE INDEX idx_sop_folders_company_id ON sop_folders(company_id);
CREATE INDEX idx_sop_folders_parent_id ON sop_folders(parent_id);
CREATE INDEX idx_sop_folders_path ON sop_folders(path);
CREATE INDEX idx_sop_folders_depth ON sop_folders(depth);

CREATE INDEX idx_sop_categories_company_id ON sop_categories(company_id);

CREATE INDEX idx_teams_company_id ON teams(company_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

CREATE INDEX idx_sops_company_id ON sops(company_id);
CREATE INDEX idx_sops_folder_id ON sops(folder_id);
CREATE INDEX idx_sops_category_id ON sops(category_id);
CREATE INDEX idx_sops_status ON sops(status);
CREATE INDEX idx_sops_author_id ON sops(author_id);
CREATE INDEX idx_sops_reviewer_id ON sops(reviewer_id);
CREATE INDEX idx_sops_approved_by ON sops(approved_by);
CREATE INDEX idx_sops_department ON sops(department);
CREATE INDEX idx_sops_priority ON sops(priority);
CREATE INDEX idx_sops_next_review_date ON sops(next_review_date);
CREATE INDEX idx_sops_published_at ON sops(published_at);
CREATE INDEX idx_sops_created_at ON sops(created_at);
CREATE INDEX idx_sops_tags ON sops USING gin(tags);

CREATE INDEX idx_sop_versions_sop_id ON sop_versions(sop_id);
CREATE INDEX idx_sop_versions_author_id ON sop_versions(author_id);
CREATE INDEX idx_sop_versions_created_at ON sop_versions(created_at);

CREATE INDEX idx_working_copies_sop_id ON working_copies(sop_id);
CREATE INDEX idx_working_copies_user_id ON working_copies(user_id);
CREATE INDEX idx_working_copies_is_submitted ON working_copies(is_submitted);

CREATE INDEX idx_sop_comments_sop_id ON sop_comments(sop_id);
CREATE INDEX idx_sop_comments_user_id ON sop_comments(user_id);
CREATE INDEX idx_sop_comments_parent_id ON sop_comments(parent_id);
CREATE INDEX idx_sop_comments_created_at ON sop_comments(created_at);
CREATE INDEX idx_sop_comments_is_resolved ON sop_comments(is_resolved);
CREATE INDEX idx_sop_comments_mentions ON sop_comments USING gin(mentions);

CREATE INDEX idx_sop_assignments_sop_id ON sop_assignments(sop_id);
CREATE INDEX idx_sop_assignments_user_id ON sop_assignments(user_id);
CREATE INDEX idx_sop_assignments_assigned_by ON sop_assignments(assigned_by);
CREATE INDEX idx_sop_assignments_status ON sop_assignments(status);
CREATE INDEX idx_sop_assignments_due_date ON sop_assignments(due_date);
CREATE INDEX idx_sop_assignments_priority ON sop_assignments(priority);

CREATE INDEX idx_acknowledgments_assignment_id ON acknowledgments(assignment_id);
CREATE INDEX idx_acknowledgments_user_id ON acknowledgments(user_id);
CREATE INDEX idx_acknowledgments_sop_id ON acknowledgments(sop_id);
CREATE INDEX idx_acknowledgments_acknowledged_at ON acknowledgments(acknowledged_at);

CREATE INDEX idx_sop_reviews_sop_id ON sop_reviews(sop_id);
CREATE INDEX idx_sop_reviews_reviewer_id ON sop_reviews(reviewer_id);
CREATE INDEX idx_sop_reviews_status ON sop_reviews(status);
CREATE INDEX idx_sop_reviews_review_type ON sop_reviews(review_type);
CREATE INDEX idx_sop_reviews_due_date ON sop_reviews(due_date);

CREATE INDEX idx_reminders_assignment_id ON reminders(assignment_id);
CREATE INDEX idx_reminders_review_id ON reminders(review_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_escalation_user_id ON reminders(escalation_user_id);
CREATE INDEX idx_reminders_type ON reminders(type);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX idx_reminders_channel ON reminders(channel);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_retention_expires_at ON audit_logs(retention_expires_at);

CREATE INDEX idx_compliance_reports_company_id ON compliance_reports(company_id);
CREATE INDEX idx_compliance_reports_status ON compliance_reports(status);
CREATE INDEX idx_compliance_reports_generated_by ON compliance_reports(generated_by);
CREATE INDEX idx_compliance_reports_created_at ON compliance_reports(created_at);

CREATE INDEX idx_file_attachments_company_id ON file_attachments(company_id);
CREATE INDEX idx_file_attachments_uploaded_by ON file_attachments(uploaded_by);
CREATE INDEX idx_file_attachments_resource_type ON file_attachments(resource_type);
CREATE INDEX idx_file_attachments_resource_id ON file_attachments(resource_id);
CREATE INDEX idx_file_attachments_created_at ON file_attachments(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX idx_error_logs_company_id ON error_logs(company_id);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);

CREATE INDEX idx_webhooks_company_id ON webhooks(company_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);
CREATE INDEX idx_webhooks_events ON webhooks USING gin(events);
CREATE INDEX idx_webhooks_created_by ON webhooks(created_by);

CREATE INDEX idx_compliance_frameworks_active ON compliance_frameworks(active);
CREATE INDEX idx_compliance_frameworks_category ON compliance_frameworks(category);

CREATE INDEX idx_sop_compliance_mappings_sop_id ON sop_compliance_mappings(sop_id);
CREATE INDEX idx_sop_compliance_mappings_framework_id ON sop_compliance_mappings(framework_id);
CREATE INDEX idx_sop_compliance_mappings_assessed_by ON sop_compliance_mappings(assessed_by);
CREATE INDEX idx_sop_compliance_mappings_last_assessed ON sop_compliance_mappings(last_assessed);

CREATE INDEX idx_sop_templates_category ON sop_templates(category);
CREATE INDEX idx_sop_templates_industry ON sop_templates(industry);
CREATE INDEX idx_sop_templates_featured ON sop_templates(is_featured);
CREATE INDEX idx_sop_templates_premium ON sop_templates(is_premium);
CREATE INDEX idx_sop_templates_usage_count ON sop_templates(usage_count);
CREATE INDEX idx_sop_templates_rating ON sop_templates(rating);
CREATE INDEX idx_sop_templates_tags ON sop_templates USING gin(tags);

CREATE INDEX idx_document_blocks_sop_id ON document_blocks(sop_id);
CREATE INDEX idx_document_blocks_working_copy_id ON document_blocks(working_copy_id);
CREATE INDEX idx_document_blocks_position ON document_blocks(position);
CREATE INDEX idx_document_blocks_parent_block_id ON document_blocks(parent_block_id);
CREATE INDEX idx_document_blocks_created_by ON document_blocks(created_by);

CREATE INDEX idx_document_collaborations_sop_id ON document_collaborations(sop_id);
CREATE INDEX idx_document_collaborations_working_copy_id ON document_collaborations(working_copy_id);
CREATE INDEX idx_document_collaborations_user_id ON document_collaborations(user_id);
CREATE INDEX idx_document_collaborations_session_id ON document_collaborations(session_id);
CREATE INDEX idx_document_collaborations_status ON document_collaborations(status);

CREATE INDEX idx_document_changes_sop_id ON document_changes(sop_id);
CREATE INDEX idx_document_changes_working_copy_id ON document_changes(working_copy_id);
CREATE INDEX idx_document_changes_block_id ON document_changes(block_id);
CREATE INDEX idx_document_changes_user_id ON document_changes(user_id);
CREATE INDEX idx_document_changes_created_at ON document_changes(created_at);

-- ========================================
-- FULL-TEXT SEARCH INDEXES
-- ========================================

-- Full-text search on SOP content
CREATE INDEX idx_sops_title_search ON sops USING gin(to_tsvector('english', title));
CREATE INDEX idx_sops_content_search ON sops USING gin(to_tsvector('english', content));
CREATE INDEX idx_sops_description_search ON sops USING gin(to_tsvector('english', description));

-- Full-text search on SOP comments
CREATE INDEX idx_sop_comments_content_search ON sop_comments USING gin(to_tsvector('english', content));

-- Full-text search on SOP templates
CREATE INDEX idx_sop_templates_search ON sop_templates USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Full-text search on compliance frameworks
CREATE INDEX idx_compliance_frameworks_search ON compliance_frameworks USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Full-text search on document blocks
CREATE INDEX idx_document_blocks_content_search ON document_blocks USING gin(to_tsvector('english', content::text));

-- Full-text search on folder paths
CREATE INDEX idx_sop_folders_path_search ON sop_folders USING gin(to_tsvector('english', path));

-- Full-text search on user names
CREATE INDEX idx_users_name_search ON users USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Full-text search on company names
CREATE INDEX idx_companies_name_search ON companies USING gin(to_tsvector('english', name)); 