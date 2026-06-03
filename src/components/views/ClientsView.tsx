import { useEffect, useState } from 'react';
import { supabase, Client } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';
import {
  Plus,
  GripVertical,
  MoreVertical,
  Trash2,
  X,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

type SalesStage = 'prospecto' | 'contactado' | 'propuesta_enviada' | 'en_negociacion' | 'cerrado_ganado';

const stagesConfig: Record<SalesStage, { label: string; color: string; bgColor: string; icon: string }> = {
  prospecto: { label: 'Prospecto', color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-900/50', icon: '🎯' },
  contactado: { label: 'Contactado', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/30', icon: '📞' },
  propuesta_enviada: { label: 'Propuesta Enviada', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/30', icon: '📧' },
  en_negociacion: { label: 'En Negociación', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/30', icon: '💬' },
  cerrado_ganado: { label: 'Cerrado/Ganado', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', icon: '✅' },
};

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'interesado' as const,
  notes: '',
  sales_stage: 'prospecto' as SalesStage,
  estimated_amount: 0,
  assigned_user: '',
};

export default function ClientsView() {
  const { allUsers } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<typeof emptyForm & { sales_stage: SalesStage }>(emptyForm as any);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  function openCreate(stage: SalesStage) {
    setEditingClient(null);
    setForm({ ...emptyForm, sales_stage: stage });
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    const formData: any = {
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      status: 'interesado',
      notes: client.notes,
      sales_stage: client.sales_stage as SalesStage,
      estimated_amount: client.estimated_amount || 0,
      assigned_user: client.assigned_user,
    };
    setForm(formData);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.company.trim()) return;
    setSaving(true);
    const saveData: any = {
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      sales_stage: form.sales_stage,
      estimated_amount: form.estimated_amount,
      assigned_user: form.assigned_user,
      status: 'interesado',
    };
    if (editingClient) {
      const { data: updated } = await supabase
        .from('clients')
        .update(saveData)
        .eq('id', editingClient.id)
        .select()
        .single();
      if (updated) setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
    } else {
      const { data: created } = await supabase.from('clients').insert(saveData).select().single();
      if (created) setClients(prev => [created, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  }

  async function moveCard(clientId: string, newStage: SalesStage) {
    const { data } = await supabase
      .from('clients')
      .update({ sales_stage: newStage })
      .eq('id', clientId)
      .select()
      .single();
    if (data) setClients(prev => prev.map(c => c.id === clientId ? data : c));
  }

  const stages: SalesStage[] = ['prospecto', 'contactado', 'propuesta_enviada', 'en_negociacion', 'cerrado_ganado'];
  const filteredClients = clients.filter(c =>
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = clients.reduce((sum, c) => sum + (c.estimated_amount || 0), 0);
  const stageValues = stages.map(s => ({
    stage: s,
    value: clients.filter(c => c.sales_stage === s).reduce((sum, c) => sum + (c.estimated_amount || 0), 0),
    count: clients.filter(c => c.sales_stage === s).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pipeline de Ventas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              CRM Kanban — {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600">${totalValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Valor total del pipeline</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <Input
            placeholder="Buscar por empresa o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => openCreate('prospecto')}>
            <Plus className="w-4 h-4" />
            Nuevo
          </Button>
        </div>

        {/* Stage Stats */}
        <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-2">
          {stageValues.map(({ stage, count, value }) => (
            <div key={stage} className={cn('rounded-lg p-3 whitespace-nowrap', stagesConfig[stage].bgColor)}>
              <p className={cn('text-xs font-bold', stagesConfig[stage].color)}>{stagesConfig[stage].icon} {count}</p>
              <p className="text-xs text-muted-foreground mt-1">${(value / 1000).toFixed(0)}k</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageClients = filteredClients.filter(c => c.sales_stage === stage);
          const config = stagesConfig[stage];
          return (
            <div key={stage} className="bg-muted/30 rounded-xl p-4 min-h-[600px] flex flex-col">
              {/* Column Header */}
              <div className={cn('rounded-lg p-3 mb-4', config.bgColor)}>
                <p className={cn('font-bold text-sm', config.color)}>
                  {config.icon} {config.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stageClients.length} cliente{stageClients.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {stageClients.map((client) => {
                  const assignedUser = allUsers.find(u => u.username === client.assigned_user);
                  return (
                    <div
                      key={client.id}
                      className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                        </div>
                        <button
                          onClick={() => openEdit(client)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-all flex-shrink-0"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>

                      {/* Amount */}
                      {client.estimated_amount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mb-2 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-1 rounded w-fit">
                          <DollarSign className="w-3 h-3" />
                          ${client.estimated_amount.toLocaleString()}
                        </div>
                      )}

                      {/* Assigned User */}
                      {assignedUser && (
                        <div className={cn('flex items-center gap-1.5 text-xs px-2 py-1 rounded', assignedUser.color.replace('bg-', 'bg-opacity-20 '))}>
                          <div className={cn('w-3 h-3 rounded-full', assignedUser.color)} />
                          <span className="text-xs font-medium text-foreground">{assignedUser.name}</span>
                        </div>
                      )}

                      {/* Next Stage Button */}
                      {stage !== 'cerrado_ganado' && (
                        <button
                          onClick={() => moveCard(client.id, stages[stages.indexOf(stage) + 1])}
                          className="w-full mt-2 text-xs py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          Siguiente
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Card Button */}
                {stageClients.length === 0 && (
                  <button
                    onClick={() => openCreate(stage)}
                    className="w-full h-16 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                )}
              </div>

              {/* Column Footer */}
              <button
                onClick={() => openCreate(stage)}
                className="w-full mt-4 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors font-medium flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo en {config.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Empresa *</label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Empresa"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Teléfono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Etapa de Venta</label>
                  <select
                    value={form.sales_stage}
                    onChange={(e) => setForm(f => ({ ...f, sales_stage: e.target.value as SalesStage }))}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{stagesConfig[s].label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Monto Estimado ($)</label>
                  <Input
                    type="number"
                    value={form.estimated_amount}
                    onChange={(e) => setForm(f => ({ ...f, estimated_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="25000"
                  />
                </div>
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
                <label className="text-xs font-medium text-muted-foreground">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notas adicionales..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  if (editingClient) {
                    handleDelete(editingClient.id);
                    setShowForm(false);
                  }
                }}
                className={editingClient ? 'text-red-600 hover:text-red-700' : 'hidden'}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.company.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? 'Guardando...' : editingClient ? 'Actualizar' : 'Crear Cliente'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
