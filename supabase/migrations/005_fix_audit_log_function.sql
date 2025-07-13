-- Fix the audit log function to handle tables without company_id field
-- This resolves the "record 'new' has no field 'company_id'" error for sop_assignments

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