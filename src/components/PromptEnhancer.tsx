import { useState, useEffect } from "react";

interface PromptEnhancerProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  onApply: (enhancedText: string) => void;
}

export default function PromptEnhancer({ isOpen, onClose, originalPrompt, onApply }: PromptEnhancerProps) {
  const [loading, setLoading] = useState(false);
  const [enhancedText, setEnhancedText] = useState("");
  const [errorObj, setErrorObj] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && originalPrompt.trim()) {
      runEnhancer();
    }
  }, [isOpen, originalPrompt]);

  const runEnhancer = async () => {
    setLoading(true);
    setErrorObj(null);
    setEnhancedText("");

    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: originalPrompt }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setEnhancedText(data.enhanced || originalPrompt);
    } catch (err: any) {
      setErrorObj(err.message || "Unable to reach prompt enhancer. Please verify backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col align-items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#03030e] border-t border-[#00f5ff]/15 rounded-t-[28px] p-5 pb-[calc(18px+env(safe-area-inset-bottom,12px))] max-h-[75vh] flex flex-col sheet-enter shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />
        
        <h3 className="font-display text-sm font-bold bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6] bg-clip-text text-transparent mb-1">
          ✦ AI Prompt Enhancer
        </h3>
        <p className="text-[11px] text-secondary mb-4 leading-relaxed">
          Vox Director rewrites your prompt to specify rich textures, layers, sub-bass, rhythm details, and sound design.
        </p>

        {/* Original prompt display */}
        <div className="text-[9px] font-mono text-dim tracking-wider uppercase mb-1.5">Original input:</div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-secondary leading-relaxed mb-4 italic max-h-[80px] overflow-y-auto">
          "{originalPrompt}"
        </div>

        {/* Enhanced prompt container */}
        <div className="text-[9px] font-mono text-dim tracking-wider uppercase mb-1.5">Enhanced Output:</div>
        
        {loading && (
          <div className="flex-1 py-10 flex flex-col items-center justify-center bg-card border border-[#00f5ff]/10 rounded-xl mb-4 min-h-[140px]">
            <div className="spinning-loader w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f5ff] to-[#8b5cf6] flex items-center justify-center text-lg select-none mb-3 font-bold">
              ✦
            </div>
            <div className="text-xs font-mono text-[#8b5cf6]">Enhancing prompt brief...</div>
          </div>
        )}

        {errorObj && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 text-[#ff4757] rounded-xl text-xs leading-relaxed mb-4">
            {errorObj}
            <button 
              onClick={runEnhancer} 
              className="mt-2 block text-xs underline font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !errorObj && enhancedText && (
          <div className="flex-1 p-[12px_14px] bg-[#00f5ff]/5 border border-[#00f5ff]/22 rounded-xl text-xs text-primary leading-relaxed mb-5 max-h-[220px] overflow-y-auto select-text font-serif">
            {enhancedText}
          </div>
        )}

        {/* Button footer */}
        <div className="flex gap-2">
          <button 
            type="button"
            className="btn btn-ghost flex-1 py-3 text-xs" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={loading || !enhancedText}
            className="btn btn-primary flex-[2] py-3 text-xs font-bold" 
            onClick={() => onApply(enhancedText)}
          >
            Apply Enhancement →
          </button>
        </div>
      </div>
    </div>
  );
}
