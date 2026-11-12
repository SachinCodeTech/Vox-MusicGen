import React from "react";
import { useOnlineStatus } from "./usePWAInstall";
import { WifiOff } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] flex items-center gap-2.5 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-mono font-bold text-black shadow-2xl border border-amber-300 animate-pulse">
      <WifiOff className="w-4 h-4 text-black shrink-0" />
      <span>Offline Mode — Studio working from cached assets.</span>
    </div>
  );
};
