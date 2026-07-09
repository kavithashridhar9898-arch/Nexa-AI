import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const CareersPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Careers</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-white leading-tight">
          Shape the future of orchestration.
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">
          Help us build premium, high-performance visual workflow tools for developers globally.
        </p>
      </div>

      {/* Postings */}
      <div className="max-w-3xl mx-auto space-y-4">
        {[
          { title: 'Staff Full Stack Engineer', team: 'Platform & Database Systems', location: 'San Francisco, CA / Remote' },
          { title: 'Senior UI/UX & Motion Designer', team: 'Design & Interaction Graphics', location: 'London, UK / Remote' },
          { title: 'Developer Relations Advocate', team: 'Developer Communities', location: 'Remote (Global)' }
        ].map((job, i) => (
          <div key={i} className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl p-6 flex justify-between items-center hover:border-violet-500/20 transition-all cursor-pointer">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">{job.title}</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">{job.team} • {job.location}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-500" />
          </div>
        ))}
      </div>

    </div>
  );
};
