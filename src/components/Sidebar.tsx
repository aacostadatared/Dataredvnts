import { useState } from 'react';
import { NavItem } from '../App';
import { useAuth } from '../contexts/auth';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  Presentation,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Network,
  LogOut,
  Bell,
  AlertCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

type Theme = 'dark' | 'light' | 'system';

interface SidebarProps {
  activeView: NavItem;
  onNavigate: (view: NavItem) => void;
  collapsed: boolean;
  onToggle: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const navItems = [
  { id: 'home' as NavItem, label: 'Inicio', icon: LayoutDashboard },
  { id: 'clients' as NavItem, label: 'Pipeline de Ventas', icon: Users },
  { id: 'active_clients' as NavItem, label: 'Clientes Activos', icon: Users },
  { id: 'visits' as NavItem, label: 'Visitas Diarias', icon: MapPin },
  { id: 'meetings' as NavItem, label: 'Notas de Reuniones', icon: FileText },
  { id: 'calendar' as NavItem, label: 'Mi Calendario', icon: Calendar },
  { id: 'pitch' as NavItem, label: 'Pitch de Ventas', icon: Presentation },
];

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const themeLabels: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

export default function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
  theme,
  onThemeChange,
}: SidebarProps) {
  const { user, logout, renewalAlerts } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const ThemeIcon = themeIcons[theme];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen bg-card border-r border-border transition-all duration-300 z-40 flex-shrink-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-5 border-b border-border',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 flex-shrink-0">
            <Network className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground leading-tight">DataRed</p>
              <p className="text-xs text-muted-foreground leading-tight">El Salvador</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return collapsed ? (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate(id)}
                    className={cn(
                      'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-150',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className={cn('p-2 border-t border-border space-y-2', collapsed && 'flex flex-col items-center')}>
          {/* Notifications */}
          <div className="relative">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-full flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative"
                  >
                    <Bell className="w-4 h-4" />
                    {renewalAlerts.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{renewalAlerts.length} renovaciones próximas</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative group"
              >
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>Notificaciones</span>
                {renewalAlerts.length > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {renewalAlerts.length}
                  </span>
                )}
              </button>
            )}

            {/* Notification Dropdown */}
            {showNotifications && !collapsed && renewalAlerts.length > 0 && (
              <div className="absolute bottom-full mb-2 left-2 right-2 bg-card border border-border rounded-lg p-3 space-y-2 shadow-lg z-50 max-h-64 overflow-y-auto">
                <p className="text-xs font-semibold text-foreground">Renovaciones próximas:</p>
                {renewalAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-300 truncate">{alert.clientName}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">En {alert.daysUntil} días</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          {user && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', user.avatar_color)}>
                    {user.full_name.charAt(0)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-xs">
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-muted-foreground">{user.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/30">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', user.avatar_color)}>
                  {user.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                </div>
              </div>
            )
          )}

          {/* Theme toggle */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onThemeChange(themeLabels[theme])}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <ThemeIcon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Cambiar tema</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => onThemeChange(themeLabels[theme])}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ThemeIcon className="w-4 h-4 flex-shrink-0" />
              <span>
                {theme === 'light' ? 'Modo Claro' : theme === 'dark' ? 'Modo Oscuro' : 'Sistema'}
              </span>
            </button>
          )}

          {/* Logout */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:bg-red-50/20 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Cerrar sesión</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-red-50/20 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          )}

          {/* Collapse toggle */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggle}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expandir</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onToggle}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span>Contraer menú</span>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
