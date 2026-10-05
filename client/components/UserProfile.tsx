'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LogOut, ShieldCheck, User as UserIcon, Sparkles } from 'lucide-react';
import { User } from '../types/auth';

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<void>;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Compute initials for avatar fallback
  const initials = (user.firstName.charAt(0) + (user.lastName?.charAt(0) || '')).toUpperCase();

  return (
    <div className="flex flex-col items-center justify-between min-h-[85vh] px-4 py-6 w-full max-w-[390px] mx-auto select-none">
      {/* Top Banner / System Tag */}
      <div className="w-full flex items-center justify-between py-2 px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Rewards Platform</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{user.status}</span>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="w-full my-auto">
        <div className="relative p-6 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900/80 to-slate-950/90 border border-purple-800/30 backdrop-blur-xl shadow-2xl shadow-purple-950/50 flex flex-col items-center text-center">
          {/* Subtle top light gradient effect */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

          {/* User Avatar */}
          <div className="relative mb-5">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 blur-sm opacity-60" />
            <div className="relative w-24 h-24 rounded-full p-1 bg-slate-900 border-2 border-purple-400/60 overflow-hidden flex items-center justify-center shadow-lg">
              {user.avatarUrl && !imageError ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.firstName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl tracking-wider">
                  {initials || <UserIcon className="w-10 h-10 text-purple-200" />}
                </div>
              )}
            </div>
            {/* Verified Badge */}
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 text-white shadow-md border-2 border-slate-900">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Welcome Message & Name */}
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">
            👋 Welcome, {user.firstName}
          </h1>

          {/* Username */}
          {user.username ? (
            <p className="text-sm font-medium text-purple-400 mb-3">
              @{user.username}
            </p>
          ) : (
            <p className="text-sm font-medium text-slate-400 mb-3">
              {user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName}
            </p>
          )}

          {/* Authentication Confirmation Message */}
          <div className="w-full py-2.5 px-4 rounded-2xl bg-purple-950/50 border border-purple-600/20 text-xs text-purple-200 font-medium mb-5">
            You are successfully authenticated.
          </div>

          {/* Telegram Metadata Details */}
          <div className="w-full space-y-2 pt-2 border-t border-purple-900/30 text-left text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Telegram ID</span>
              <span className="font-mono text-purple-200 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40">
                {user.telegramId}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Account Status</span>
              <span className="text-emerald-400 font-medium">{user.status}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Session Security</span>
              <span className="text-purple-300 font-medium">HTTP-Only Cookie</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Action Button */}
      <div className="w-full pt-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-900/80 hover:bg-red-950/30 border border-slate-800 hover:border-red-800/50 text-slate-300 hover:text-red-300 active:scale-[0.98] transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
        </button>
      </div>
    </div>
  );
};
