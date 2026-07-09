import React from 'react';
import { Sparkles, MessageSquare, Github, Mail, CreditCard, BookOpen } from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Connectors</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-white leading-tight">
          Connect your stack.
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">
          Nexus connects to the APIs, database channels, and notification clients you use daily.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Sparkles, title: 'OpenAI GPT-4', desc: 'Synthesize data and parse inputs.' },
          { icon: MessageSquare, title: 'Slack Messaging', desc: 'Dispatch SLA warnings directly to channels.' },
          { icon: Github, title: 'GitHub Actions', desc: 'Trigger deploy hooks on branch commits.' },
          { icon: Mail, title: 'Gmail Transporter', desc: 'Deliver custom responders and reports.' },
          { icon: CreditCard, title: 'Stripe Billings', desc: 'Capture payment events webhooks.' },
          { icon: BookOpen, title: 'Notion Database', desc: 'Append telemetry rows straight to workspace pages.' }
        ].map((int, i) => {
          const Icon = int.icon;
          return (
            <div key={i} className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl p-6 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{int.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{int.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
