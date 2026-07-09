import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 relative select-none">
      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 space-y-6">
        
        {/* Warning Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
          <AlertTriangle className="w-4.5 h-4.5 text-violet-400" />
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase font-mono">
            Error 404
          </span>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl text-zinc-900 dark:text-white leading-tight">
          Lost in Orbit
        </h1>

        <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          The page you are looking for does not exist, has been removed, or has moved to another scope.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-full shadow-glow hover:shadow-glow-strong hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back Home
          </Link>
          <Link
            to="/docs"
            className="px-6 py-3 bg-transparent hover:bg-zinc-900/10 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 font-bold text-sm rounded-full transition-all"
          >
            Search Docs
          </Link>
        </div>

      </div>
    </div>
  );
};
