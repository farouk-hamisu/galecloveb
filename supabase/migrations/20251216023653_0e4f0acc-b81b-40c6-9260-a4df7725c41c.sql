-- Create a function to look up recipient by email or account number (bypasses RLS)
CREATE OR REPLACE FUNCTION public.lookup_transfer_recipient(
  p_identifier TEXT,
  p_is_email BOOLEAN
)
RETURNS TABLE(
  user_id UUID,
  account_id UUID,
  account_number TEXT,
  first_name TEXT,
  last_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_is_email THEN
    -- Look up by email
    RETURN QUERY
    SELECT 
      p.id AS user_id,
      a.id AS account_id,
      a.account_number,
      p.first_name,
      p.last_name
    FROM profiles p
    INNER JOIN accounts a ON a.user_id = p.id AND a.is_active = true
    WHERE LOWER(p.email) = LOWER(TRIM(p_identifier))
    ORDER BY a.created_at ASC
    LIMIT 1;
  ELSE
    -- Look up by account number
    RETURN QUERY
    SELECT 
      p.id AS user_id,
      a.id AS account_id,
      a.account_number,
      p.first_name,
      p.last_name
    FROM accounts a
    INNER JOIN profiles p ON p.id = a.user_id
    WHERE a.account_number = TRIM(p_identifier) AND a.is_active = true
    LIMIT 1;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.lookup_transfer_recipient(TEXT, BOOLEAN) TO authenticated;