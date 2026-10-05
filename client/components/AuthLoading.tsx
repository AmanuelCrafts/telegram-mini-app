'use client';

import React from 'react';
import { Lock } from 'lucide-react';

export const AuthLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center select-none">
      <div className="relative mb-8 flex items-center justify-center">
        {/* Glow halo */}
        <div className="absolute w-28 h-28 bg-purple-600/30 rounded-full blur-2xl animate-pulse" />
        
        {/* Outer animated ring */}
        <div className="relative w-20 h-20 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin flex items-center justify-center bg-slate-900/60 backdrop-blur-md shadow-xl shadow-purple-950/50">
          <Lock className="w-8 h-8 text-purple-300 animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-3xl mb-1">🔐</div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Signing you in...
        </h2>
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          Verifying secure Telegram credentials with backend servers
        </p>
      </div>

      {/* Progress dots animation */}
      <div className="flex items-center gap-1.5 mt-8">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
        <span className="w-2 h-2 rounded-full bg-purple-400 opacity-75" />
        <span className="w-2 h-2 rounded-full bg-purple-300 opacity-50" />
      </div>
    </div>
  );
};
