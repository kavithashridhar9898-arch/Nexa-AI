import React from 'react';
import { Shield, Users, Heart, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Our Vision</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-white leading-tight">
          Automate operations. Accelerate engineering.
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">
          At Nexus AI, we are building the orchestration layer for the future of artificial intelligence. We believe that visual workflow builder networks make software integrations accessible, fast, and extremely secure.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Shield, title: 'Cryptographic Security', desc: 'Secure hashing, full secrets encryption, and granular access controls.' },
          { icon: Users, title: 'Collaborative Work', desc: 'Designed for enterprise environments, support teams, and dev sprints.' },
          { icon: Heart, title: 'Developer First', desc: 'Dual MySQL and zero-config SQLite fallback modes built directly.' },
          { icon: Award, title: 'Premium Aesthetics', desc: 'Vibrant gradients, 60 FPS transitions, and Apple-level UX designs.' }
        ].map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={i} className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
