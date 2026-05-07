import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const GOOGLE_CLIENT_ID = '302026490035-6u8uc3hjsuvq2vo32q7ujkr8cju8314e.apps.googleusercontent.com';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        window.history.replaceState({}, '', '/login');
        setGoogleLoading(true);
        googleLogin(token)
          .then(() => navigate('/'))
          .catch(() => setError('Google login failed, please try again'))
          .finally(() => setGoogleLoading(false));
      }
    }
  }, [googleLogin, navigate]);

  function handleGoogleLogin() {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin + '/login',
      response_type: 'token',
      scope: 'openid email profile',
      prompt: 'consent',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try { 
      await login(email, password); 
      navigate('/'); 
    }
    catch (err: any) { 
      setError(err.message || 'Login failed'); 
    }
    finally { 
      setLoading(false); 
    }
  }

  if (googleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-500 font-medium">Authorizing with Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-50">
      {/* Decorative Background Orbs (matching index.css tokens) */}
      <div className="mesh-orb-1 opacity-60" />
      <div className="mesh-orb-2 opacity-50" />

      {/* Left side: Hero/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 animate-gradient">
        {/* Background image layer with parallax feel */}
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay scale-110 transition-transform duration-[10s] animate-slow-zoom" style={{ backgroundImage: "url('/sports-hero-bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-transparent to-teal-800/30" />
        
        {/* Floating blobs for depth */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply opacity-20 animate-blob" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply opacity-20 animate-blob" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 mb-10 animate-float shadow-2xl">
            <Activity className="h-12 w-12 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight drop-shadow-sm">SportsCentre</h1>
          <p className="text-teal-50/90 text-xl leading-relaxed font-medium">Elevate your game. Book elite facilities, connect with partners, and master your fitness journey.</p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {['Smart Booking', 'Pro Community', 'Live Analytics'].map(f => (
              <span key={f} className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-sm font-bold text-white/95 shadow-sm">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md animate-slide-up relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-glow-lg">
              <Activity className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-teal-700 to-cyan-800 bg-clip-text text-transparent">SportsCentre</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-lg">Your elite training session starts here.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 text-sm rounded-2xl flex items-center gap-3 animate-shake">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Google Login */}
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-soft-lg transition-all text-sm font-bold text-slate-700 mb-8 shadow-soft group">
            <svg width="22" height="22" viewBox="0 0 48 48" className="group-hover:scale-110 transition-transform duration-300"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200/60" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">or elite access</span>
            <div className="flex-1 h-px bg-slate-200/60" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all shadow-inner-soft outline-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" title="Coming soon" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all shadow-inner-soft outline-none" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors p-1">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-700 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-cyan-800 disabled:opacity-50 transition-all text-sm shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 group transform active:scale-[0.98]">
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-slate-500">
            New to the platform? <Link to="/register" className="text-teal-600 font-bold hover:text-teal-700 underline underline-offset-4 decoration-teal-500/30">Create an elite account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
