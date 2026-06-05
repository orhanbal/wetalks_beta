/*
  # Restrict role column updates in profiles

  1. Security
    - Users can update their own profile (full_name, avatar_url, display_name, bio)
    - Users CANNOT update their own role — role is managed server-side only
    - Existing SELECT/INSERT policies remain unchanged
*/

-- Drop existing update policy if any
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- New update policy: users can update their own row but NOT change role
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );
