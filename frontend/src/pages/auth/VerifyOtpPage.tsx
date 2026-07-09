import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const VerifyOtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, apiFetch } = useAuth();

  // Retrieve state or fallback
  const stateEmail = location.state?.email || '';
  const type = location.state?.type || 'VERIFY_EMAIL';

  const [email, setEmail] = useState(stateEmail);
  const [code, setCode] = useState('');
  
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (code.length !== 6 || isNaN(Number(code))) {
      setError('Please enter a valid 6-digit numerical code.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code, type })
      });

      if (type === 'VERIFY_EMAIL') {
        setSuccess('Account verified successfully! Logging you in...');
        
        // Confetti effect
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          login(data.token, data.user);
          navigate('/dashboard');
        }, 1500);

      } else {
        // For reset password, pass verification data
        navigate('/reset-password', { state: { email, code } });
      }

    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await apiFetch('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, type })
      });
      setSuccess('Verification OTP code resent successfully.');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-3xl p-8 relative shadow-premium-hover">
        
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-white">Verify Code</h2>
          <p className="text-xs text-zinc-500 mt-1">
            We sent a 6-digit OTP code to <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
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
          
          {!stateEmail && (
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-2.5 mt-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full mt-1 text-center tracking-[12px] font-mono text-xl py-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-violet-500/50 rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-600/30"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-bold text-sm rounded-xl transition-all shadow-glow hover:shadow-glow-strong flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-1">
          Didn't receive code?{' '}
          <button
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className="text-violet-500 hover:text-violet-400 disabled:text-zinc-600 font-bold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading && !code ? 'animate-spin' : ''}`} /> 
            {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
          </button>
        </div>

      </div>
    </div>
  );
};
