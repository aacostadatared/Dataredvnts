/*
  # DataRed El Salvador CRM Schema

  ## Overview
  Full CRM and operations center schema for DataRed El Salvador.

  ## Tables Created

  1. **clients** - CRM client records
     - id, name, company, email, phone, status (interesado/en_seguimiento/cerrado), notes, created_at, updated_at

  2. **daily_visits** - Daily visit log / bitacora
     - id, client_id (FK), date, time, location, type (tecnica/comercial), contact_person, summary, outcome, next_action, created_at

  3. **meeting_notes** - Structured meeting notes
     - id, client_id (FK), date, time, attendees (text[]), topics_discussed, agreements, next_steps, created_at

  4. **outlook_tasks** - Daily Outlook-style tasks
     - id, date, time, title, description, completed, created_at

  ## Security
  - RLS enabled on all tables
  - Public read/write policies for demo (no auth required for internal tool)
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'interesado' CHECK (status IN ('interesado', 'en_seguimiento', 'cerrado')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on clients"
  ON clients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on clients"
  ON clients FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on clients"
  ON clients FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on clients"
  ON clients FOR DELETE
  TO anon, authenticated
  USING (true);

-- Daily visits table
CREATE TABLE IF NOT EXISTS daily_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text NOT NULL DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  visit_time text DEFAULT '',
  location text DEFAULT '',
  visit_type text NOT NULL DEFAULT 'comercial' CHECK (visit_type IN ('tecnica', 'comercial')),
  contact_person text DEFAULT '',
  summary text DEFAULT '',
  outcome text DEFAULT '',
  next_action text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on daily_visits"
  ON daily_visits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on daily_visits"
  ON daily_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on daily_visits"
  ON daily_visits FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on daily_visits"
  ON daily_visits FOR DELETE
  TO anon, authenticated
  USING (true);

-- Meeting notes table
CREATE TABLE IF NOT EXISTS meeting_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text NOT NULL DEFAULT '',
  meeting_date date NOT NULL DEFAULT CURRENT_DATE,
  meeting_time text DEFAULT '',
  attendees text[] DEFAULT '{}',
  topics_discussed text DEFAULT '',
  agreements text DEFAULT '',
  next_steps text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on meeting_notes"
  ON meeting_notes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on meeting_notes"
  ON meeting_notes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on meeting_notes"
  ON meeting_notes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on meeting_notes"
  ON meeting_notes FOR DELETE
  TO anon, authenticated
  USING (true);

-- Outlook tasks table
CREATE TABLE IF NOT EXISTS outlook_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_date date NOT NULL DEFAULT CURRENT_DATE,
  task_time text DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE outlook_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on outlook_tasks"
  ON outlook_tasks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on outlook_tasks"
  ON outlook_tasks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on outlook_tasks"
  ON outlook_tasks FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on outlook_tasks"
  ON outlook_tasks FOR DELETE
  TO anon, authenticated
  USING (true);

-- Seed demo data for clients
INSERT INTO clients (name, company, email, phone, status, notes) VALUES
  ('Carlos Mejía', 'Grupo Agrisal', 'cmejia@agrisal.com.sv', '+503 7890-1234', 'interesado', 'Interesado en soluciones de conectividad dedicada'),
  ('Ana Gutiérrez', 'Banco Agrícola', 'agutierrez@bancoagricola.com', '+503 7123-4567', 'en_seguimiento', 'Requiere cotización para datacenter colocation'),
  ('Roberto Flores', 'La Constancia', 'rflores@laconstancia.com.sv', '+503 7654-3210', 'cerrado', 'Contrato firmado - fibra dedicada 1Gbps'),
  ('María Hernández', 'Tigo Business', 'mhernandez@tigo.com.sv', '+503 7321-0987', 'interesado', 'Primera reunión pendiente'),
  ('José Martínez', 'Almacenes Simán', 'jmartinez@siman.com', '+503 7890-4321', 'en_seguimiento', 'Evaluando propuesta técnica'),
  ('Laura Pacheco', 'ASSA Seguros', 'lpacheco@assa.com', '+503 7456-7890', 'interesado', 'Contacto inicial por referido')
ON CONFLICT DO NOTHING;

-- Seed demo outlook tasks for today
INSERT INTO outlook_tasks (task_date, task_time, title, description, completed) VALUES
  (CURRENT_DATE, '08:30', 'Visitar datacenter Grupo Agrisal', 'Verificar estado de rack y equipos de red', false),
  (CURRENT_DATE, '10:00', 'Reunión con Banco Agrícola', 'Presentar propuesta de colocation y fibra dedicada', false),
  (CURRENT_DATE, '12:30', 'Seguimiento propuesta La Constancia', 'Confirmar detalles de instalación', true),
  (CURRENT_DATE, '14:00', 'Llamada de ventas - Almacenes Simán', 'Revisar propuesta técnica con el equipo TI', false),
  (CURRENT_DATE, '16:30', 'Informe de visitas del día', 'Completar bitácora y actualizar CRM', false)
ON CONFLICT DO NOTHING;

-- Seed demo daily visits
INSERT INTO daily_visits (client_name, date, visit_time, location, visit_type, contact_person, summary, outcome, next_action) VALUES
  ('La Constancia', CURRENT_DATE, '09:00', 'Carretera Panamericana Km 34, San Salvador', 'tecnica', 'Ing. Roberto Flores', 'Revisión del estado del enlace de fibra dedicada y equipos en rack', 'Enlace operando al 100%, equipos en óptimas condiciones', 'Programar mantenimiento preventivo trimestral'),
  ('Grupo Agrisal', CURRENT_DATE - 1, '11:00', 'Torre Agrisal, Col. Escalón', 'comercial', 'Lic. Carlos Mejía', 'Presentación de soluciones de conectividad empresarial', 'Cliente interesado en fibra 500Mbps con SLA garantizado', 'Enviar propuesta técnica y comercial'),
  ('Banco Agrícola', CURRENT_DATE - 2, '15:00', 'Edificio Corporativo, Bulevar del Hipódromo', 'comercial', 'Ing. Ana Gutiérrez', 'Demo de servicios de colocation en datacenter Tier III', 'Solicitan cotización formal con opción de 2U y 4U', 'Preparar cotización y enviar esta semana')
ON CONFLICT DO NOTHING;

-- Seed demo meeting notes
INSERT INTO meeting_notes (client_name, meeting_date, meeting_time, attendees, topics_discussed, agreements, next_steps) VALUES
  ('Banco Agrícola', CURRENT_DATE - 1, '10:00', ARRAY['Ana Gutiérrez - TI Manager', 'Pedro López - Gerente Operaciones', 'Juan Díaz - Ejecutivo DataRed'], 'Se discutió la necesidad de migrar 3 servidores físicos a colocation en Datacenter Tier III. Se revisaron los requerimientos de energía, cooling y conectividad redundante. El cliente también mencionó interés en MPLS para conectar sus 12 sucursales.', 'DataRed enviará propuesta formal en 5 días hábiles. Se acordó una visita técnica al datacenter para el día 10. El cliente proveerá inventario de equipos a migrar.', 'Preparar propuesta técnica-comercial de colocation (2 racks). Coordinar visita guiada al datacenter. Diseñar arquitectura de red MPLS para 12 nodos.');
