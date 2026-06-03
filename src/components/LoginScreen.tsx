import { useAuth } from '../contexts/auth';
import { Network } from 'lucide-react';

export default function LoginScreen() {
  const { login, allUsers } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/50">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">DataRed</h1>
          <p className="text-blue-200 text-sm mt-1">Centro de Operaciones CRM</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
            <p className="text-slate-400 text-sm">Selecciona tu usuario para continuar</p>
          </div>

          <div className="space-y-3">
            {allUsers.map((user) => {
              const colorClass = user.color;
              return (
                <button
                  key={user.username}
                  onClick={() => login(user.username)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-200 hover:bg-slate-800/50 group`}
                >
                  <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">Sistema seguro de DataRed El Salvador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
