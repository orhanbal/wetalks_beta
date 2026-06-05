/*
  # Fix profiles RLS update policy recursion

  "Admins can update any profile role" also had the same recursive subquery issue.
  Replace with the security definer function.
*/

DROP POLICY IF EXISTS "Admins can update any profile role" ON profiles;

CREATE POLICY "Admins can update any profile role"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
