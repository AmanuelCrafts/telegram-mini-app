'use client';

import React from 'react';
import { Smartphone, Send } from 'lucide-react';

export const NonTelegramAccess: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center select-none">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute w-28 h-28 bg-purple-600/20 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-900/60 to-slate-900/80 border border-purple-500/30 flex items-center justify-center shadow-xl shadow-purple-950/40">
          <Smartphone className="w-10 h-10 text-purple-400" />
        </div>
      </div>

      <div className="space-y-3 mb-8 max-w-xs">
        <div className="text-3xl">📱</div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Open in Telegram
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          This app must be opened through Telegram.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Open your Telegram messenger on mobile or desktop and launch the bot to access your secure rewards profile.
        </p>
      </div>

      <div className="w-full max-w-xs p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-left">
        <div className="flex items-center gap-2.5 text-xs text-purple-300 font-semibold mb-1">
          <Send className="w-3.5 h-3.5" />
          <span>How to launch:</span>
        </div>
        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
          <li>Open the Telegram bot</li>
          <li>Tap the &ldquo;Start App&rdquo; or menu button</li>
          <li>Enjoy seamless authentication</li>
        </ol>
      </div>
    </div>
  );
};
