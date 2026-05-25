import { useEffect, useRef, useState } from "react";
import { TrackBlueprint } from "../types";
import { Copy, Download, Share2, Sparkles, Check, QrCode, MessageSquare, Heart, RefreshCw, Send, AlertCircle } from "lucide-react";
import QRCode from "qrcode";
import { animate, motion, AnimatePresence } from "motion/react";

interface ShareCardProps {
  blueprint: TrackBlueprint;
  onCopyCaption: (caption: string) => void;
}

type SocialPlatform = "twitter" | "tiktok" | "instagram";

export default function ShareCard({ blueprint, onCopyCaption }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viralValue, setViralValue] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("twitter");
  const [customCaption, setCustomCaption] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showTikTokGuide, setShowTikTokGuide] = useState(false);

  const shareUrl = `${window.location.origin}?trackId=${encodeURIComponent(blueprint.title.replace(/\s+/g, '-').toLowerCase())}`;

  // 1. Dynamic QR Code generation with elegant neon cyan color
  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#00f5ff', // Cyber electric cyan
        light: '#0a0a14' // Seamless dark coordinate matching
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error("QR Code Generation Error:", err));
  }, [shareUrl]);

  // 2. Count-up 'Viral Score' using motion/react animate
  useEffect(() => {
    const controls = animate(0, blueprint.viralScore || 92, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => setViralValue(Math.round(latest))
    });
    return () => controls.stop();
  }, [blueprint.viralScore]);

  // Sync state with selected caption when blueprint shifts
  useEffect(() => {
    if (blueprint.captions?.length > 0) {
      setCustomCaption(blueprint.captions[0]);
    } else {
      setCustomCaption(`Just generated my new cinematic track "${blueprint.title}" on Vox MusicGen! 🔥🎵 Find it here:`);
    }
  }, [blueprint]);

  // 3. Audio-Reactive Animated Canvas Release Card Draw Context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 320;
    const H = 400;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Load QR Image
    const qrImg = new Image();
    qrImg.src = qrDataUrl;

    const drawFrame = () => {
      // Clear frame
      ctx.clearRect(0, 0, W, H);

      // Deep space theme gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#080314");
      bgGrad.addColorStop(0.5, "#01010a");
      bgGrad.addColorStop(1, "#18002d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Tech Alignment Grid Coordinates
      ctx.strokeStyle = "rgba(0, 245, 255, 0.04)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Atmospheric Nebula Orbs
      const drawNebula = (cx: number, cy: number, r: number, color: string) => {
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        radGrad.addColorStop(0, color);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };
      drawNebula(W * 0.25, H * 0.2, W * 0.5, "rgba(139, 92, 246, 0.2)");
      drawNebula(W * 0.75, H * 0.65, W * 0.45, "rgba(0, 245, 255, 0.14)");

      // High-tech top accent line
      const lineG = ctx.createLinearGradient(0, 0, W, 0);
      lineG.addColorStop(0, "transparent");
      lineG.addColorStop(0.5, "#00f5ff");
      lineG.addColorStop(1, "transparent");
      ctx.strokeStyle = lineG;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(W, 0);
      ctx.stroke();

      // UI Labels & Branding
      ctx.fillStyle = "rgba(0, 245, 255, 0.45)";
      ctx.font = "900 8px 'Orbitron', monospace";
      ctx.textAlign = "center";
      ctx.fillText("✦ VOX MUSICGEN RELEASE ART ✦", W / 2, H * 0.15);

      // Main Song title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 17px 'Orbitron', monospace";
      const titleText = (blueprint.title || "Untitled Track").toUpperCase();
      ctx.fillText(titleText, W / 2, H * 0.33);

      // Genre & Meta Badge Text
      ctx.fillStyle = "rgba(180, 195, 255, 0.75)";
      ctx.font = "500 11px 'Syne', sans-serif";
      ctx.fillText(`${blueprint.genre} · ${blueprint.bpm} BPM · ${blueprint.key}`, W / 2, H * 0.41);

      // Visual circular scope outline
      ctx.strokeStyle = "rgba(139, 92, 246, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2 + 10, 38, 0, Math.PI * 2);
      ctx.stroke();

      // Interactive synth-like pulsing rays
      ctx.fillStyle = "#00f5ff";
      ctx.strokeStyle = "#00f5ff";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + (Date.now() * 0.0004);
        const pulseAmt = 4 + Math.sin(Date.now() * 0.0035 + i * 1.5) * 6;
        const startR = 38;
        const endR = 38 + pulseAmt;
        const x1 = W / 2 + Math.cos(angle) * startR;
        const y1 = H / 2 + 10 + Math.sin(angle) * startR;
        const x2 = W / 2 + Math.cos(angle) * endR;
        const y2 = H / 2 + 10 + Math.sin(angle) * endR;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Dynamic Viral Score text using state updated by count-up animation
      ctx.fillStyle = "#fbbf24";
      ctx.font = "900 24px 'Orbitron', monospace";
      ctx.fillText(`${viralValue}%`, W / 2, H * 0.78);

      ctx.fillStyle = "rgba(140, 155, 210, 0.55)";
      ctx.font = "700 8px 'JetBrains Mono', monospace";
      ctx.fillText("AI VIRAL ESTIMATION", W / 2, H * 0.83);

      // Footer brand label
      ctx.fillStyle = "rgba(0, 245, 255, 0.35)";
      ctx.font = "700 8px 'Orbitron', monospace";
      ctx.fillText("VOXMUSICGEN.STUDIO", W / 2, H * 0.94);

      // Embed the generated dynamic QR code onto canvas
      if (qrDataUrl && qrImg.complete && qrImg.naturalWidth !== 0) {
        const size = 42;
        const rightMarg = 16;
        const botMarg = 16;
        ctx.drawImage(qrImg, W - size - rightMarg, H - size - botMarg, size, size);

        // Thin glowing halo around the QR code
        ctx.strokeStyle = "rgba(0, 245, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(W - size - rightMarg, H - size - botMarg, size, size);

        ctx.fillStyle = "rgba(180, 195, 255, 0.45)";
        ctx.font = "600 6px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText("SCAN CAPTURE", W - size - rightMarg - 6, H - botMarg - 25);
        ctx.fillText("TO EMBED", W - size - rightMarg - 6, H - botMarg - 15);
      }
    };

    let animId: number;
    const tick = () => {
      drawFrame();
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(animId);
  }, [blueprint, viralValue, qrDataUrl]);

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${blueprint.title.replace(/\s+/g, "_")}_ReleaseCard.png`;
    link.href = url;
    link.click();
  };

  const copyLiveCaption = () => {
    const finalPost = `${customCaption}\n\nListen here: ${shareUrl}`;
    navigator.clipboard?.writeText(finalPost)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
        onCopyCaption(finalPost);
      })
      .catch(err => console.error("Clipboard copy error:", err));
  };

  // 4. 'Share to TikTok' Action + Mobile Share Intent Trigger
  const handleTikTokShare = async () => {
    const finalPost = `${customCaption}\n\nListen here: ${shareUrl} #voxmusicgen #cinematicaudio`;
    const canvas = canvasRef.current;
    
    if (canvas && navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            // Text only fallback
            await navigator.share({
              title: `Listen to ${blueprint.title}`,
              text: finalPost,
              url: shareUrl,
            });
            return;
          }
          
          const artFile = new File([blob], `${blueprint.title.replace(/\s+/g, "_")}_Promo.png`, { type: "image/png" });
          
          if (navigator.canShare && navigator.canShare({ files: [artFile] })) {
            await navigator.share({
              files: [artFile],
              title: `Listen to ${blueprint.title}`,
              text: finalPost,
            });
          } else {
            await navigator.share({
              title: `Listen to ${blueprint.title}`,
              text: finalPost,
              url: shareUrl,
            });
          }
        }, "image/png");
      } catch (err) {
        console.warn("Share intent interrupted, launching instruction guide:", err);
        setShowTikTokGuide(true);
      }
    } else {
      // Direct high-tech desktop/fallback simulation overlay guide
      setShowTikTokGuide(true);
    }
  };

  // Network metrics for the live previews
  const platformLimits = {
    twitter: 280,
    tiktok: 2200,
    instagram: 2200
  };

  const characterCountWithLink = customCaption.length + shareUrl.length + 2;
  const isOverLimit = characterCountWithLink > platformLimits[activePlatform];

  return (
    <div className="flex flex-col items-center select-none w-full">
      
      {/* Dynamic Cinematic Preview Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 px-[18px] w-full">
        
        {/* Left column: Art Card canvas plus quick stats */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="share-card-preview relative w-full aspect-[9/11.5] max-w-[320px] border border-white/[0.08] hover:border-[#00f5ff]/20 rounded-3xl overflow-hidden mb-4 flex flex-col items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.85)] group transition-all duration-300">
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020208] via-transparent to-transparent opacity-30 pointer-events-none" />
            
            {/* Quick interactive touch indicator to download */}
            <button 
              onClick={downloadCard}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-xs text-white hover:text-[#00f5ff] hover:bg-black/90 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-10"
              title="Download High-Res Card"
            >
              <Download size={13} />
            </button>
          </div>

          <div className="flex gap-2 w-full max-w-[320px]">
            <button
              onClick={downloadCard}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#00f5ff]/20 to-[#8b5cf6]/10 border border-[#00f5ff]/20 hover:border-[#00f5ff]/60 hover:text-[#00f5ff] text-[10px] uppercase font-display font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            >
              <Download size={12} /> Download Release Card
            </button>
          </div>

          {/* Quick Dynamic QR badge block displayed natively in JSX UI */}
          <div className="mt-4 p-3 bg-black/[0.45] border border-white/[0.04] rounded-xl w-full max-w-[320px] flex items-center gap-3 relative overflow-hidden">
            <div className="w-[52px] h-[52px] bg-black/80 rounded-lg flex items-center justify-center overflow-hidden border border-[#00f5ff]/25 p-0.5 shrink-0">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Release QR" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="text-dim animate-pulse" size={24} />
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[7.5px] font-mono tracking-widest text-[#00f5ff] uppercase font-bold block">Dynamic QR Integration</span>
              <p className="text-[10px] text-secondary leading-snug font-sans">
                Pointed securely to the track's unique project footprint interface.
              </p>
              <span className="text-[8px] font-mono text-dim select-all truncate block bg-black/30 p-0.5 rounded px-1 max-w-[200px]">
                {shareUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Social Media Simulator + Live edits */}
        <div className="md:col-span-7 flex flex-col space-y-4">
          
          {/* Custom Tabs representing Twitter, TikTok, and Instagram previews */}
          <div className="flex bg-black/[0.5] border border-white/[0.05] p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActivePlatform("twitter")}
              className={`flex-1 py-1.5 text-center text-[9px] font-display font-medium rounded-lg transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                activePlatform === "twitter"
                  ? "bg-slate-800 text-[#00f5ff] font-bold border border-slate-700 shadow-md"
                  : "text-dim hover:text-white"
              }`}
            >
              🐦 X / Twitter
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform("tiktok")}
              className={`flex-1 py-1.5 text-center text-[9px] font-display font-medium rounded-lg transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                activePlatform === "tiktok"
                  ? "bg-slate-800 text-[#fd3e3e] font-bold border border-slate-700 shadow-md"
                  : "text-dim hover:text-white"
              }`}
            >
              🎵 TikTok Feed
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform("instagram")}
              className={`flex-1 py-1.5 text-center text-[9px] font-display font-medium rounded-lg transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                activePlatform === "instagram"
                  ? "bg-slate-800 text-[#d346ff] font-bold border border-slate-700 shadow-md"
                  : "text-dim hover:text-white"
              }`}
            >
              📸 Instagram Reel
            </button>
          </div>

          {/* Social Post Live Mockup Card */}
          <div className="p-4 bg-[#050514]/90 border border-white/[0.04] rounded-2xl space-y-3.5 shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8b5cf6]/20 to-transparent" />
            
            {/* Header info */}
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fbbf24] via-[#8b5cf6] to-[#00f5ff] flex items-center justify-center text-sm ring-1 ring-white/10 shadow-inner">
                  👨‍🎤
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold text-white">Sachin Sheth</span>
                    <span className="text-[9px] text-[#00f5ff] font-bold" title="Verified Creator">✔</span>
                  </div>
                  <span className="text-[9px] font-mono text-dim block mt-[-2px]">@sachin.vox</span>
                </div>
              </div>
              
              {/* Dynamic tag indicator */}
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20 p-1 px-2.5 rounded-full">
                {activePlatform === "twitter" ? "X Post Mockup" : activePlatform === "tiktok" ? "TikTok Clip Draft" : "Insta Reel Post"}
              </span>
            </div>

            {/* Editable Textbox representing the caption content */}
            <div className="space-y-1.5 relative">
              <label className="text-[8px] font-mono tracking-wider uppercase text-dim block">Editable Share Copy Context</label>
              <textarea
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                className="w-full min-h-[75px] max-h-[140px] text-[11px] p-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-sans focus:outline-none focus:border-[#00f5ff]/35 text-secondary leading-relaxed transition-all resize-none"
                placeholder="Type your custom social caption here..."
              />
              
              {/* Live social post URL append representation */}
              <div className="p-2 bg-black/60 border-l-2 border-[#00f5ff] rounded-r-lg text-[9.5px] font-mono text-dim select-all">
                {shareUrl}
              </div>
            </div>

            {/* Simulated Live preview actions & metrics footer */}
            <div className="flex justify-between items-center pt-2 border-t border-white/[0.03]">
              
              {/* Interactive simulated hearts / replies metrics look */}
              <div className="flex gap-3 text-dim text-[10px]">
                <span className="flex items-center gap-1 hover:text-red-500 transition-all cursor-pointer">
                  <Heart size={11} /> 1.2K
                </span>
                <span className="flex items-center gap-1 hover:text-[#00f5ff] transition-all cursor-pointer">
                  <MessageSquare size={11} /> 394
                </span>
                <span className="flex items-center gap-1 hover:text-[#10ffb0] transition-all cursor-pointer">
                  <Send size={11} /> 48
                </span>
              </div>

              {/* Character Limit and Counter Indicators */}
              <div className="text-right flex items-center gap-1.5">
                <span className="text-[8.5px] font-mono text-dim">
                  Characters:
                </span>
                <span className={`text-[10px] font-mono font-extrabold ${isOverLimit ? "text-red-500 animate-pulse" : "text-[#10ffb0]"}`}>
                  {characterCountWithLink}
                </span>
                <span className="text-[10px] font-mono text-dim">
                  / {platformLimits[activePlatform]}
                </span>
              </div>

            </div>

            {/* High Impact Alert callout when boundary is exceeded */}
            {isOverLimit && (
              <div className="p-1 px-2.5 bg-red-950/40 border border-red-500/20 rounded-lg flex items-center gap-1.5 text-[8.5px] text-red-400">
                <AlertCircle size={11} />
                <span>Text exceeds {platformLimits[activePlatform]} character restriction threshold on {activePlatform}!</span>
              </div>
            )}

            {/* Action buttons embedded in the mockup representing Copy and TikTok specific targets */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              
              {/* Copy Live Custom Post Button */}
              <button
                onClick={copyLiveCaption}
                disabled={isOverLimit}
                className={`py-3 rounded-xl border flex items-center justify-center gap-1.5 text-[10px] uppercase font-display font-extrabold cursor-pointer transition-all ${
                  copied 
                    ? "bg-[#10ffb0]/15 border-[#10ffb0]/40 text-[#10ffb0]" 
                    : isOverLimit
                      ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-[#00f5ff]/10 border-[#00f5ff]/30 hover:border-[#00f5ff] text-white hover:text-[#00f5ff]"
                }`}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                <span>{copied ? "Copied Post!" : "Copy Post Copy"}</span>
              </button>

              {/* TikTok specific post button */}
              <button
                onClick={handleTikTokShare}
                className="py-3 rounded-xl bg-[#fa2d5a] border border-[#fa2d5a]/20 hover:border-white/30 text-white hover:bg-[#ff426c] text-[10px] uppercase font-display font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(250,45,90,0.25)]"
              >
                <span>🎵</span> Share to TikTok
              </button>

            </div>

          </div>

          {/* Quick preset instructions for other captions alternative suggestions box */}
          <div className="p-3 bg-black/[0.25] border border-white/[0.03] rounded-xl space-y-1.5">
            <span className="text-[8px] font-mono tracking-widest text-[#8b5cf6] uppercase font-bold flex items-center gap-1">
              <Sparkles size={9} /> Alternate Gemini Suggestions:
            </span>
            <div className="flex flex-col gap-1.5">
              {blueprint.captions.slice(0, 3).map((cap, idx) => (
                <div
                  key={idx}
                  onClick={() => setCustomCaption(cap)}
                  className={`p-2 bg-black/40 border rounded-lg text-[9.5px] text-secondary leading-normal hover:border-white/10 hover:text-white transition-all cursor-pointer ${
                    customCaption === cap ? "border-[#8b5cf6]/40 text-white bg-[#8b5cf6]/5" : "border-white/[0.02]"
                  }`}
                >
                  {cap}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Guide dialog for TikTok compilation/sharing instructions when mobile share fallback is needed */}
      <AnimatePresence>
        {showTikTokGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTikTokGuide(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-[340px] bg-[#0c0c1a] border border-[#fa2d5a]/35 rounded-[22px] p-5 space-y-4 shadow-2xl relative overflow-hidden shadow-[#fa2d5a]/10"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#fa2d5a] to-transparent" />
              
              <div className="flex items-center gap-2">
                <span className="text-xl">🎵</span>
                <h4 className="font-display text-sm font-black text-white uppercase tracking-wider">
                  Post to TikTok instructions
                </h4>
              </div>

              <div className="space-y-3 font-sans text-secondary text-[11px] leading-relaxed">
                <p>
                  Copy/sharing intent triggered! Since default browser frames constrain direct API handshakes, here are your optimal steps to go viral:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-dim text-[10.5px]">
                  <li>
                    <strong className="text-white">Download the Release Card</strong> art above to your phone/device camera roll.
                  </li>
                  <li>
                    We've copied your selected post copy containing <strong className="text-[#00f5ff]">your unique track link</strong> to your clipboard.
                  </li>
                  <li>
                    Open <strong className="text-[#fa2d5a]">TikTok</strong>, tap <strong>(+)</strong>, upload your art card, choose an awesome background audio, and paste the caption link!
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-display">
                <button
                  type="button"
                  onClick={() => {
                    copyLiveCaption();
                    setShowTikTokGuide(false);
                    window.open("https://www.tiktok.com/", "_blank");
                  }}
                  className="py-2.5 rounded-xl bg-[#fa2d5a]/20 border border-[#fa2d5a]/45 text-[#fa2d5a] hover:text-white uppercase font-black text-[9px] tracking-wider transition-all cursor-pointer text-center"
                >
                  🚀 GO TO TIKTOK
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowTikTokGuide(false)}
                  className="py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 text-white uppercase font-black text-[9px] tracking-wider transition-all cursor-pointer text-center"
                >
                  DISMISS GUIDE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
