import { useEffect, useState } from 'react';
import { supabase, DailyVisit } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MapPin,
  Plus,
  Clock,
  User,
  ArrowRight,
  Wrench,
  Briefcase,
  Calendar,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

const visitTypeConfig = {
  tecnica: {
    label: 'Técnica',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: Wrench,
    border: 'border-slate-300 dark:border-slate-600',
  },
  comercial: {
    label: 'Comercial',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Briefcase,
    border: 'border-blue-300 dark:border-blue-700',
  },
};

const emptyForm = {
  client_name: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  visit_time: '',
  location: '',
  visit_type: 'comercial' as 'tecnica' | 'comercial',
  contact_person: '',
  summary: '',
  outcome: '',
  next_action: '',
  assigned_user: '',
};

export default function DailyVisitsView() {
  const { allUsers } = useAuth();
  const [visits, setVisits] = useState<DailyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<DailyVisit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  async function fetchVisits() {
    const { data } = await supabase
      .from('daily_visits')
      .select('*')
      .order('date', { ascending: false })
      .order('visit_time', { ascending: true });
    setVisits(data || []);
    setLoading(false);
  }

  const groupedVisits = visits.reduce<Record<string, DailyVisit[]>>((acc, v) => {
    const key = v.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedVisits).sort((a, b) => b.localeCompare(a));

  function openCreate() {
    setEditingVisit(null);
    setForm({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd') });
    setShowForm(true);
  }

  function openEdit(visit: DailyVisit) {
    setEditingVisit(visit);
    setForm({
      client_name: visit.client_name,
      date: visit.date,
      visit_time: visit.visit_time,
      location: visit.location,
      visit_type: visit.visit_type,
      contact_person: visit.contact_person,
      summary: visit.summary,
      outcome: visit.outcome,
      next_action: visit.next_action,
      assigned_user: visit.assigned_user,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.client_name.trim()) return;
    setSaving(true);
    if (editingVisit) {
      const { data } = await supabase
        .from('daily_visits')
        .update(form)
        .eq('id', editingVisit.id)
        .select()
        .single();
      if (data) setVisits(prev => prev.map(v => v.id === editingVisit.id ? data : v));
    } else {
      const { data } = await supabase.from('daily_visits').insert(form).select().single();
      if (data) setVisits(prev => [data, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('daily_visits').delete().eq('id', id);
    setVisits(prev => prev.filter(v => v.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitas Diarias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bitácora de visitas técnicas y comerciales
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Registrar Visita
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {(['comercial', 'tecnica'] as const).map((type) => {
          const count = visits.filter(v => v.visit_type === type).length;
          const Icon = visitTypeConfig[type].icon;
          return (
            <div key={type} className={cn('bg-card border rounded-xl p-4 flex items-center gap-3', visitTypeConfig[type].border)}>
              <div className={cn('p-2 rounded-lg text-sm', visitTypeConfig[type].color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">Visitas {visitTypeConfig[type].label}s</p>
              </div>
            </div>
          );
        })}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{visits.length}</p>
            <p className="text-xs text-muted-foreground">Total Registradas</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-16 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">Sin visitas registradas</p>
          <p className="text-xs text-muted-foreground mt-1">Registra tu primera visita del día</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dayVisits = groupedVisits[dateKey];
            const dateObj = new Date(dateKey + 'T00:00:00');
            const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
                    isToday
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <Calendar className="w-3.5 h-3.5" />
                    {isToday ? 'Hoy — ' : ''}{format(dateObj, "EEEE, d 'de' MMMM", { locale: es })}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{dayVisits.length} visita{dayVisits.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-3">
                  {dayVisits.map((visit) => {
                    const TypeIcon = visitTypeConfig[visit.visit_type].icon;
                    return (
                      <div
                        key={visit.id}
                        className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4">
                            <div className={cn('p-2.5 rounded-xl mt-0.5', visitTypeConfig[visit.visit_type].color)}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{visit.client_name}</h3>
                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', visitTypeConfig[visit.visit_type].color)}>
                                  {visitTypeConfig[visit.visit_type].label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {visit.visit_time && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {visit.visit_time}
                                  </span>
                                )}
                                {visit.contact_person && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="w-3 h-3" />
                                    {visit.contact_person}
                                  </span>
                                )}
                                {visit.location && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {visit.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => openEdit(visit)}
                              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(visit.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {visit.summary && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resumen</p>
                              <p className="text-sm text-foreground leading-relaxed">{visit.summary}</p>
                            </div>
                          )}
                          {visit.outcome && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resultado</p>
                              <p className="text-sm text-foreground leading-relaxed">{visit.outcome}</p>
                            </div>
                          )}
                          {visit.next_action && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                Próxima acción
                              </p>
                              <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed font-medium">{visit.next_action}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                {editingVisit ? 'Editar Visita' : 'Registrar Nueva Visita'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cliente / Empresa *</label>
                  <Input
                    value={form.client_name}
                    onChange={(e) => setForm(f => ({ ...f, client_name: e.target.value }))}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Persona de Contacto</label>
                  <Input
                    value={form.contact_person}
                    onChange={(e) => setForm(f => ({ ...f, contact_person: e.target.value }))}
                    placeholder="Nombre del contacto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Fecha</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Hora</label>
                  <Input
                    type="time"
                    value={form.visit_time}
                    onChange={(e) => setForm(f => ({ ...f, visit_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <div className="flex gap-2 h-10">
                    {(['comercial', 'tecnica'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, visit_type: t }))}
                        className={cn(
                          'flex-1 rounded-lg text-xs font-medium border transition-all',
                          form.visit_type === t
                            ? `${visitTypeConfig[t].color} border-current`
                            : 'border-border text-muted-foreground hover:bg-accent'
                        )}
                      >
                        {visitTypeConfig[t].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ubicación</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Dirección o lugar de la visita"
                />
              </div>
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Resumen de la Visita</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="Descripción de lo que se realizó durante la visita..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Resultado / Outcome</label>
                  <textarea
                    value={form.outcome}
                    onChange={(e) => setForm(f => ({ ...f, outcome: e.target.value }))}
                    placeholder="¿Cuál fue el resultado de la visita?"
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Próxima Acción</label>
                  <textarea
                    value={form.next_action}
                    onChange={(e) => setForm(f => ({ ...f, next_action: e.target.value }))}
                    placeholder="¿Qué sigue después de esta visita?"
                    rows={2}
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
                {saving ? 'Guardando...' : editingVisit ? 'Actualizar' : 'Registrar Visita'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
