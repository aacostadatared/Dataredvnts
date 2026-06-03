import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { NavItem } from '../../App';
import { Plus, Upload, Calendar, Edit2, Trash2, X, Download, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActiveClient {
  id: string;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  service_acquired: string;
  renewal_date: string;
  created_at?: string;
}

const emptyForm = {
  company_name: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  service_acquired: '',
  renewal_date: format(new Date(), 'yyyy-MM-dd'),
};

interface ActiveClientsViewProps {
  onNavigate: (view: NavItem) => void;
}

export default function ActiveClientsView({ onNavigate }: ActiveClientsViewProps) {
  const [clients, setClients] = useState<ActiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ActiveClient | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const { data } = await supabase.from('active_clients').select('*').order('renewal_date');
    setClients(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingClient(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(client: ActiveClient) {
    setEditingClient(client);
    setForm({
      company_name: client.company_name,
      contact_name: client.contact_name,
      contact_phone: client.contact_phone,
      contact_email: client.contact_email,
      service_acquired: client.service_acquired,
      renewal_date: client.renewal_date,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.company_name.trim() || !form.contact_name.trim()) return;
    setSaving(true);
    if (editingClient) {
      const { data } = await supabase
        .from('active_clients')
        .update(form)
        .eq('id', editingClient.id)
        .select()
        .single();
      if (data) setClients(prev => prev.map(c => c.id === editingClient.id ? data : c));
    } else {
      const { data } = await supabase.from('active_clients').insert(form).select().single();
      if (data) setClients(prev => [...prev, data].sort((a, b) => a.renewal_date.localeCompare(b.renewal_date)));
    }
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('active_clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  }

  function handleCSVImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImportError('');
        const csv = e.target?.result as string;
        const lines = csv.trim().split('\n');

        if (lines.length < 2) {
          setImportError('El archivo CSV debe tener al menos un encabezado y una fila de datos');
          return;
        }

        // Parse CSV (skip header)
        const newClients = lines.slice(1).map(line => {
          const [company, contact, phone, email, service, renewal] = line.split(',').map(s => s.trim());
          return {
            company_name: company,
            contact_name: contact,
            contact_phone: phone,
            contact_email: email,
            service_acquired: service,
            renewal_date: renewal || format(new Date(), 'yyyy-MM-dd'),
          };
        }).filter(c => c.company_name && c.contact_name); // Validar campos requeridos

        if (newClients.length === 0) {
          setImportError('No se encontraron clientes válidos en el archivo');
          return;
        }

        // Insert into database
        const { error } = await supabase.from('active_clients').insert(newClients);
        if (error) {
          setImportError(`Error al importar: ${error.message}`);
          return;
        }

        // Refresh list
        await fetchClients();
        setImportError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setImportError('Error al procesar el archivo CSV');
      }
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const template = 'Empresa,Contacto,Teléfono,Correo,Servicio,Renovación\nEjemplo S.A.,Juan Pérez,+503 7000-0000,juan@ejemplo.com,Nube,2026-12-31';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes_activos_plantilla.csv';
    a.click();
  }

  function openQuickVisit(client: ActiveClient) {
    // Este botón abrirá la vista de visitas con datos pre-rellenados
    // Se comunica mediante localStorage para pasar datos
    localStorage.setItem('prefilledVisit', JSON.stringify({
      client_name: client.company_name,
      contact_person: client.contact_name,
    }));
    onNavigate('visits');
  }

  const filtered = clients.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dueForRenewal = filtered.filter(c => {
    if (!c.renewal_date) return false;
    const renewalDate = new Date(c.renewal_date);
    return renewalDate <= nextMonth && renewalDate >= today;
  });

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
            <h1 className="text-2xl font-bold text-foreground">Clientes Activos</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestión de clientes con servicios vigentes</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" className="gap-2 text-xs">
              <Download className="w-4 h-4" />
              Plantilla CSV
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2 text-xs">
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar por empresa, contacto o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Import Error */}
        {importError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{importError}</p>
          </div>
        )}

        {/* Renewal Alert */}
        {dueForRenewal.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">{dueForRenewal.length} cliente{dueForRenewal.length !== 1 ? 's' : ''} próximo a renovar</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {dueForRenewal.map(c => c.company_name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CSV Format Info */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">
            Formato CSV: Empresa, Contacto, Teléfono, Correo, Servicio, Renovación
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Correo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Servicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Renovación</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((client) => {
                const renewalDate = client.renewal_date ? new Date(client.renewal_date) : null;
                const daysUntilRenewal = renewalDate ? Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const isUrgent = daysUntilRenewal && daysUntilRenewal <= 30 && daysUntilRenewal >= 0;

                return (
                  <tr key={client.id} className="hover:bg-accent/50 transition-colors group">
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{client.company_name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{client.contact_name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{client.contact_phone}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-xs">{client.contact_email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                        {client.service_acquired}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renewalDate && (
                        <div className="flex flex-col gap-0.5">
                          <span className={cn('text-sm font-medium', isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
                            {format(renewalDate, 'd MMM yyyy', { locale: es })}
                          </span>
                          {isUrgent && daysUntilRenewal !== null && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                              En {daysUntilRenewal} días
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openQuickVisit(client)}
                        className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                        title="Programar Visita"
                      >
                        <Calendar className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        onClick={() => openEdit(client)}
                        className="p-1.5 rounded hover:bg-accent transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Eliminar"
                      >
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente Activo'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Empresa *</label>
                  <Input
                    value={form.company_name}
                    onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Contacto *</label>
                  <Input
                    value={form.contact_name}
                    onChange={(e) => setForm(f => ({ ...f, contact_name: e.target.value }))}
                    placeholder="Nombre del contacto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Teléfono</label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                    placeholder="+503 7000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Correo</label>
                  <Input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Servicio *</label>
                  <Input
                    value={form.service_acquired}
                    onChange={(e) => setForm(f => ({ ...f, service_acquired: e.target.value }))}
                    placeholder="Ej: Nube, Colocación"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Fecha Renovación</label>
                  <Input
                    type="date"
                    value={form.renewal_date}
                    onChange={(e) => setForm(f => ({ ...f, renewal_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
