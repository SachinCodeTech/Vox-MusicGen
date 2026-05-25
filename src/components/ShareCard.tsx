import { useEffect, useRef } from "react";
import { TrackBlueprint } from "../types";

interface ShareCardProps {
  blueprint: TrackBlueprint;
  onCopyCaption: (caption: string) => void;
}

export default function ShareCard({ blueprint, onCopyCaption }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Draw rich background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#00000a");
    grad.addColorStop(0.4, "#0a0020");
    grad.addColorStop(0.7, "#000a10");
    grad.addColorStop(1, "#04000a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Drawing alignment grid
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

    // Glowing nebula circles
    const drawBlob = (cx: number, cy: number, r: number, color: string) => {
      const og = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      og.addColorStop(0, color);
      og.addColorStop(1, "transparent");
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawBlob(W * 0.2, H * 0.25, W * 0.45, "rgba(139, 92, 246, 0.18)");
    drawBlob(W * 0.8, H * 0.6, W * 0.4, "rgba(0, 245, 255, 0.12)");
    drawBlob(W * 0.5, H * 0.85, W * 0.35, "rgba(244, 114, 182, 0.1)");

    // Accent line at the top
    const accentG = ctx.createLinearGradient(0, 0, W, 0);
    accentG.addColorStop(0, "transparent");
    accentG.addColorStop(0.5, "#00f5ff");
    accentG.addColorStop(1, "transparent");
    ctx.strokeStyle = accentG;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.stroke();

    // Draw central music branding text (directly on canvas so it can download with the card!)
    ctx.fillStyle = "rgba(0, 245, 255, 0.4)";
    ctx.font = "900 8px 'Orbitron', monospace";
    ctx.textAlign = "center";
    ctx.fillText("✦ VOX MUSICGEN ✦", W / 2, H * 0.16);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 18px 'Orbitron', monospace";
    const titleText = (blueprint.title || "Untitled Track").toUpperCase();
    ctx.fillText(titleText, W / 2, H * 0.36);

    ctx.fillStyle = "rgba(180, 195, 255, 0.7)";
    ctx.font = "500 11px 'Syne', sans-serif";
    ctx.fillText(`${blueprint.genre} · ${blueprint.bpm} BPM`, W / 2, H * 0.44);

    // Draw a small decorative circular scope
    ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 10, 36, 0, Math.PI * 2);
    ctx.stroke();

    // Draw small pulsing bars Inside scope
    ctx.fillStyle = "#00f5ff";
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const barH = 5 + Math.sin(Date.now() * 0.003 + i) * 6;
      const x1 = W / 2 + Math.cos(angle) * 36;
      const y1 = H / 2 + 10 + Math.sin(angle) * 36;
      const x2 = W / 2 + Math.cos(angle) * (36 + barH);
      const y2 = H / 2 + 10 + Math.sin(angle) * (36 + barH);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Viral score indicator
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 24px 'Orbitron', monospace";
    ctx.fillText(`${blueprint.viralScore}%`, W / 2, H * 0.8);

    ctx.fillStyle = "rgba(140, 155, 210, 0.45)";
    ctx.font = "500 8px 'JetBrains Mono', monospace";
    ctx.fillText("AI VIRAL SCORE", W / 2, H * 0.85);

    // Watermark at footer
    ctx.fillStyle = "rgba(0, 245, 255, 0.4)";
    ctx.font = "700 8.5px 'Orbitron', monospace";
    ctx.fillText("VOXMUSICGEN.AI", W / 2, H * 0.94);
  }, [blueprint]);

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${blueprint.title.replace(/\s+/g, "_")}_ReleaseCard.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Dynamic Canvas Container */}
      <div className="share-card-preview relative w-full aspect-[9/13] max-w-[320px] max-h-[400px] border border-[#00f5ff]/15 rounded-[20px] overflow-hidden mb-6 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 z-0" />
        {/* Invisible overlay supporting native touch on text if needed */}
        <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
          {/* Subtle download helper prompt */}
        </div>
      </div>

      <div className="w-full px-[18px] flex gap-3 mb-6">
        <button
          onClick={downloadCard}
          className="btn btn-primary flex-1 py-3 text-xs font-bold leading-none shadow-[0_0_15px_rgba(0,245,255,0.25)] flex items-center justify-center gap-1.5"
        >
          <span>📥</span> Download Art Card
        </button>
      </div>

      {/* Captions Header & List */}
      <div className="w-full">
        <div className="section-hd">
          <span className="section-label">AI Social Captions</span>
        </div>
        <div className="captions-list flex flex-col gap-2 px-[18px]">
          {blueprint.captions.map((cap, i) => (
            <div
              key={i}
              onClick={() => onCopyCaption(cap)}
              className="cap-item relative p-3 bg-card border border-[#00f5ff]/10 hover:border-[#00f5ff]/25 rounded-xl text-[11.5px] text-secondary leading-relaxed cursor-pointer transition-all duration-200 group active:scale-[0.99] select-text"
            >
              <div className="pr-4">{cap}</div>
              <span className="cap-copy absolute top-2 right-2 text-[10px] font-mono text-dim group-hover:text-[#00f5ff] transition-all">
                📋
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
