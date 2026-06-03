import { useAuth } from '../../contexts/auth';
import { Calendar, Lock } from 'lucide-react';

export default function CalendarView() {
  const { user } = useAuth();

  const calendarUrls: Record<string, string> = {
    'andres@datared.com': 'https://calendar.google.com/calendar/embed?src=andres@datared.com',
    'ana@datared.com': 'https://calendar.google.com/calendar/embed?src=ana@datared.com',
    'ingeniero@datared.com': 'https://calendar.google.com/calendar/embed?src=ingeniero@datared.com',
  };

  const calendarUrl = user ? calendarUrls[user.email] : '';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mi Calendario</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Calendario personal de {user?.full_name} — Outlook Web
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Seguro</span>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={calendarUrl}
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
          }}
          title="Mi Calendario"
        />
      </div>
    </div>
  );
}
