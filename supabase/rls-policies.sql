-- Row Level Security Policies
-- Ensures users can only access their own data

-- =====================================================
-- Enable RLS on tables
-- =====================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for: applications
-- =====================================================

-- Policy: Users can SELECT (read) only their own applications
CREATE POLICY "Users can view their own applications"
ON applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can INSERT (create) their own applications
CREATE POLICY "Users can create their own applications"
ON applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE (edit) only their own applications
CREATE POLICY "Users can update their own applications"
ON applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE only their own applications
CREATE POLICY "Users can delete their own applications"
ON applications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for: audit_log
-- =====================================================

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: System can insert audit logs (via service role)
-- Note: INSERT by regular users is handled by backend functions
CREATE POLICY "Allow service role to insert audit logs"
ON audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- Helper function: Check if user is admin
-- (For future use when admin panel is needed)
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in auth.users metadata
  -- This will be configured later when admin features are added
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Optional: Admin policies (commented out for now)
-- Uncomment when admin panel is implemented
-- =====================================================

-- Allow admins to view all applications
-- CREATE POLICY "Admins can view all applications"
-- ON applications
-- FOR SELECT
-- TO authenticated
-- USING (is_admin(auth.uid()));

-- Allow admins to view all audit logs
-- CREATE POLICY "Admins can view all audit logs"
-- ON audit_log
-- FOR SELECT
-- TO authenticated
-- USING (is_admin(auth.uid()));

-- =====================================================
-- Test RLS (Run these queries to verify)
-- =====================================================

-- Test 1: Check if RLS is enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('applications', 'audit_log');
-- Expected: rowsecurity = true for both

-- Test 2: Check policies exist
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('applications', 'audit_log');
-- Expected: 5 policies for applications, 2 for audit_log
