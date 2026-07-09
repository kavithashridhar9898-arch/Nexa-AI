import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-zinc-400">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-white border-b border-zinc-900 pb-3">
        Terms of Service
      </h1>
      <p className="text-xs sm:text-sm leading-relaxed">
        Last updated: July 9, 2026.
      </p>
      <p className="text-xs sm:text-sm leading-relaxed">
        By accessing Nexus AI, you agree to comply with standard API rate limits (200 requests / 15 minutes per IP) to prevent server overload or billing breaches.
      </p>
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-6">1. Usage Constraints</h3>
      <p className="text-xs sm:text-sm leading-relaxed">
        Do not deploy loops or self-invoking recursive node chains that could degrade the performance of the shared database. Keys violating these guidelines will be revoked instantly.
      </p>
    </div>
  );
};
