/*
  # Fix profiles RLS recursive policy

  The "Admins can view all profiles" policy was causing infinite recursion
  because it queries the profiles table itself to check the role, which triggers
  the same policy again.

  Fix: Replace the recursive subquery with auth.jwt() metadata, or simply
  rely on the existing "Users can view own profile" policy for the admin role check
  since admins only need to read their own profile to verify their role.

  For the admin members page, we use service role or a security definer function.
  Here we create a security definer function to safely check admin status.
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to get role without RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Re-create the admin view policy using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');
