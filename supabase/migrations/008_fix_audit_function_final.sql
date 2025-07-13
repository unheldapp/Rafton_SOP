-- Final fix for the audit log function
-- This replaces the problematic function with a working version

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id, user_id, action, resource_type, resource_id, 
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
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