import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserProfile = {
  username: string;
  name: string;
  email: string;
  color: string;
};

const users: Record<string, UserProfile> = {
  andres: { username: 'andres', name: 'Andrés', email: 'andres@datared.com', color: 'bg-blue-500' },
  jefa: { username: 'jefa', name: 'Jefa', email: 'jefa@datared.com', color: 'bg-purple-500' },
  ingeniero: { username: 'ingeniero', name: 'Ingeniero', email: 'ingeniero@datared.com', color: 'bg-emerald-500' },
};

interface AuthContextType {
  user: UserProfile | null;
  login: (username: string) => void;
  logout: () => void;
  allUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('datared-user');
    if (saved && users[saved]) {
      setUser(users[saved]);
    }
  }, []);

  function login(username: string) {
    if (users[username]) {
      setUser(users[username]);
      localStorage.setItem('datared-user', username);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('datared-user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, allUsers: Object.values(users) }}>
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
