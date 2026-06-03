import { useState } from 'react';
import { useAuth, AuthProvider } from './contexts/auth';
import { useTheme } from './hooks/use-theme';
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import Homepage from './components/views/Homepage';
import PipelineView from './components/views/PipelineView';
import DailyVisitsView from './components/views/DailyVisitsView';
import MeetingNotesView from './components/views/MeetingNotesView';
import SalesPitchView from './components/views/SalesPitchView';
import CalendarView from './components/views/CalendarView';

export type NavItem = 'home' | 'clients' | 'visits' | 'meetings' | 'pitch' | 'calendar';

function AppContent() {
  const [activeView, setActiveView] = useState<NavItem>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          {activeView === 'home' && <Homepage onNavigate={setActiveView} />}
          {activeView === 'clients' && <PipelineView />}
          {activeView === 'visits' && <DailyVisitsView />}
          {activeView === 'meetings' && <MeetingNotesView />}
          {activeView === 'pitch' && <SalesPitchView />}
          {activeView === 'calendar' && <CalendarView />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
