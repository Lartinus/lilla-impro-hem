-- Security Enhancement: Prevent users from granting admin roles to themselves
-- Add constraint to ensure only existing admins can grant admin roles

-- Create a function to check if the current user is already an admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Update the user_roles insert policy to prevent privilege escalation
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Only existing admins can grant roles
  public.current_user_is_admin() 
  -- Prevent users from granting themselves admin roles unless they're already admin
  AND (NEW.user_id != auth.uid() OR public.current_user_is_admin())
);

-- Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    target_user_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_user_id,
    p_details
  );
END;
$$;

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'role_granted',
      NEW.user_id,
      jsonb_build_object('role', NEW.role, 'granted_by', auth.uid())
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'role_revoked',
      OLD.user_id,
      jsonb_build_object('role', OLD.role, 'revoked_by', auth.uid())
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();