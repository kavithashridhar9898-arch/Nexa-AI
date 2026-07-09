import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-zinc-400">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-white border-b border-zinc-900 pb-3">
        Privacy Policy
      </h1>
      <p className="text-xs sm:text-sm leading-relaxed">
        Last updated: July 9, 2026.
      </p>
      <p className="text-xs sm:text-sm leading-relaxed">
        Nexus AI respects your privacy. We fully encrypt dashboard parameters, environment secrets, and credentials records. No plaintext passwords or tokens are stored in our MySQL/SQLite server clusters.
      </p>
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-6">1. Data Storage</h3>
      <p className="text-xs sm:text-sm leading-relaxed">
        UserData (name, email, hashes) is persisted to support verification emails (Nodemailer OTP) and JWT sessions. You can delete your account at any time by contacting our support network.
      </p>
    </div>
  );
};
