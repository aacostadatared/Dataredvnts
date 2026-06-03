import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'interesado' | 'en_seguimiento' | 'cerrado';
  notes: string;
  sales_stage: 'prospecto' | 'contactado' | 'propuesta_enviada' | 'en_negociacion' | 'cerrado_ganado';
  estimated_amount: number;
  assigned_user: string;
  created_at: string;
  updated_at: string;
};

export type DailyVisit = {
  id: string;
  client_id: string | null;
  client_name: string;
  date: string;
  visit_time: string;
  location: string;
  visit_type: 'tecnica' | 'comercial';
  contact_person: string;
  summary: string;
  outcome: string;
  next_action: string;
  assigned_user: string;
  created_at: string;
};

export type MeetingNote = {
  id: string;
  client_id: string | null;
  client_name: string;
  meeting_date: string;
  meeting_time: string;
  attendees: string[];
  topics_discussed: string;
  agreements: string;
  next_steps: string;
  assigned_user: string;
  created_at: string;
};

export type OutlookTask = {
  id: string;
  task_date: string;
  task_time: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
};
