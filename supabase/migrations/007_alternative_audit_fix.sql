-- Alternative Solution: Disable audit trigger for tables that don't have company_id
-- This can be used instead of adding company_id to sop_assignments table

-- Option A: Disable audit trigger for sop_assignments
-- DROP TRIGGER IF EXISTS audit_sop_assignments_trigger ON sop_assignments;

-- Option B: Create a simpler audit function that handles missing company_id gracefully
CREATE OR REPLACE FUNCTION create_audit_log_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- For tables without company_id, use NULL or skip audit logging
  INSERT INTO audit_logs (
    company_id, 
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    old_values, 
    new_values, 
    ip_address, 
    user_agent
  ) VALUES (
    NULL, -- company_id will be NULL for tables without this field
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

-- Replace the existing audit trigger for sop_assignments with the safe version
DROP TRIGGER IF EXISTS audit_sop_assignments_trigger ON sop_assignments;
CREATE TRIGGER audit_sop_assignments_trigger_safe
  AFTER INSERT OR UPDATE OR DELETE ON sop_assignments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log_safe(); 