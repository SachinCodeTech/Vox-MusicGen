import { useState, useRef, useEffect } from "react";
import { TrackBlueprint, ChatMessage } from "../types";

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blueprintContext: TrackBlueprint | null;
  onAddSuggestion: (suggestion: string) => void;
}

const PRESETS = [
  { icon: "✍️", label: "Improve my lyrics", prompt: "Improve my lyrics and make them more emotional, poetic, and cinematic" },
  { icon: "🎣", label: "Generate a viral hook", prompt: "Generate an incredibly catchy and viral lyric hook line" },
  { icon: "🎬", label: "Suggest video scenes", prompt: "Suggest 3 cinematic music video scene ideas to match this track's atmosphere" },
  { icon: "🎚", label: "Mixing & production advice", prompt: "What are 2 professional production techniques to make a track of this style hit harder?" },
];

export default function AIDrawer({ isOpen, onClose, blueprintContext, onAddSuggestion }: AIDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          blueprintContext: blueprintContext,
        }),
      });

      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.text || "I was unable to synthesize a response. Let me try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: `⚠️ Error from Director AI: ${err.message || "Unable to reach server. Check backend."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-Up Drawer */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#03030e]/85 backdrop-blur-xl border-t border-white/10 rounded-t-[28px] p-5 pb-[calc(18px+env(safe-area-inset-bottom,12px))] max-h-[82vh] flex flex-col sheet-enter shadow-[0_-10px_45px_rgba(0,0,0,0.9)]">
        {/* Pull Handle */}
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] flex items-center justify-center text-lg select-none font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            ✦
          </div>
          <div>
            <h3 className="font-display text-sm font-bold bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
              Vox Director AI
            </h3>
            <p className="text-[10px] font-mono text-dim tracking-wider uppercase">
              {blueprintContext ? `Consulting context: "${blueprintContext.title}"` : "Active production partner"}
            </p>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 min-h-[140px] max-h-[380px] scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center py-6 text-xs text-dim">
              <span className="text-lg block mb-1">🤖</span>
              Ask me anything about mixing advice, lyric development, or visual ideas.
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] rounded-xl p-3 ${
                msg.role === "user"
                  ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 self-end ml-auto"
                  : "bg-[#0c0c20] border border-[#00f5ff]/10 self-start"
              }`}
            >
              <div className="text-[9px] font-mono text-dim mb-1 uppercase tracking-wide">
                {msg.role === "user" ? "You" : "Vox Director"}
              </div>
              <div className="text-xs text-secondary leading-relaxed whitespace-pre-wrap select-text">
                {msg.text}
              </div>
              {msg.role === "model" && !msg.text.includes("⚠️") && (
                <button
                  onClick={() => {
                    onAddSuggestion(msg.text);
                    onClose();
                  }}
                  className="mt-2 self-start text-[8.5px] font-mono text-[#00f5ff] hover:underline cursor-pointer"
                >
                  ✦ Apply advice as brief suggestion
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="bg-[#0c0c20] border border-[#00f5ff]/10 rounded-xl p-3 max-w-[85%] self-start animate-pulse">
              <div className="text-[9px] font-mono text-dim mb-1 uppercase">Vox Director</div>
              <div className="text-xs text-dim flex items-center gap-1">
                <span>✦ Composing response</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prescription Chips */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[9px] font-mono text-dim tracking-wider uppercase mb-1">Interactive presets:</span>
            {PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => sendMessage(preset.prompt)}
                className="p-3 bg-white/[0.03] hover:bg-[#8b5cf6]/10 border border-[#00f5ff]/10 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
              >
                <span className="text-sm select-none">{preset.icon}</span>
                <span className="text-xs text-secondary">{preset.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Control Footer */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
            placeholder="Ask Vox Director anything..."
            className="flex-1 p-[10px_13px] rounded-xl bg-white/[0.03] border border-white/10 text-primary text-xs outline-none focus:border-[#8b5cf6]/45"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={loading || !inputText.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] text-white cursor-pointer active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
