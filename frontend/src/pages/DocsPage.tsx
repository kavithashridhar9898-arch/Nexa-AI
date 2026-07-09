import React from 'react';
import { Terminal, Shield, HelpCircle } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Navigation */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-display">Developer Docs</h4>
        <ul className="space-y-2.5 text-xs text-zinc-500 font-semibold">
          <li><a href="#quickstart" className="text-violet-500 hover:text-violet-400">Quick Start</a></li>
          <li><a href="#auth" className="hover:text-white transition-colors">API Authorization</a></li>
          <li><a href="#workflows" className="hover:text-white transition-colors">Nodes configuration</a></li>
        </ul>
      </div>

      {/* Content */}
      <div className="lg:col-span-3 space-y-12">
        
        {/* Section 1 */}
        <section id="quickstart" className="space-y-4">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-white border-b border-zinc-900 pb-3">
            Quick Start Guide
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Nexus AI allows you to construct visual cron intervals or webhook listeners to trigger automation steps. Connect variables across node edges dynamically.
          </p>
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[11px] text-zinc-400 leading-relaxed">
            # Run dev environment<br />
            git clone https://github.com/nexus/app.git<br />
            npm install && npm run dev
          </div>
        </section>

        {/* Section 2 */}
        <section id="auth" className="space-y-4">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-white border-b border-zinc-900 pb-3">
            API Authorization
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Keys are generated under the Console API Keys settings tab. Every key is prefixed with `nx_live_` and fully SHA-256 hashed. Pass it in Authorization headers:
          </p>
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[11px] text-zinc-400">
            Authorization: Bearer nx_live_abc123...
          </div>
        </section>

      </div>

    </div>
  );
};
