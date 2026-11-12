import React from "react";
import { Keyboard, X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", desc: "Toggle Master Audio Playback / Pause" },
    { key: "T", desc: "Open Tap Tempo / Tap BPM counter" },
    { key: "R", desc: "Toggle Vocal Microphone Recording" },
    { key: "M", desc: "Mute / Unmute Drums Stem" },
    { key: "S", desc: "Quick Jump to Audio Studio" },
    { key: "C", desc: "Quick Jump to AI Creator" },
    { key: "Esc", desc: "Close any modal, drawer, or dialog" },
    { key: "?", desc: "Open this Keyboard Shortcuts cheat sheet" },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#080918] border border-[#00f5ff]/30 p-6 shadow-2xl relative text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-dim hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/30 flex items-center justify-center text-[#00f5ff]">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-sm uppercase tracking-wide">
              DAW Hotkeys & Shortcuts
            </h3>
            <p className="text-[10px] font-mono text-dim">Producer Precision Control</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
            >
              <span className="text-xs text-secondary font-sans">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[#00f5ff] text-[11px] font-mono font-bold shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-dim pt-3 border-t border-white/5">
          <span>Vox MusicGen DAW Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
