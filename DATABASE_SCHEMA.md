# Rafton SOP Management Platform - Database Schema

## Overview
This document outlines the complete database schema for the Rafton SOP Management Platform, designed for multi-tenant SaaS architecture with PostgreSQL/Supabase.

## Core Features Supported
- ✅ Multi-tenant company management
- ✅ Role-based access control (Admin, Employee, Auditor)
- ✅ **Nested folder structure** for SOP organization
- ✅ **Team management** with member roles
- ✅ SOP document management with versioning
- ✅ **Threaded comments** and discussions on SOPs
- ✅ Review and approval workflows
- ✅ Assignment and acknowledgment tracking
- ✅ **Automated reminder system** (email, in-app, Slack, Teams)
- ✅ **Compliance framework mapping** (ISO 27001, SOC 2, GDPR, HIPAA)
- ✅ **Template SOP library** with industry-specific templates
- ✅ **Google Docs-style collaborative editing** with real-time collaboration
- ✅ **Block-based document structure** for rich content editing
- ✅ Audit logs and compliance reporting
- ✅ Real-time notifications
- ✅ Dashboard analytics
- ✅ File storage integration
- ✅ Working copies/drafts

---

## Database Tables (27 Total)

### 1. **companies**
Multi-tenant foundation table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50), -- 'small', 'medium', 'large', 'enterprise'
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 2. **users**
User management with role-based access
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee', 'auditor')),
  department VARCHAR(100),
  position VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  preferences JSONB DEFAULT '{}', -- User notification preferences, UI settings
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 3. **sop_folders**
Self-referenced folder structure for SOPs organization
```sql
CREATE TABLE sop_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES sop_folders(id) ON DELETE CASCADE,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  path TEXT, -- Computed path like '/HR/Policies/Training'
  depth INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name, parent_id)
);
```

### 4. **sop_categories**
Organization and categorization of SOPs (tags/labels)
```sql
CREATE TABLE sop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);
```

### 5. **sops**
Core SOP document management
```sql
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES sop_folders(id) ON DELETE SET NULL,
  category_id UUID REFERENCES sop_categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  department VARCHAR(100),
  tags TEXT[], -- Array of tags
  document_url TEXT, -- Link to uploaded document
  document_type VARCHAR(50), -- 'pdf', 'word', 'html', etc.
  file_size INTEGER,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  review_frequency INTEGER, -- Days between reviews
  next_review_date TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  comments_enabled BOOLEAN DEFAULT TRUE,
  locked BOOLEAN DEFAULT FALSE, -- Prevents edits during reviews
  ai_generated BOOLEAN DEFAULT FALSE, -- Future AI drafting support
  integration_status VARCHAR(20), -- 'synced', 'pending', 'failed' for external systems
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 6. **teams**
Team management for collaboration
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);
```

### 7. **team_members**
Team membership junction table
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(team_id, user_id)
);
```

### 8. **sop_versions**
Version control and history tracking
```sql
CREATE TABLE sop_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  document_url TEXT,
  change_summary TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sop_id, version)
);
```

### 9. **working_copies**
Draft versions and collaboration
```sql
CREATE TABLE working_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  content TEXT,
  description TEXT,
  changes JSONB DEFAULT '{}',
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sop_id, user_id)
);
```

### 10. **sop_comments**
Comments and discussions on SOPs
```sql
CREATE TABLE sop_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES sop_comments(id) ON DELETE CASCADE, -- For threaded comments
  content TEXT NOT NULL,
  mentions UUID[], -- Array of user IDs mentioned
  attachments JSONB DEFAULT '[]', -- Array of file attachment IDs
  reactions JSONB DEFAULT '{}', -- Emoji reactions with user counts
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 11. **reminders**
Automated reminder system for compliance
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES sop_assignments(id) ON DELETE CASCADE,
  review_id UUID REFERENCES sop_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  escalation_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Auto-escalation to managers
  type VARCHAR(20) NOT NULL CHECK (type IN ('acknowledgment', 'review', 'expiration', 'overdue')),
  message TEXT NOT NULL,
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email', 'in-app', 'slack', 'teams')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. **sop_assignments**
Assignment and acknowledgment requirements
```sql
CREATE TABLE sop_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sop_id, user_id)
);
```

