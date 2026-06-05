/*
  # Admin Role Management

  1. Changes
    - Adds a SELECT policy so admins can view all profiles
    - Adds an UPDATE policy so admins can update the `role` field of any profile
    - Ensures the `role` column is constrained to valid values

  2. Security
    - Only users with role = 'admin' can view all profiles (others see only their own)
    - Only admins can change another user's role
    - Valid roles: reader, author, editor, admin
*/

-- Add check constraint for valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('reader', 'author', 'editor', 'admin'));
  END IF;
END $$;

-- Allow admins to read all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      );
  END IF;
END $$;

-- Allow admins to update any profile's role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update any profile role'
  ) THEN
    CREATE POLICY "Admins can update any profile role"
      ON profiles FOR UPDATE
      TO authenticated
      USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      )
      WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      );
  END IF;
END $$;
