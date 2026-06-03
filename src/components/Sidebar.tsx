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
  const { user, logout } = useAuth();
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
        <div className={cn('p-2 border-t border-border space-y-1', collapsed && 'flex flex-col items-center')}>
          {/* User Profile */}
          {user && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', user.color)}>
                    {user.name.charAt(0)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', user.color)}>
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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
