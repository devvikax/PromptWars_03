-- Postgres SQL Database function to merge guest data
-- Target: Supabase database

CREATE OR REPLACE FUNCTION merge_guest_progress(
  p_guest_id UUID,
  p_auth_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- 1. Migrate completed daily missions
  UPDATE user_missions
  SET user_id = p_auth_user_id
  WHERE user_id = p_guest_id;

  -- 2. Migrate achievements
  UPDATE user_achievements
  SET user_id = p_auth_user_id
  WHERE user_id = p_guest_id;

  -- 3. Migrate carbon/water progress logs
  UPDATE progress_logs
  SET user_id = p_auth_user_id
  WHERE user_id = p_guest_id;

  -- 4. Safely remove the temporary guest entry in the users profile table
  DELETE FROM users WHERE id = p_guest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