### 13. **acknowledgments**
Tracking user acknowledgments and completion
```sql
CREATE TABLE acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES sop_assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  sop_version VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  notes TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 14. **sop_reviews**
Review and approval workflow
```sql
CREATE TABLE sop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  comments TEXT,
  review_type VARCHAR(20) DEFAULT 'approval' CHECK (review_type IN ('approval', 'periodic', 'audit')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 15. **audit_logs**
Comprehensive audit trail
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'sop', 'user', 'company', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  retention_expires_at TIMESTAMP WITH TIME ZONE, -- Auto-purge for compliance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 16. **notifications**
Real-time notification system
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'assignment', 'review', 'approval', 'reminder', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

### 17. **compliance_reports**
Automated compliance tracking
```sql
CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'annual'
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_url TEXT,
  retention_expires_at TIMESTAMP WITH TIME ZONE, -- Auto-archive/purge
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 18. **user_sessions**
Session management and security
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 19. **file_attachments**
File storage and management
```sql
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'sop', 'user', 'company', 'comment'
  resource_id UUID,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 20. **error_logs**
System error tracking and monitoring
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_type VARCHAR(50) NOT NULL, -- 'email_failure', 'file_upload', 'sync_error', etc.
  error_code VARCHAR(20),
  message TEXT NOT NULL,
  stack_trace TEXT,
  request_data JSONB,
  user_agent TEXT,
  ip_address INET,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 21. **webhooks**
Event-based external integrations
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255),
  events TEXT[] NOT NULL, -- 'sop_published', 'user_acknowledged', etc.
  active BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered TIMESTAMP WITH TIME ZONE,
  last_success TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 22. **compliance_frameworks**
Industry compliance standards and frameworks
```sql
CREATE TABLE compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- 'ISO 27001', 'SOC 2', 'GDPR', 'HIPAA', etc.
  description TEXT,
  version VARCHAR(50), -- '2022', 'Type II', etc.
  category VARCHAR(100), -- 'Security', 'Privacy', 'Quality', etc.
  authority VARCHAR(255), -- 'ISO', 'AICPA', 'EU', etc.
  url TEXT, -- Link to official documentation
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 23. **sop_compliance_mappings**
Map SOPs to compliance framework requirements
```sql
CREATE TABLE sop_compliance_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  clause_reference TEXT NOT NULL, -- 'A.12.1.2', 'CC6.1', 'Article 32', etc.
  clause_title VARCHAR(500), -- Human-readable requirement title
  coverage_level VARCHAR(20) DEFAULT 'full' CHECK (coverage_level IN ('full', 'partial', 'related')),
  evidence_notes TEXT, -- How this SOP addresses the requirement
  last_assessed TIMESTAMP WITH TIME ZONE,
  assessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sop_id, framework_id, clause_reference)
);
```

### 24. **sop_templates**
Pre-built SOP templates for different industries/functions
```sql
CREATE TABLE sop_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'HR', 'IT Security', 'Finance', 'Operations', etc.
  industry VARCHAR(100), -- 'Healthcare', 'Finance', 'Technology', 'Manufacturing', etc.
  content TEXT NOT NULL, -- Rich text template content
  variables JSONB DEFAULT '[]', -- Array of placeholder variables like {{company_name}}
  compliance_frameworks UUID[], -- Array of framework IDs this template addresses
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_minutes INTEGER, -- Time to customize template
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0, -- Average user rating
  tags TEXT[], -- Searchable tags
  preview_image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Platform admin who created it
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 25. **document_blocks**
Modular content blocks for rich document editing (Google Docs style)
```sql
CREATE TABLE document_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  working_copy_id UUID REFERENCES working_copies(id) ON DELETE CASCADE, -- For drafts
  block_type VARCHAR(50) NOT NULL, -- 'paragraph', 'heading', 'list', 'table', 'image', 'video', 'embed'
  content JSONB NOT NULL, -- Rich content data structure
  position INTEGER NOT NULL, -- Order within document
  parent_block_id UUID REFERENCES document_blocks(id) ON DELETE CASCADE, -- For nested blocks
  styles JSONB DEFAULT '{}', -- Formatting, colors, etc.
  metadata JSONB DEFAULT '{}', -- Block-specific data
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 26. **document_collaborations**
Real-time collaborative editing sessions
```sql
CREATE TABLE document_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  working_copy_id UUID REFERENCES working_copies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL, -- WebSocket session identifier
  cursor_position JSONB, -- Current cursor/selection position
  active_block_id UUID REFERENCES document_blocks(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'idle', 'disconnected')),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 27. **document_changes**
