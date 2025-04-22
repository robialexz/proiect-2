-- Funcție pentru a obține utilizatorii cu rolurile lor
CREATE OR REPLACE FUNCTION get_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    p.display_name,
    r.role,
    u.created_at,
    u.last_sign_in_at
  FROM
    auth.users u
  LEFT JOIN
    profiles p ON u.id = p.id
  LEFT JOIN
    user_roles r ON u.id = r.user_id
  ORDER BY
    u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
