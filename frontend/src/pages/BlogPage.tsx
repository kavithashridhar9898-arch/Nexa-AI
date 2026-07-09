import React from 'react';
import { Calendar, User } from 'lucide-react';

export const BlogPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Nexus Blog</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-white leading-tight">
          News, tips and templates.
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">
          Stay updated with engineering metrics, visual nodes tutorials, and AI platform updates.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Securing API credentials with SHA-256', date: 'July 8, 2026', author: 'Elena Rostova', desc: 'A deep-dive on hashing tokens in MySQL/SQLite systems.' },
          { title: 'Orchestrating Claude 3.5 nodes chains', date: 'July 5, 2026', author: 'Sarah Connor', desc: 'How to structure multi-agent logic flows using webhooks.' },
          { title: 'Zero-config local database fallbacks', date: 'June 29, 2026', author: 'Lucas Miller', desc: 'Shipping hybrid MySQL & SQLite pools in dev codebases.' }
        ].map((post, i) => (
          <div key={i} className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl overflow-hidden hover:border-violet-500/20 transition-all">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">{post.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{post.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
