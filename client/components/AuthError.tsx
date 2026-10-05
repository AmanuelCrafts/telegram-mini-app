'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface AuthErrorProps {
  error?: string | null;
  onRetry: () => void;
}

export const AuthError: React.FC<AuthErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center select-none">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute w-24 h-24 bg-red-600/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
      </div>

      <div className="space-y-3 mb-8 max-w-xs">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Authentication failed
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {error || 'Unable to verify your Telegram account.'}
        </p>
        <p className="text-xs text-slate-500">
          Please check your connection and ensure you are launching through Telegram.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
