import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';
import { Plus, Edit2, Trash2, X, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface SalesForecast {
  id: string;
  forecast_month: string;
  client_name: string;
  service_name: string;
  total_value: number;
  stage: string;
  probability: number;
  observations: string;
  assigned_executive: string;
}

const stageConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  contacto_inicial: { label: 'Contacto Inicial', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/40' },
  propuesta_enviada: { label: 'Propuesta Enviada', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/40' },
  presentacion_demo: { label: 'Presentación/Demo', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/40' },
  cierre_perdido: { label: 'Cierre Perdido', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/40' },
  cierre_ganado: { label: 'Cierre Ganado', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40' },
};

const emptyForm = {
  forecast_month: '',
  client_name: '',
  service_name: '',
  total_value: 0,
  stage: 'contacto_inicial' as const,
  probability: 50,
  observations: '',
  assigned_executive: '',
};

export default function PipelineView() {
  const { allUsers } = useAuth();
  const [forecast, setForecast] = useState<SalesForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesForecast | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchForecast();
  }, []);

  async function fetchForecast() {
    const { data } = await supabase.from('sales_forecast').select('*').order('forecast_month', { ascending: false });
    setForecast(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: SalesForecast) {
    setEditingItem(item);
    setForm({
      forecast_month: item.forecast_month,
      client_name: item.client_name,
      service_name: item.service_name,
      total_value: item.total_value,
      stage: item.stage as any,
      probability: item.probability,
      observations: item.observations,
      assigned_executive: item.assigned_executive,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.client_name.trim() || !form.forecast_month.trim()) return;
    setSaving(true);
    if (editingItem) {
      const { data } = await supabase
        .from('sales_forecast')
        .update(form)
        .eq('id', editingItem.id)
        .select()
        .single();
      if (data) setForecast(prev => prev.map(f => f.id === editingItem.id ? data : f));
    } else {
      const { data } = await supabase.from('sales_forecast').insert(form).select().single();
      if (data) setForecast(prev => [data, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('sales_forecast').delete().eq('id', id);
    setForecast(prev => prev.filter(f => f.id !== id));
  }

  const filteredForecast = forecast.filter(f =>
    f.client_name.toLowerCase().includes(search.toLowerCase()) ||
    f.service_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filteredForecast.reduce((sum, f) => sum + f.total_value, 0);
  const expectedValue = filteredForecast.reduce((sum, f) => sum + ((f.total_value * f.probability) / 100), 0);

  const stages = ['contacto_inicial', 'propuesta_enviada', 'presentacion_demo', 'cierre_perdido', 'cierre_ganado'];
  const stageGroups = stages.map(stage => ({
    stage,
    items: filteredForecast.filter(f => f.stage === stage),
    value: filteredForecast.filter(f => f.stage === stage).reduce((sum, f) => sum + f.total_value, 0),
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
            <p className="text-sm text-muted-foreground mt-1">CRM Forecast - Proyección de Oportunidades</p>
          </div>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Nueva Oportunidad
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Buscar cliente o servicio</label>
            <Input
              placeholder="Ej: La Cascada, Nube..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn('px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-1.5', viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              <List className="w-4 h-4" />
              Tabla
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn('px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-1.5', viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              <Grid className="w-4 h-4" />
              Kanban
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium">Valor Total</p>
            <p className="text-2xl font-bold text-foreground mt-1">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium">Valor Esperado</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">${expectedValue.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium">Oportunidades</p>
            <p className="text-2xl font-bold text-foreground mt-1">{filteredForecast.length}</p>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Mes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Servicio</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Valor ($)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Etapa</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Prob (%)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ejecutivo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Observaciones</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredForecast.map((item) => {
                  const exec = allUsers.find(u => u.email === item.assigned_executive);
                  const config = stageConfig[item.stage];
                  return (
                    <tr key={item.id} className="hover:bg-accent/50 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{item.forecast_month}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{item.client_name}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.service_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-foreground">${item.total_value.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium inline-block', config.bgColor, config.color)}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className={cn('text-xs font-bold px-2 py-1 rounded-full inline-block', item.probability >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : item.probability >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                          {item.probability}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {exec ? (
                          <span className={cn('text-xs px-2 py-1 rounded-full font-medium text-white inline-block', exec.avatar_color)}>
                            {exec.full_name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-xs hidden lg:table-cell">{item.observations}</td>
                      <td className="px-4 py-3 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-accent transition-colors" title="Editar">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-8">
          {stageGroups.map(({ stage, items, value }) => {
            const config = stageConfig[stage];
            return (
              <div key={stage} className="bg-muted/30 rounded-xl p-4 min-h-[600px] flex flex-col">
                {/* Column Header */}
                <div className={cn('rounded-lg p-3 mb-4', config.bgColor)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn('font-bold text-sm', config.color)}>{config.label}</p>
                    <span className={cn('text-xs px-2 py-1 rounded font-bold', config.bgColor, config.color)}>{items.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">${value.toLocaleString()}</p>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {items.map((item) => {
                    const exec = allUsers.find(u => u.email === item.assigned_executive);
                    return (
                      <div key={item.id} className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.client_name}</p>
                            <p className="text-xs text-muted-foreground">{item.service_name}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => openEdit(item)} className="p-1 rounded hover:bg-accent">
                              <Edit2 className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30">
                              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-600" />
                            </button>
                          </div>
                        </div>

                        {/* Value & Probability */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-sm font-bold text-foreground">${item.total_value.toLocaleString()}</span>
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', item.probability >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : item.probability >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                            {item.probability}%
                          </span>
                        </div>

                        {/* Ejecutivo */}
                        {exec && (
                          <div className={cn('text-xs px-2 py-1 rounded font-medium text-white text-center', exec.avatar_color)}>
                            {exec.full_name}
                          </div>
                        )}

                        {/* Observations */}
                        {item.observations && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.observations}</p>
                        )}

                        {/* Mes */}
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{item.forecast_month}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Add Button */}
                <button
                  onClick={openCreate}
                  className="mt-4 w-full py-2 rounded-lg border-2 border-dashed border-border hover:border-blue-500 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  + Agregar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingItem ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Mes *</label>
                  <Input value={form.forecast_month} onChange={(e) => setForm(f => ({ ...f, forecast_month: e.target.value }))} placeholder="Ej: Junio 2026" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Cliente *</label>
                  <Input value={form.client_name} onChange={(e) => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nombre del cliente" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Servicio</label>
                  <Input value={form.service_name} onChange={(e) => setForm(f => ({ ...f, service_name: e.target.value }))} placeholder="Ej: Nube, Colocación" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Valor Total ($)</label>
                  <Input type="number" value={form.total_value} onChange={(e) => setForm(f => ({ ...f, total_value: parseFloat(e.target.value) || 0 }))} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Etapa</label>
                  <select value={form.stage} onChange={(e) => setForm(f => ({ ...f, stage: e.target.value as any }))} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                    {Object.entries(stageConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Probabilidad (%)</label>
                  <Input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm(f => ({ ...f, probability: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Ejecutivo Asignado</label>
                <select value={form.assigned_executive} onChange={(e) => setForm(f => ({ ...f, assigned_executive: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Sin asignar</option>
                  {allUsers.map(u => (
                    <option key={u.email} value={u.email}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Observaciones</label>
                <textarea value={form.observations} onChange={(e) => setForm(f => ({ ...f, observations: e.target.value }))} placeholder="Notas sobre la oportunidad..." rows={3} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
