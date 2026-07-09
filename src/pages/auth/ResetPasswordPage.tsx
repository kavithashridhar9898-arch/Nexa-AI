import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiFetch } = useAuth();

  const email = location.state?.email || '';
  const code = location.state?.code || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If accessed directly without verification state, redirect to forgot password
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, password })
      });

      setSuccess('Password updated successfully. Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-3xl p-8 relative shadow-premium-hover">
        
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-white">Reset Password</h2>
          <p className="text-xs text-zinc-500 mt-1">Setup your new account access credentials.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Confirm Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-bold text-sm rounded-xl transition-all shadow-glow hover:shadow-glow-strong flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Updating...' : 'Update Password'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
