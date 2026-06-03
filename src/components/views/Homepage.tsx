import { useEffect, useState } from 'react';
import { supabase, OutlookTask, DailyVisit, Client } from '../../lib/supabase';
import { NavItem } from '../../App';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {  Users,
  MapPin,
  CheckSquare,
  Clock,
  TrendingUp,
  Plus,
  Check,
  Building2,
  ChevronRight,
  CalendarDays,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface HomepageProps {
  onNavigate: (view: NavItem) => void;
}

const statusConfig = {
  interesado: { label: 'Interesado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  en_seguimiento: { label: 'En seguimiento', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  cerrado: { label: 'Cerrado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

const visitTypeConfig = {
  tecnica: { label: 'Técnica', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  comercial: { label: 'Comercial', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export default function Homepage({ onNavigate }: HomepageProps) {
  const [tasks, setTasks] = useState<OutlookTask[]>([]);
  const [visits, setVisits] = useState<DailyVisit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();

  useEffect(() => {
    async function fetchData() {
      const todayStr = format(today, 'yyyy-MM-dd');
      const [tasksRes, visitsRes, clientsRes] = await Promise.all([
        supabase.from('outlook_tasks').select('*').eq('task_date', todayStr).order('task_time'),
        supabase.from('daily_visits').select('*').order('date', { ascending: false }).limit(5),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
      ]);
      setTasks(tasksRes.data || []);
      setVisits(visitsRes.data || []);
      setClients(clientsRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleTask = async (task: OutlookTask) => {
    const { data } = await supabase
      .from('outlook_tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
      .select()
      .single();
    if (data) {
      setTasks(prev => prev.map(t => t.id === task.id ? data : t));
    }
  };

  const totalClients = clients.length;
  const todayVisits = visits.filter(v => v.date === format(today, 'yyyy-MM-dd')).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const interesados = clients.filter(c => c.status === 'interesado').length;

  const stats = [
    {
      label: 'Total Clientes',
      value: totalClients,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      trend: `${interesados} nuevos interesados`,
      trendUp: true,
    },
    {
      label: 'Visitas de Hoy',
      value: todayVisits,
      icon: MapPin,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      trend: 'registradas hoy',
      trendUp: true,
    },
    {
      label: 'Tareas Pendientes',
      value: pendingTasks,
      icon: CheckSquare,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      trend: `de ${tasks.length} totales hoy`,
      trendUp: false,
    },
    {
      label: 'En Seguimiento',
      value: clients.filter(c => c.status === 'en_seguimiento').length,
      icon: TrendingUp,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      trend: 'oportunidades activas',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Buenos días, equipo DataRed
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={() => onNavigate('visits')}
        >
          <Plus className="w-4 h-4" />
          Nueva Visita
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-2.5 rounded-lg', stat.bg)}>
                  <Icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <Activity className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stat.trendUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-500" />
                )}
                {stat.trend}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Outlook Tasks Widget */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-semibold text-foreground">Tareas de Hoy</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Agenda Outlook</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {tasks.filter(t => t.completed).length}/{tasks.length} completadas
              </span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay tareas para hoy</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors group',
                    task.completed && 'opacity-60'
                  )}
                  onClick={() => toggleTask(task)}
                >
                  <div
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-border group-hover:border-blue-400'
                    )}
                  >
                    {task.completed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium text-foreground',
                        task.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {task.task_time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Visits Summary */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-semibold text-foreground">Últimas Visitas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Bitácora reciente</p>
            </div>
            <button
              onClick={() => onNavigate('visits')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Ver todo
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {visits.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sin visitas registradas</p>
              </div>
            ) : (
              visits.slice(0, 4).map((visit) => (
                <div key={visit.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{visit.client_name}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', visitTypeConfig[visit.visit_type].color)}>
                      {visitTypeConfig[visit.visit_type].label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-9 truncate">{visit.summary || visit.location}</p>
                  <p className="text-xs text-muted-foreground/70 pl-9 mt-0.5">
                    {format(new Date(visit.date + 'T00:00:00'), "d MMM", { locale: es })}
                    {visit.visit_time && ` · ${visit.visit_time}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Client Overview */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Clientes Recientes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Vista rápida del pipeline</p>
          </div>
          <button
            onClick={() => onNavigate('clients')}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            Ver todos
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.slice(0, 4).map((client) => (
                <tr key={client.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-foreground">{client.company}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium', statusConfig[client.status].color)}>
                      {statusConfig[client.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{client.notes}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
