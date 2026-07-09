import React from 'react';
import { GitBranch, Key, Cpu, Zap, Activity, MessageSquare } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Capabilities</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-white leading-tight">
          Visual orchestration, refined.
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">
          Everything you need to automate workflows at scale. Discover the modules driving the Nexus ecosystem.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: GitBranch, title: 'Visual Node canvas', desc: 'Drag trigger blocks, condition splits, and execution targets.' },
          { icon: Cpu, title: 'AI Orchestrator', desc: 'Deploy GPT-4 and Claude 3.5 nodes to extract metadata and write responses.' },
          { icon: Zap, title: 'Instant Telemetry', desc: 'Execute processes in less than 200ms with real-time logs parsing.' },
          { icon: Key, title: 'Developer Credentials', desc: 'SHA-256 hashed API credentials, with scopes like read/write.' },
          { icon: Activity, title: 'Operational Logs', desc: 'Check worker utilization ratios and telemetry charts.' },
          { icon: MessageSquare, title: 'Multi-channel Alerts', desc: 'Dispatch SLA warnings to email channels or Slack channels.' }
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
