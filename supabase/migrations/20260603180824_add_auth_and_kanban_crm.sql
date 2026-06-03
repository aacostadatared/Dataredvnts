/*
  # Add authentication and CRM enhancements

  ## Changes
  1. Add users table with profiles (Andrés, Jefa, Ingeniero)
  2. Add assigned_user columns to clients, visits, meetings
  3. Add sales_stage and estimated_amount columns to clients
  4. Restructure client status to use kanban stages

  ## New Columns
  - clients: sales_stage, estimated_amount, assigned_user
  - daily_visits: assigned_user
  - meeting_notes: assigned_user
  - New table: users with profiles
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add columns to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'sales_stage'
  ) THEN
    ALTER TABLE clients ADD COLUMN sales_stage text DEFAULT 'prospecto' CHECK (sales_stage IN ('prospecto', 'contactado', 'propuesta_enviada', 'en_negociacion', 'cerrado_ganado'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'estimated_amount'
  ) THEN
    ALTER TABLE clients ADD COLUMN estimated_amount numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'assigned_user'
  ) THEN
    ALTER TABLE clients ADD COLUMN assigned_user text DEFAULT '';
  END IF;
END $$;

-- Add assigned_user to daily_visits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_visits' AND column_name = 'assigned_user'
  ) THEN
    ALTER TABLE daily_visits ADD COLUMN assigned_user text DEFAULT '';
  END IF;
END $$;

-- Add assigned_user to meeting_notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meeting_notes' AND column_name = 'assigned_user'
  ) THEN
    ALTER TABLE meeting_notes ADD COLUMN assigned_user text DEFAULT '';
  END IF;
END $$;

-- Seed users
INSERT INTO users (username, name, email, color) VALUES
  ('andres', 'Andrés', 'andres@datared.com', 'bg-blue-500'),
  ('jefa', 'Jefa', 'jefa@datared.com', 'bg-purple-500'),
  ('ingeniero', 'Ingeniero', 'ingeniero@datared.com', 'bg-emerald-500')
ON CONFLICT (username) DO NOTHING;

-- Update existing clients with sales stages and assignments
UPDATE clients SET sales_stage = 'prospecto' WHERE status = 'interesado';
UPDATE clients SET sales_stage = 'en_negociacion' WHERE status = 'en_seguimiento';
UPDATE clients SET sales_stage = 'cerrado_ganado' WHERE status = 'cerrado';
UPDATE clients SET assigned_user = 'andres' WHERE sales_stage = 'cerrado_ganado';
UPDATE clients SET assigned_user = 'ingeniero' WHERE assigned_user = '';
UPDATE clients SET estimated_amount = 25000 WHERE estimated_amount = 0;
