import React, { useState } from "react";
import { usePWAInstall } from "./usePWAInstall";
import { Download, Smartphone, X, CheckCircle2, Share } from "lucide-react";

interface PWAInstallButtonProps {
  variant?: "header" | "full" | "minimal";
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "header",
  onInstalled,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone PWA mode, don't show prompt
  if (isInstalled) {
    if (variant === "full") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/20 text-[#00f5ff] text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#00f5ff]" />
          <span>App Installed · Standalone Mode</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        if (onInstalled) onInstalled();
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Ambient guide for desktop or unsupported browsers
      alert("To install Vox MusicGen, click the Install icon in your browser URL bar or select 'Add to Home screen' from your browser menu.");
    }
  };

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="h-8 px-2.5 rounded-lg border border-[#00f5ff]/40 bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 text-[#00f5ff] hover:text-white flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(0,245,255,0.15)] active:scale-95"
          title="Install Vox MusicGen Native App"
        >
          <Download className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">INSTALL APP</span>
        </button>
      ) : variant === "minimal" ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-8 h-8 rounded-lg border border-[#00f5ff]/30 bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 text-[#00f5ff] flex items-center justify-center transition-all cursor-pointer"
          title="Install App"
        >
          <Download className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00f5ff]/20 to-[#8b5cf6]/20 border border-[#00f5ff]/40 hover:border-[#00f5ff]/80 text-white flex items-center justify-between text-xs font-mono font-bold transition-all duration-200 cursor-pointer group shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#00f5ff] group-hover:scale-110 transition-transform" />
            <span>Install Native PWA</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00f5ff]/20 text-[#00f5ff] uppercase">
            {isIOS ? "iOS Safari" : "Fast Launch"}
          </span>
        </button>
      )}

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#080918] border border-[#00f5ff]/30 p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-dim hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/30 flex items-center justify-center text-[#00f5ff]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-white text-sm uppercase tracking-wide">
                  Install on iOS
                </h3>
                <p className="text-[10px] font-mono text-dim">Add Vox MusicGen to Home Screen</p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-secondary mb-5">
              <li className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#00f5ff]/20 text-[#00f5ff] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>
                  Tap the <strong className="text-white flex items-center gap-1 inline-flex"><Share className="w-3.5 h-3.5 text-[#00f5ff]" /> Share</strong> icon in your Safari bottom navigation bar.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#00f5ff]/20 text-[#00f5ff] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>
                  Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#00f5ff]/20 text-[#00f5ff] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>
                  Tap <strong className="text-[#00f5ff]">Add</strong> in the top-right corner to launch fullscreen anytime!
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Success notification if installed */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 rounded-xl bg-[#10ffb0] text-[#03030e] font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Vox MusicGen added to device!</span>
        </div>
      )}
    </>
  );
};
