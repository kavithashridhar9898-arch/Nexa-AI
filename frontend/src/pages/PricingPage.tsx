import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Plans</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-white leading-tight">
          Flexible plans for any scale.
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">
          Start prototyping workflows for free. Upgrade as your team automates production loads.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          { name: 'Developer', price: '$0', desc: 'Best for visual prototyping.', features: ['5 Workflows', '100 runs/month', 'SQLite database sync'] },
          { name: 'Professional', price: '$49', desc: 'Advanced AI and live triggers.', features: ['Unlimited Workflows', '10,000 runs/month', 'GPT-4 smart nodes', 'Custom webhooks keys'] },
          { name: 'Enterprise', price: 'Custom', desc: 'Secure nodes and dedicated pools.', features: ['Dedicated MySQL instance', 'SLA contracts', 'Granular IAM scopes', '24/7 hotline'] }
        ].map((p, i) => (
          <div key={i} className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-3xl p-8 flex flex-col justify-between h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display font-black text-3xl text-zinc-900 dark:text-white">{p.price}</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">{p.desc}</p>
              
              <ul className="mt-6 space-y-3">
                {p.features.map((f, idx) => (
                  <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-violet-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full py-2.5 text-center text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-glow mt-6"
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
};
