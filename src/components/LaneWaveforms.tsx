import { useEffect, useRef, useState } from "react";

interface Lane {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface LaneWaveformsProps {
  playProgress: number;
}

const LANES: Lane[] = [
  { id: "melody", name: "Melody", icon: "🎸", color: "#00f5ff" },
  { id: "drums", name: "Drums", icon: "🥁", color: "#8b5cf6" },
  { id: "synth", name: "Synth", icon: "🎹", color: "#f472b6" },
  { id: "vocal", name: "Vocal", icon: "🎤", color: "#fbbf24" },
  { id: "ambient", name: "Ambient", icon: "🌊", color: "#10ffb0" },
];

export default function LaneWaveforms({ playProgress }: LaneWaveformsProps) {
  const [mutedLanes, setMutedLanes] = useState<Record<string, boolean>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>({});

  const toggleMute = (id: string) => {
    setMutedLanes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Resize listener for track canvases to respect guidelines
  useEffect(() => {
    const observers: ResizeObserver[] = [];

    LANES.forEach((lane) => {
      const container = containerRefs.current[lane.id];
      if (!container) return;

      const observer = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        setDimensions((prev) => ({
          ...prev,
          [lane.id]: { width: width || 200, height: height || 48 },
        }));
      });

      observer.observe(container);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Update track canvas frames
  useEffect(() => {
    LANES.forEach((lane) => {
      const canvas = canvasRefs.current[lane.id];
      const dim = dimensions[lane.id];
      if (!canvas || !dim) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = dim.width * dpr;
      canvas.height = dim.height * dpr;
      ctx.scale(dpr, dpr);

      const W = dim.width;
      const H = dim.height;
      ctx.clearRect(0, 0, W, H);

      const seed = lane.color.charCodeAt(1) + lane.color.charCodeAt(2);
      const blocks = Math.floor(W / 4);

      // Draw standard audio blocks
      for (let i = 0; i < blocks; i++) {
        const n =
          (Math.sin(i * 0.28 + seed * 0.1) * 0.5 + 0.5) *
          (Math.sin(i * 0.08 + seed * 0.05) * 0.3 + 0.7);
        const h = Math.max(3, n * H * 0.75);

        // Darken if muted
        ctx.globalAlpha = mutedLanes[lane.id] ? 0.12 : 0.35 + n * 0.55;
        ctx.fillStyle = lane.color;

        ctx.beginPath();
        // Fallback for rounded rects
        ctx.fillStyle = lane.color;
        ctx.fillRect(i * 4, (H - h) / 2, 2.5, h);
      }
      ctx.globalAlpha = 1;

      // Draw played back cursor shroud and alignment line
      if (playProgress > 0) {
        ctx.fillStyle = mutedLanes[lane.id]
          ? "rgba(255,255,255,0.02)"
          : "rgba(255,255,255,0.08)";
        ctx.fillRect(0, 0, W * playProgress, H);

        if (!mutedLanes[lane.id]) {
          ctx.strokeStyle = lane.color;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = lane.color;
          ctx.shadowBlur = 5;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(W * playProgress, 0);
          ctx.lineTo(W * playProgress, H);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      }
    });
  }, [dimensions, playProgress, mutedLanes]);

  return (
    <div className="flex flex-col gap-2 px-[18px]">
      {LANES.map((lane) => (
        <div
          key={lane.id}
          className="bg-card border border-[#00f5ff]/10 hover:border-[#00f5ff]/30 rounded-[14px] flex overflow-hidden transition-all duration-200"
          style={{
            borderLeft: `3px solid ${lane.color}`,
          }}
        >
          {/* Lane Label */}
          <div className="w-[60px] flex-shrink-0 p-2 border-r border-[#00f5ff]/10 flex flex-col items-center justify-center gap-1 bg-[#03030e]/45">
            <span className="text-base select-none">{lane.icon}</span>
            <span className="text-[7.5px] font-mono text-dim tracking-[0.07em] uppercase">
              {lane.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute(lane.id);
              }}
              className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[8.5px] font-mono border transition-all ${
                mutedLanes[lane.id]
                  ? "bg-red-500/15 border-red-500/30 text-[#ff4757]"
                  : "bg-white/5 border-[#00f5ff]/10 text-dim"
              }`}
            >
              {mutedLanes[lane.id] ? "M" : "M"}
            </button>
          </div>

          {/* Lane Waveform Canvas Container */}
          <div
            ref={(el) => {
              containerRefs.current[lane.id] = el;
            }}
            className="flex-1 h-[48px] relative cursor-pointer"
          >
            <canvas
              ref={(el) => {
                canvasRefs.current[lane.id] = el;
              }}
              className="w-full h-full block"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
