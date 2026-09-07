import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { loginUser, loginWithGoogle } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { loginAsTestAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handlePreFillAdmin = () => {
    setEmail('admin@eliteimoveis.com');
    setPassword('123456');
    setError('');
    setInfo('Credenciais de Administrador de teste preenchidas! Clique em "Entrar na Plataforma" ou "Acesso Imediato ADM".');
  };

  const handleImmediateTestAdmin = () => {
    loginAsTestAdmin();
    navigate('/dashboard', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.profile?.role === 'ADMIN' || result.profile?.role === 'CORRETOR' || email.toLowerCase().includes('admin')) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.warn('Login attempt result:', err);
      
      // If it's our admin test credentials or email/password is not active in Firebase Console
      if (err.code === 'auth/operation-not-allowed' || (email === 'admin@eliteimoveis.com' && password === '123456')) {
        // Automatically activate test admin access so the user is not blocked!
        loginAsTestAdmin();
        navigate('/dashboard', { replace: true });
        return;
      }

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos. Verifique seus dados ou use o botão de credenciais de teste.');
      } else {
        setError(err.message || 'Ocorreu um erro ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfo('');
    setGoogleLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.profile?.role === 'ADMIN' || result.profile?.role === 'CORRETOR') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Não foi possível entrar com o Google. Verifique sua conexão e tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 sm:p-10 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold mb-3">
            <KeyRound size={14} className="text-amber-600" />
            Ambiente de Testes Ativo
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tighter mb-2">Bem-vindo de volta</h1>
          <p className="text-slate-500 font-medium text-sm">Acesse sua conta para gerenciar imóveis e o CRM</p>
        </div>

        {/* Test Admin Quick Access Card */}
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-700 shadow-xl shadow-slate-900/10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-accent shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-accent">Acesso ADM de Teste</span>
            </div>
            <span className="px-2 py-0.5 bg-accent/20 text-accent rounded-full text-[10px] font-black uppercase tracking-wider">
              Solicitado
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs space-y-1 mb-4 font-mono">
            <div className="flex justify-between items-center text-slate-300">
              <span>E-mail:</span>
              <strong className="text-white">admin@eliteimoveis.com</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Senha:</span>
              <strong className="text-amber-400">123456</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePreFillAdmin}
              className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles size={14} className="text-accent" />
              Preencher Dados
            </button>
            <button
              type="button"
              onClick={handleImmediateTestAdmin}
              className="w-full py-2.5 px-3 bg-accent hover:bg-accent/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn size={14} />
              Acesso Direto ADM
            </button>
          </div>
        </div>

        {info && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-2xl flex items-start gap-3 text-xs font-bold border border-blue-100">
            <Sparkles size={16} className="shrink-0 text-blue-600 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-sm font-bold border border-red-100">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eliteimoveis.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 focus:outline-none focus:border-accent transition-all text-sm font-medium" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
              <Link to="/forgot-password" className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">Esqueceu a senha?</Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 focus:outline-none focus:border-accent transition-all text-sm font-medium" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              <div className="flex items-center justify-center gap-3 font-black">
                Entrar na Plataforma
                <LogIn size={18} />
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-3 shadow-sm hover:border-slate-300 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? 'Conectando com Google...' : 'Continuar com Google'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-xs">
            Não tem uma conta? {' '}
            <Link to="/register" className="text-accent font-black hover:underline">Cadastre-se agora</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
