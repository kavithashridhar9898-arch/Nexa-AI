import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, apiFetch } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe })
      });

      // Handle 203 unverified user status redirection
      if (data.verified === false) {
        navigate('/verify-otp', { state: { email, type: 'VERIFY_EMAIL' } });
        return;
      }

      // Successful verification
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-3xl p-8 relative shadow-premium-hover">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-white">Welcome back</h2>
          <p className="text-xs text-zinc-500 mt-1">Enter your credentials to access the console.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Password</label>
              <Link 
                to="/forgot-password"
                className="text-[10px] text-violet-500 hover:text-violet-400 font-bold"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-zinc-950 border border-zinc-800 rounded focus:ring-violet-500 text-violet-600"
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-bold text-sm rounded-xl transition-all shadow-glow hover:shadow-glow-strong flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Processing...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500">
          New to Nexus AI?{' '}
          <Link to="/register" className="text-violet-500 hover:text-violet-400 font-bold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};
