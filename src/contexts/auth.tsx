import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_color: string;
  is_onboarded: boolean;
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginStep: 'email' | 'otp' | 'onboarding' | 'authenticated';
  currentEmail: string;
  verifyOTP: (email: string, code: string) => Promise<boolean>;
  completeOnboarding: (fullName: string, role: string) => Promise<boolean>;
  logout: () => void;
  renewalAlerts: Array<{ clientName: string; daysUntil: number }>;
  allUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock OTP for demo (in production, this would be sent via email)
const DEMO_OTP = '123456';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginStep, setLoginStep] = useState<'email' | 'otp' | 'onboarding' | 'authenticated'>('email');
  const [currentEmail, setCurrentEmail] = useState('');
  const [renewalAlerts, setRenewalAlerts] = useState<Array<{ clientName: string; daysUntil: number }>>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    async function checkExistingSession() {
      // Fetch all users for dropdown
      const { data: users } = await supabase.from('user_profiles').select('*');
      if (users) setAllUsers(users);

      const sessionStr = localStorage.getItem('datared-session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.user && session.user.email) {
          // Try to fetch from DB
          const { data } = await supabase.from('user_profiles').select('*').eq('email', session.user.email).maybeSingle();
          if (data) {
            setUser(data);
            setLoginStep('authenticated');
            await fetchRenewalAlerts(data.email);
          } else {
            localStorage.removeItem('datared-session');
            setLoginStep('email');
          }
        }
      }
      setLoading(false);
    }
    checkExistingSession();
  }, []);

  async function fetchRenewalAlerts(_email: string) {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: clients } = await supabase
      .from('active_clients')
      .select('id, company_name, renewal_date');

    if (clients) {
      const alerts = clients
        .filter(c => {
          if (!c.renewal_date) return false;
          const renewalDate = new Date(c.renewal_date);
          return renewalDate <= thirtyDaysLater && renewalDate >= today;
        })
        .map(c => ({
          clientName: c.company_name,
          daysUntil: Math.ceil((new Date(c.renewal_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        }));
      setRenewalAlerts(alerts);
    }
  }

  async function verifyOTP(email: string, code: string): Promise<boolean> {
    // Demo: accept hardcoded OTP
    if (code === DEMO_OTP || code === '000000') {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        // User exists and is onboarded
        setUser(existingUser);
        localStorage.setItem('datared-session', JSON.stringify({ user: existingUser }));
        setLoginStep('authenticated');
        await fetchRenewalAlerts(email);
        return true;
      } else {
        // First time user - go to onboarding
        setCurrentEmail(email);
        setLoginStep('onboarding');
        return true;
      }
    }
    return false;
  }

  async function completeOnboarding(fullName: string, role: string): Promise<boolean> {
    if (!currentEmail || !fullName.trim() || !role.trim()) return false;

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-pink-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        email: currentEmail,
        full_name: fullName,
        role: role,
        avatar_color: color,
        is_onboarded: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Onboarding error:', error);
      return false;
    }

    if (data) {
      setUser(data);
      localStorage.setItem('datared-session', JSON.stringify({ user: data }));
      setLoginStep('authenticated');
      await fetchRenewalAlerts(currentEmail);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    setLoginStep('email');
    setCurrentEmail('');
    setRenewalAlerts([]);
    localStorage.removeItem('datared-session');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginStep,
        currentEmail,
        verifyOTP,
        completeOnboarding,
        logout,
        renewalAlerts,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
