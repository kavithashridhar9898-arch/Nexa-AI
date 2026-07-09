import React from 'react';
import { Settings, User, CreditCard, Sparkles, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-xl md:text-2xl text-white">Account Settings</h2>
        <p className="text-xs text-zinc-500 mt-1">Manage credentials, interface preferences, and subscriptions.</p>
      </div>

      {/* Profile Section */}
      <div className="glass-panel border border-zinc-900 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-3">
          <User className="w-4 h-4 text-violet-400" /> Personal Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="w-full mt-1 px-4 py-2 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full mt-1 px-4 py-2 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Theme preferences */}
      <div className="glass-panel border border-zinc-900 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Settings className="w-4 h-4 text-violet-400" /> Interface Preferences
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Color System</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Toggle light mode or premium Vercel-style dark backgrounds.</p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 text-zinc-200 rounded-xl text-xs font-bold transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Theme
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-violet-400" /> Dark Theme
              </>
            )}
          </button>
        </div>
      </div>

      {/* Billing Tier */}
      <div className="glass-panel border border-zinc-900 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-3">
          <CreditCard className="w-4 h-4 text-violet-400" /> Subscription & Usage
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-violet-400 border border-violet-500/20 bg-violet-600/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Free Developer Tier
            </span>
            <h4 className="text-xs font-bold text-white mt-2">Active Plan: Developer Basic</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Limited to 5 active workflows and 100 runs per month.</p>
          </div>

          <button
            onClick={() => alert('Billing integrations are mock setup.')}
            className="flex items-center gap-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-glow hover:shadow-glow-strong transition-all"
          >
            Upgrade Plan <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
