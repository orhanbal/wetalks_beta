/*
  # Add public read policy for profiles

  ## Problem
  Article cards show "?" for author names because anonymous visitors cannot
  read profiles other than their own. The Supabase join on articles → profiles
  returns null for unauthenticated users.

  ## Change
  Add a SELECT policy that allows anyone (including anonymous visitors) to read
  the full_name and avatar_url of any profile, so author info is visible on
  article cards and pages without requiring a login.

  Only the SELECT operation is opened; all write operations remain restricted.
*/

CREATE POLICY "Public can view author profiles"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);
