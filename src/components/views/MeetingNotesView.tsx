import { useEffect, useState } from 'react';
import { supabase, MeetingNote } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  Plus,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Calendar,
  X,
  Edit2,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

const emptyForm = {
  client_name: '',
  meeting_date: format(new Date(), 'yyyy-MM-dd'),
  meeting_time: '',
  attendees: [] as string[],
  topics_discussed: '',
  agreements: '',
  next_steps: '',
  assigned_user: '',
};

export default function MeetingNotesView() {
  const { allUsers } = useAuth();
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newAttendee, setNewAttendee] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data } = await supabase
      .from('meeting_notes')
      .select('*')
      .order('meeting_date', { ascending: false })
      .order('meeting_time', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingNote(null);
    setForm(emptyForm);
    setNewAttendee('');
    setShowForm(true);
  }

  function openEdit(note: MeetingNote) {
    setEditingNote(note);
    setForm({
      client_name: note.client_name,
      meeting_date: note.meeting_date,
      meeting_time: note.meeting_time,
      attendees: [...(note.attendees || [])],
      topics_discussed: note.topics_discussed,
      agreements: note.agreements,
      next_steps: note.next_steps,
      assigned_user: note.assigned_user,
    });
    setNewAttendee('');
    setShowForm(true);
  }

  function addAttendee() {
    if (newAttendee.trim() && !form.attendees.includes(newAttendee.trim())) {
      setForm(f => ({ ...f, attendees: [...f.attendees, newAttendee.trim()] }));
      setNewAttendee('');
    }
  }

  function removeAttendee(attendee: string) {
    setForm(f => ({ ...f, attendees: f.attendees.filter(a => a !== attendee) }));
  }

  async function handleSave() {
    if (!form.client_name.trim()) return;
    setSaving(true);
    if (editingNote) {
      const { data } = await supabase
        .from('meeting_notes')
        .update(form)
        .eq('id', editingNote.id)
        .select()
        .single();
      if (data) setNotes(prev => prev.map(n => n.id === editingNote.id ? data : n));
    } else {
      const { data } = await supabase.from('meeting_notes').insert(form).select().single();
      if (data) setNotes(prev => [data, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('meeting_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notas de Reuniones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro estructurado de reuniones con clientes
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nueva Nota
        </Button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">Sin notas de reuniones</p>
          <p className="text-xs text-muted-foreground mt-1">Registra tu primera reunión</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const isExpanded = expandedId === note.id;
            return (
              <div
                key={note.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Card Header */}
                <div
                  className="flex items-start justify-between p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : note.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{note.client_name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(note.meeting_date + 'T00:00:00'), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        {note.meeting_time && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {note.meeting_time}
                          </span>
                        )}
                        {note.attendees?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {note.attendees.length} asistente{note.attendees.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {!isExpanded && note.topics_discussed && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{note.topics_discussed}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(note)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : note.id)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                    >
                      <svg
                        className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Attendees */}
                    {note.attendees?.length > 0 && (
                      <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Asistentes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {note.attendees.map((a, i) => (
                            <span
                              key={i}
                              className="text-xs bg-background border border-border px-2.5 py-1 rounded-full text-foreground"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Three sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-wide">Temas Tratados</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {note.topics_discussed || 'Sin registrar'}
                        </p>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-wide">Acuerdos</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {note.agreements || 'Sin acuerdos registrados'}
                        </p>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-wide">Próximos Pasos</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {note.next_steps || 'Sin próximos pasos definidos'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingNote ? 'Editar Nota de Reunión' : 'Nueva Nota de Reunión'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cliente / Empresa *</label>
                  <Input
                    value={form.client_name}
                    onChange={(e) => setForm(f => ({ ...f, client_name: e.target.value }))}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Fecha</label>
                  <Input
                    type="date"
                    value={form.meeting_date}
                    onChange={(e) => setForm(f => ({ ...f, meeting_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Hora</label>
                  <Input
                    type="time"
                    value={form.meeting_time}
                    onChange={(e) => setForm(f => ({ ...f, meeting_time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Asistentes</label>
                <div className="flex gap-2">
                  <Input
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    placeholder="Nombre y cargo del asistente"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAttendee}
                    className="gap-1.5 px-3"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Agregar
                  </Button>
                </div>
                {form.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.attendees.map((a, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full text-foreground"
                      >
                        {a}
                        <button
                          onClick={() => removeAttendee(a)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsible */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Responsable</label>
                <select
                  value={form.assigned_user}
                  onChange={(e) => setForm(f => ({ ...f, assigned_user: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin asignar</option>
                  {allUsers.map(u => (
                    <option key={u.username} value={u.username}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Three sections */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Temas Tratados
                  </label>
                  <textarea
                    value={form.topics_discussed}
                    onChange={(e) => setForm(f => ({ ...f, topics_discussed: e.target.value }))}
                    placeholder="Describe los temas que se discutieron en la reunión..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Acuerdos
                  </label>
                  <textarea
                    value={form.agreements}
                    onChange={(e) => setForm(f => ({ ...f, agreements: e.target.value }))}
                    placeholder="Lista los acuerdos y compromisos alcanzados..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Próximos Pasos
                  </label>
                  <textarea
                    value={form.next_steps}
                    onChange={(e) => setForm(f => ({ ...f, next_steps: e.target.value }))}
                    placeholder="Define las acciones concretas a realizar después de la reunión..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.client_name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Guardando...' : editingNote ? 'Actualizar' : 'Guardar Nota'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
