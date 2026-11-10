import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 text-amber-300 px-4 py-2.5 text-xs font-semibold shadow-2xl border border-amber-500/30 backdrop-blur-xs animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Mode Luring (Offline) — Menampilkan data lokal yang tersimpan.</span>
    </div>
  );
};