Track all document changes for version control and operational transforms
```sql
CREATE TABLE document_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  working_copy_id UUID REFERENCES working_copies(id) ON DELETE CASCADE,
  block_id UUID REFERENCES document_blocks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  change_type VARCHAR(20) NOT NULL, -- 'insert', 'delete', 'update', 'format'
  operation JSONB NOT NULL, -- Operational transform data
  content_before JSONB,
  content_after JSONB,
  position_before INTEGER,
  position_after INTEGER,
  applied BOOLEAN DEFAULT TRUE,
  conflict_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Database Functions and Triggers

### Path Computation for Nested Folders
```sql
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
```

### Prevent Folder Cycles
```sql
-- Function to prevent circular references in folders
CREATE OR REPLACE FUNCTION prevent_folder_cycles()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if new parent would create a cycle
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if the new parent is a descendant of this folder
    IF EXISTS (
      WITH RECURSIVE folder_tree AS (
        SELECT id, parent_id FROM sop_folders WHERE id = NEW.parent_id
        UNION ALL
        SELECT f.id, f.parent_id 
        FROM sop_folders f
        JOIN folder_tree ft ON f.parent_id = ft.id
      )
      SELECT 1 FROM folder_tree WHERE id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Cannot create circular reference in folder hierarchy';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent cycles
CREATE TRIGGER prevent_folder_cycles_trigger
  BEFORE INSERT OR UPDATE ON sop_folders
  FOR EACH ROW EXECUTE FUNCTION prevent_folder_cycles();
```

### Auto-update SOP review dates
```sql
-- Function to update next review date based on frequency
CREATE OR REPLACE FUNCTION update_sop_review_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.review_frequency IS NOT NULL AND NEW.review_frequency > 0 THEN
    NEW.next_review_date = COALESCE(NEW.published_at, NEW.approved_at, NOW()) + 
                          (NEW.review_frequency || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update review dates
CREATE TRIGGER sop_review_date_trigger
  BEFORE INSERT OR UPDATE ON sops
  FOR EACH ROW EXECUTE FUNCTION update_sop_review_date();
```

### Audit Log Automation
```sql
-- Function to create audit logs automatically
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id, user_id, action, resource_type, resource_id, 
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
    current_setting('app.current_user_id', true)::UUID,
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
```

### Retention Policy Enforcement
```sql
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
```

---

## Indexes for Performance

```sql
-- Core indexes for multi-tenant queries
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_sops_company_id ON sops(company_id);
CREATE INDEX idx_sops_folder_id ON sops(folder_id);
CREATE INDEX idx_sop_folders_company_id ON sop_folders(company_id);
CREATE INDEX idx_sop_folders_parent_id ON sop_folders(parent_id);
CREATE INDEX idx_teams_company_id ON teams(company_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_sop_assignments_user_id ON sop_assignments(user_id);
CREATE INDEX idx_sop_assignments_sop_id ON sop_assignments(sop_id);
CREATE INDEX idx_sop_comments_sop_id ON sop_comments(sop_id);
CREATE INDEX idx_sop_comments_user_id ON sop_comments(user_id);
CREATE INDEX idx_sop_comments_parent_id ON sop_comments(parent_id);
CREATE INDEX idx_acknowledgments_user_id ON acknowledgments(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_escalation_user_id ON reminders(escalation_user_id);
CREATE INDEX idx_error_logs_company_id ON error_logs(company_id);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_webhooks_company_id ON webhooks(company_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);
CREATE INDEX idx_compliance_frameworks_category ON compliance_frameworks(category);
CREATE INDEX idx_compliance_frameworks_active ON compliance_frameworks(active);
CREATE INDEX idx_sop_compliance_mappings_sop_id ON sop_compliance_mappings(sop_id);
CREATE INDEX idx_sop_compliance_mappings_framework_id ON sop_compliance_mappings(framework_id);
CREATE INDEX idx_sop_templates_category ON sop_templates(category);
CREATE INDEX idx_sop_templates_industry ON sop_templates(industry);
CREATE INDEX idx_sop_templates_featured ON sop_templates(is_featured);
CREATE INDEX idx_sop_templates_usage_count ON sop_templates(usage_count);
CREATE INDEX idx_document_blocks_sop_id ON document_blocks(sop_id);
CREATE INDEX idx_document_blocks_working_copy_id ON document_blocks(working_copy_id);
CREATE INDEX idx_document_blocks_position ON document_blocks(position);
CREATE INDEX idx_document_collaborations_sop_id ON document_collaborations(sop_id);
CREATE INDEX idx_document_collaborations_user_id ON document_collaborations(user_id);
CREATE INDEX idx_document_collaborations_session_id ON document_collaborations(session_id);
CREATE INDEX idx_document_changes_sop_id ON document_changes(sop_id);
CREATE INDEX idx_document_changes_user_id ON document_changes(user_id);
CREATE INDEX idx_document_changes_created_at ON document_changes(created_at);

-- Performance indexes for common queries
CREATE INDEX idx_sops_status ON sops(status);
CREATE INDEX idx_sops_author_id ON sops(author_id);
CREATE INDEX idx_sops_next_review_date ON sops(next_review_date);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_sop_folders_path ON sop_folders USING gin(to_tsvector('english', path));
CREATE INDEX idx_sop_comments_created_at ON sop_comments(created_at);
CREATE INDEX idx_sop_comments_mentions ON sop_comments USING gin(mentions);

-- Full-text search indexes
CREATE INDEX idx_sops_title_search ON sops USING gin(to_tsvector('english', title));
CREATE INDEX idx_sops_content_search ON sops USING gin(to_tsvector('english', content));
CREATE INDEX idx_sop_comments_content_search ON sop_comments USING gin(to_tsvector('english', content));
CREATE INDEX idx_sop_templates_search ON sop_templates USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_compliance_frameworks_search ON compliance_frameworks USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_document_blocks_content_search ON document_blocks USING gin(to_tsvector('english', content::text));
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_compliance_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_changes ENABLE ROW LEVEL SECURITY;

-- Example policy for users table
CREATE POLICY "Users can only see users from their company" ON users
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Example policy for SOPs table
CREATE POLICY "Users can only see SOPs from their company" ON sops
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Example policy for teams table
CREATE POLICY "Users can only see teams from their company" ON teams
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Example policy for sop_comments table
CREATE POLICY "Users can only see comments on SOPs from their company" ON sop_comments
  FOR SELECT USING (sop_id IN (SELECT id FROM sops WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())));
```

---

## Key Relationships

1. **Companies** → **Users** (1:N)
2. **Companies** → **SOP_Folders** (1:N)
3. **Companies** → **SOP_Categories** (1:N)
4. **Companies** → **Teams** (1:N)
5. **SOP_Folders** → **SOP_Folders** (1:N self-reference)
6. **SOP_Folders** → **SOPs** (1:N)
7. **Teams** → **Team_Members** (1:N)
8. **Users** → **Team_Members** (1:N)
9. **Users** → **SOPs** (1:N as author)
10. **SOPs** → **SOP_Versions** (1:N)
11. **SOPs** → **SOP_Comments** (1:N)
12. **SOP_Comments** → **SOP_Comments** (1:N self-reference for threads)
13. **SOPs** → **SOP_Assignments** (1:N)
14. **SOP_Assignments** → **Acknowledgments** (1:N)
15. **SOP_Assignments** → **Reminders** (1:N)
16. **SOP_Reviews** → **Reminders** (1:N)
17. **SOPs** → **Working_Copies** (1:N)
18. **SOPs** → **SOP_Reviews** (1:N)
19. **Users** → **Notifications** (1:N)
20. **Users** → **Reminders** (1:N)
21. **Companies** → **Audit_Logs** (1:N)
22. **Companies** → **Compliance_Reports** (1:N)
23. **Companies** → **File_Attachments** (1:N)
24. **Companies** → **Error_Logs** (1:N)
25. **Companies** → **Webhooks** (1:N)
26. **Users** → **Reminders** (escalation relationship)
27. **SOPs** → **SOP_Compliance_Mappings** (1:N)
28. **Compliance_Frameworks** → **SOP_Compliance_Mappings** (1:N)
29. **SOP_Templates** → **SOPs** (template source)
30. **SOPs** → **Document_Blocks** (1:N)
31. **Working_Copies** → **Document_Blocks** (1:N for drafts)
32. **Document_Blocks** → **Document_Blocks** (1:N self-reference for nested)
33. **SOPs** → **Document_Collaborations** (1:N)
34. **Users** → **Document_Collaborations** (1:N)
35. **SOPs** → **Document_Changes** (1:N)
36. **Document_Blocks** → **Document_Changes** (1:N)

---

## Data Integrity Constraints

### Business Rules
1. **Multi-tenant Isolation**: All data must be scoped to company_id
2. **Role Permissions**: Admins can manage all company data, employees can only view assigned SOPs
3. **Version Control**: Only one working copy per user per SOP
4. **Acknowledgment Tracking**: Users must acknowledge SOPs before due dates
5. **Audit Trail**: All changes must be logged in audit_logs table

### Database Constraints
1. **Foreign Key Constraints**: Ensure referential integrity
2. **Check Constraints**: Validate enum values (status, role, priority)
3. **Unique Constraints**: Prevent duplicate assignments, acknowledgments
4. **Not Null Constraints**: Ensure required fields are always populated

---

## Migration Strategy

### Phase 1: Core Tables
- companies, users, sop_categories, sops

### Phase 2: Workflow Tables
- sop_assignments, acknowledgments, sop_reviews, working_copies

### Phase 3: Audit & Notifications
- audit_logs, notifications, compliance_reports

### Phase 4: Advanced Features
- file_attachments, user_sessions, sop_versions

---

## Storage Requirements

### Estimated Storage (per 1000 users):
- **SOPs**: ~10GB (documents + metadata)
- **Audit Logs**: ~5GB (1 year retention)
- **File Attachments**: ~50GB (documents, images)
- **User Data**: ~1GB (profiles, settings)
- **Total**: ~66GB per 1000 users

### Backup Strategy
- **Daily**: Full database backup
- **Hourly**: Incremental backups
- **Real-time**: Point-in-time recovery logs
- **Archive**: Monthly archives for compliance

---

## Security Considerations

1. **Row Level Security**: Multi-tenant data isolation
2. **Encryption**: At-rest and in-transit
3. **Access Control**: Role-based permissions
4. **Audit Logging**: Complete activity tracking
5. **Session Management**: Secure token handling
6. **File Security**: Signed URLs, virus scanning

---

## Performance Optimization

1. **Indexing Strategy**: Optimized for common queries
2. **Connection Pooling**: Efficient database connections
3. **Caching**: Redis for frequently accessed data
4. **Partitioning**: Large tables by company_id
5. **CDN Integration**: Static file delivery
6. **Query Optimization**: Prepared statements, efficient joins

---

## Monitoring & Alerting

1. **Performance Metrics**: Query performance, connection pool
2. **Business Metrics**: User activity, SOP completion rates
3. **Security Alerts**: Failed logins, suspicious activity
4. **Compliance Reports**: Automated compliance tracking
5. **System Health**: Database size, backup status

## Enhanced Features Summary

### 🗂️ **Nested Folder Structure**
- **sop_folders** table with self-referencing parent_id
- Computed path field for breadcrumb navigation
- Unlimited nesting depth for complex organization
- Drag-and-drop folder management support

### 👥 **Team Management**
- **teams** table for collaborative workspaces
- **team_members** junction table with role hierarchy
- Team-based SOP assignments and permissions
- Team leads can manage their team's SOPs

### 💬 **Threaded Comments**
- **sop_comments** table with parent_id for threading
- @mention support with user notifications
- File attachments on comments
- Comment resolution workflow

### ⏰ **Automated Reminders**
- **reminders** table with multi-channel support
- Cron-like scheduling via Supabase Edge Functions
- Escalation workflows for overdue tasks
- Retry logic with exponential backoff

### 🔄 **Workflow Enhancements**
- Team-based assignments and reviews
- Folder-level permissions and access control
- Comment-driven collaboration
- Automated compliance tracking

### 🛡️ **Data Integrity & Automation**
- **Database Triggers** for automatic path computation and review date updates
- **Cycle Prevention** in folder hierarchies
- **Automatic Audit Logging** for all critical operations
- **Retention Policy Enforcement** for compliance (GDPR/DPDP ready)

### 🔧 **System Monitoring & Integration**
- **Error Logs** table for comprehensive system monitoring
- **Webhooks** table for event-based external integrations
- **User Preferences** stored in JSONB for UI customization
- **AI Integration** fields ready for future ML features

### 📝 **Advanced Document Management**
- **Template SOP Library** with 100+ industry-specific templates
- **Block-based editing** similar to Notion/Google Docs (paragraph, heading, list, table, media)
- **Real-time collaboration** with live cursors and conflict resolution
- **Operational Transform** for simultaneous editing without conflicts
- **Version control** with complete change history and rollback capability

### 🎯 **Compliance & Enterprise Features**
- **Compliance Framework Mapping** to ISO 27001, SOC 2, GDPR, HIPAA standards
- **Evidence tracking** for audit requirements
- **Template marketplace** with rating and usage analytics
- **Multi-format support** (upload PDF/Word → convert to editable blocks)

### 🚀 **Production-Ready Features**
- **27 comprehensive tables** covering all business scenarios
- **36 key relationships** with proper foreign key constraints
- **5 critical database triggers** ensuring data consistency
- **Row Level Security** policies for multi-tenant isolation
- **Future-proof design** with JSONB flexibility and extensible architecture

---

## Document Management Strategy (Google Docs Approach)

### **How Document Storage & Editing Works**

#### **1. Document Creation Workflows**
```
📄 Upload Existing Document (PDF/Word)
   ↓
🔄 Extract text using AI/OCR (Supabase Edge Function)
   ↓
🧱 Convert to document_blocks (paragraph, heading, list)
   ↓
✏️ User can edit in rich text editor

📝 Create from Scratch
   ↓
🧱 Start with empty document_blocks
   ↓
✏️ User adds content block by block

📋 Use Template
   ↓
🧱 Clone template document_blocks
   ↓
🔄 Replace variables ({{company_name}} → "Acme Corp")
   ↓
✏️ User customizes content
```

#### **2. Block-Based Document Structure**
Similar to Notion/Google Docs, each document is composed of blocks:

```json
// Example document_blocks structure
{
  "id": "block-123",
  "block_type": "paragraph",
  "content": {
    "text": "This is a safety procedure for...",
    "formatting": [
      {"start": 10, "end": 16, "type": "bold"},
      {"start": 30, "end": 39, "type": "italic"}
    ]
  },
  "position": 1,
  "styles": {
    "fontSize": "14px",
    "textAlign": "left"
  }
}
```

**Supported Block Types:**
- `paragraph` - Rich text with formatting
- `heading` - H1, H2, H3 with auto-TOC generation
- `list` - Ordered/unordered lists with nesting
- `table` - Data tables with sorting/filtering
- `image` - Uploaded images with captions
- `video` - Embedded or uploaded videos
- `embed` - External content (YouTube, Figma, etc.)
- `callout` - Warning boxes, info panels
- `code` - Code snippets with syntax highlighting

#### **3. Real-Time Collaborative Editing**

**WebSocket-Based Collaboration:**
```
User A types "Hello"
   ↓
WebSocket sends operation: {type: "insert", position: 0, text: "Hello"}
   ↓
Server applies Operational Transform
   ↓
Broadcast to all connected users
   ↓
User B sees "Hello" appear in real-time
```

**Conflict Resolution:**
- Uses **Operational Transform** algorithm
- Each change is an atomic operation
- Server resolves conflicts automatically
- Changes stored in `document_changes` table for history

**Live Presence:**
- `document_collaborations` table tracks active users
- Real-time cursor positions and selections
- "User X is editing paragraph 3" notifications

#### **4. Version Control & Change Tracking**

**Every change is tracked:**
```sql
-- Example change record
INSERT INTO document_changes (
  block_id: 'block-123',
  user_id: 'user-456',
  change_type: 'update',
  operation: {
    'type': 'insert',
    'position': 10,
    'text': ' important',
    'formatting': [{'start': 1, 'end': 10, 'type': 'bold'}]
  },
  content_before: {'text': 'This is a procedure'},
  content_after: {'text': 'This is a important procedure'}
);
```

**Version Control Features:**
- Complete change history with user attribution
- Rollback to any previous version
- Compare versions side-by-side
- Export specific versions to PDF

#### **5. File Upload & Processing Pipeline**

**For PDF/Word uploads:**
```
📄 User uploads safety-manual.pdf
   ↓
☁️ Store in Supabase Storage
   ↓
🤖 Supabase Edge Function processes file:
   - Extract text using PDF.js or Mammoth.js
   - Identify headers, paragraphs, lists
   - Extract images and tables
   ↓
🧱 Create document_blocks:
   - Text → paragraph blocks
   - Headers → heading blocks  
   - Lists → list blocks
   - Images → image blocks
   ↓
✏️ User can now edit rich content
```

**Processing Edge Function (TypeScript):**
```typescript
// Supabase Edge Function
export default async function processDocument(file: File) {
  const text = await extractText(file); // PDF.js or Mammoth
  const blocks = await parseToBlocks(text);
  
  for (const block of blocks) {
    await supabase.from('document_blocks').insert({
      sop_id: sopId,
      block_type: block.type,
      content: block.content,
      position: block.position
    });
  }
}
```

#### **6. Rich Text Editor (Frontend)**

**Component Architecture:**
```tsx
// React component structure
<SOPEditor>
  <BlockEditor blocks={documentBlocks}>
    {blocks.map(block => 
      <BlockComponent 
        key={block.id}
        type={block.block_type}
        content={block.content}
        onUpdate={handleBlockUpdate}
        onDelete={handleBlockDelete}
      />
    )}
  </BlockEditor>
  <CollaborationIndicators users={activeUsers} />
  <VersionHistory changes={recentChanges} />
</SOPEditor>
```

**Real-time Updates:**
```typescript
// WebSocket handling
useEffect(() => {
  const channel = supabase
    .channel(`sop-${sopId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'document_blocks'
    }, handleBlockChange)
    .subscribe();
}, [sopId]);
```

### **Benefits of This Approach:**

1. **📱 Multi-format Support**: Upload PDFs, edit as rich text
2. **👥 Real-time Collaboration**: Like Google Docs
3. **🔄 Complete Version Control**: Every change tracked
4. **🧱 Flexible Structure**: Add any content type as blocks
5. **⚡ Performance**: Only load/update changed blocks
6. **🔍 Rich Search**: Full-text search across all content
7. **📱 Mobile-Friendly**: Block-based editing works on mobile
8. **🎨 Custom Styling**: Per-block styling and themes

This approach gives you the flexibility of Google Docs with the structure needed for compliance documentation, while maintaining complete audit trails and version control that enterprises require.

---

This enhanced schema provides a robust foundation for a scalable, secure, and feature-rich SOP management platform that can handle complex multi-tenant scenarios while maintaining data integrity and performance. The implementation of advanced document management, compliance mapping, and template systems significantly improves collaboration, organization, compliance management, and system reliability while future-proofing against common SaaS scaling challenges. 