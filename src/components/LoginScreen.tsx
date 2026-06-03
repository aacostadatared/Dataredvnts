import { useState } from 'react';
import { useAuth } from '../contexts/auth';
import { Network, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function LoginScreen() {
  const { loginStep, currentEmail, verifyOTP, completeOnboarding } = useAuth();
  const [email, setEmail] = useState('andres@datared.com');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    setError('');
    // In demo, we just proceed. In production, send OTP via email
    setOtpSent(true);
    setLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    const success = await verifyOTP(email, otp);
    if (!success) {
      setError('Código inválido. Demo: 123456 o 000000');
    }
    setLoading(false);
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !role.trim()) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    const success = await completeOnboarding(fullName, role);
    if (!success) {
      setError('Error al completar el registro. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
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
          {/* STEP 1: EMAIL */}
          {loginStep === 'email' && !otpSent && (
            <>
              <div className="text-center space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-white">Acceso Seguro</h2>
                <p className="text-slate-400 text-sm">Ingresa tu correo para continuar</p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Demo: andres@datared.com</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Continuar
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">Sistema seguro de DataRed El Salvador</p>
              </div>
            </>
          )}

          {/* STEP 2: OTP */}
          {(loginStep === 'email' || loginStep === 'otp') && otpSent && (
            <>
              <div className="text-center space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-white">Verificación</h2>
                <p className="text-slate-400 text-sm">Ingresa el código de 6 dígitos</p>
                <p className="text-xs text-slate-500 mt-2">{email}</p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">Código de Verificación</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="pl-9 text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Demo: 123456 o 000000</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verificar
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  className="w-full py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
                >
                  ← Volver
                </button>
              </form>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">Sistema seguro de DataRed El Salvador</p>
              </div>
            </>
          )}

          {/* STEP 3: ONBOARDING */}
          {loginStep === 'onboarding' && (
            <>
              <div className="text-center space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-white">Bienvenido a DataRed</h2>
                <p className="text-slate-400 text-sm">Completa tu perfil para continuar</p>
                <p className="text-xs text-slate-500 mt-2">{currentEmail}</p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleOnboarding} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">Nombre Completo *</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">Cargo/Rol *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Seleccionar cargo</option>
                    <option value="Asesor Corporativo">Asesor Corporativo</option>
                    <option value="Jefa de Ventas">Jefa de Ventas</option>
                    <option value="Ingeniero de Sistemas">Ingeniero de Sistemas</option>
                    <option value="Ejecutivo de Cuenta">Ejecutivo de Cuenta</option>
                    <option value="Gerente de Proyectos">Gerente de Proyectos</option>
                    <option value="Especialista Técnico">Especialista Técnico</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Completar Registro
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">Tu información está protegida</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
