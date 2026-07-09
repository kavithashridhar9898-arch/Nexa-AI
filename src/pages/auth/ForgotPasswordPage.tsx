import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { apiFetch } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await apiFetch('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, type: 'RESET_PASSWORD' })
      });

      setSuccess('Reset code sent successfully. Redirecting to verification...');
      
      setTimeout(() => {
        navigate('/verify-otp', { state: { email, type: 'RESET_PASSWORD' } });
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to request reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-3xl p-8 relative shadow-premium-hover">
        
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-white">Recover Password</h2>
          <p className="text-xs text-zinc-500 mt-1">We will send a 6-digit OTP to reset your password.</p>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-bold text-sm rounded-xl transition-all shadow-glow hover:shadow-glow-strong flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Remember credentials?{' '}
          <Link to="/login" className="text-violet-500 hover:text-violet-400 font-bold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};
