-- Family Court Helper Database Schema
-- This script creates all necessary tables and indexes

-- =====================================================
-- Table: applications
-- Stores user court applications with dynamic form data
-- =====================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dynamic form data stored as JSONB (flexible for Survey.js)
  dynamic_data JSONB NOT NULL DEFAULT '{}',

  -- Application status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),

  -- Progress percentage (0-100)
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_expires_at ON applications(expires_at);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: audit_log
-- Tracks user actions for admin monitoring
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Action type (created, updated, deleted, downloaded, etc.)
  action TEXT NOT NULL,

  -- Resource details
  resource_type TEXT NOT NULL, -- 'application', 'form_config', etc.
  resource_id UUID,

  -- Additional metadata (flexible JSON)
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- =====================================================
-- Function: Auto-delete expired applications
-- Runs daily to remove applications older than 7 days
-- =====================================================
CREATE OR REPLACE FUNCTION delete_expired_applications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete applications where expires_at is in the past
  WITH deleted AS (
    DELETE FROM applications
    WHERE expires_at < NOW()
    RETURNING id, user_id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  -- Log the deletion
  IF deleted_count > 0 THEN
    INSERT INTO audit_log (user_id, action, resource_type, metadata)
    VALUES (
      NULL,
      'auto_deleted',
      'application',
      jsonb_build_object('count', deleted_count, 'reason', 'expired')
    );
  END IF;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Optional: Schedule auto-deletion using pg_cron
-- Note: pg_cron needs to be enabled in Supabase dashboard
-- Database -> Extensions -> enable pg_cron
-- =====================================================

-- Uncomment after enabling pg_cron extension:
-- SELECT cron.schedule(
--   'delete-expired-applications',
--   '0 2 * * *', -- Run at 2 AM daily
--   'SELECT delete_expired_applications();'
-- );

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE applications IS 'Stores user court applications with Survey.js form data';
COMMENT ON COLUMN applications.dynamic_data IS 'JSONB field storing all form responses from Survey.js';
COMMENT ON COLUMN applications.expires_at IS 'Auto-calculated as created_at + 7 days';

COMMENT ON TABLE audit_log IS 'Tracks all user actions for admin monitoring and compliance';
COMMENT ON FUNCTION delete_expired_applications IS 'Automatically deletes applications older than 7 days';
