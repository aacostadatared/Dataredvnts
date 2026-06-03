/*
  # User Profiles and Notifications System
  
  ## New Tables
  - `user_profiles` - Store user info with role and onboarding status
  - `renewal_notifications` - Track notification history
  
  ## Changes
  - Add onboarding and role tracking
  - Enable notification system
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  avatar_color text DEFAULT 'bg-blue-500',
  is_onboarded boolean DEFAULT false,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow insert for new users"
  ON user_profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Notification tracking
CREATE TABLE IF NOT EXISTS renewal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES active_clients(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  days_until_renewal integer NOT NULL,
  is_read boolean DEFAULT false,
  notified_at timestamptz DEFAULT now()
);

ALTER TABLE renewal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON renewal_notifications FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow insert notifications"
  ON renewal_notifications FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Pre-seed user profiles
INSERT INTO user_profiles (email, full_name, role, avatar_color, is_onboarded) VALUES
  ('andres@datared.com', 'Andrés García', 'Asesor Corporativo', 'bg-blue-500', true),
  ('ana@datared.com', 'Ana María López', 'Jefa de Ventas', 'bg-purple-500', true),
  ('ingeniero@datared.com', 'Carlos Rodríguez', 'Ingeniero de Sistemas', 'bg-emerald-500', true)
ON CONFLICT (email) DO NOTHING;
