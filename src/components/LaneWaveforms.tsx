import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";

interface Lane {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface LaneWaveformsProps {
  playProgress: number;
  mutedLanes: Record<string, boolean>;
  setMutedLanes: Dispatch<SetStateAction<Record<string, boolean>>>;
  laneVolumes: Record<string, number>;
  setLaneVolumes: Dispatch<SetStateAction<Record<string, number>>>;
  selectedFX: string | null;
}

const LANES: Lane[] = [
  { id: "melody", name: "Melody", icon: "🎸", color: "#00f5ff" },
  { id: "drums", name: "Drums", icon: "🥁", color: "#8b5cf6" },
  { id: "synth", name: "Synth", icon: "🎹", color: "#f472b6" },
  { id: "vocal", name: "Vocal", icon: "🎤", color: "#fbbf24" },
  { id: "ambient", name: "Ambient", icon: "🌊", color: "#10ffb0" },
];

const FX_FREQ_MAP: Record<string, { label: string; minPct: number; maxPct: number; color: string }> = {
  "🎚 Reverb": { label: "DIFFUSION (2kHz - 12kHz)", minPct: 0.65, maxPct: 0.95, color: "#00f5ff" },
  "🎛 Pro-EQ": { label: "PARAMETRIC BAND (200Hz - 4.5kHz)", minPct: 0.3, maxPct: 0.75, color: "#8b5cf6" },
  "🗜 Compressor": { label: "DYNAMICS THRESHOLD (80Hz - 1.2kHz)", minPct: 0.15, maxPct: 0.5, color: "#f472b6" },
  "✨ AI Mastering": { label: "HARMONIC EXCITER (Full Spectrum)", minPct: 0.05, maxPct: 0.95, color: "#10ffb0" },
  "🎵 Harmony +2": { label: "FORMANTS RANGE (350Hz - 2.5kHz)", minPct: 0.35, maxPct: 0.7, color: "#fbbf24" },
  "🔊 Spatial 3D": { label: "BINAURAL FIELD (Stereo Width)", minPct: 0.8, maxPct: 1.0, color: "#00f5ff" },
  "🌀 Chorus FX": { label: "MODULATION DEPTH (400Hz - 3.8kHz)", minPct: 0.4, maxPct: 0.85, color: "#fbbf24" }
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function LaneWaveforms({
  playProgress,
  mutedLanes,
  setMutedLanes,
  laneVolumes,
  setLaneVolumes,
  selectedFX
}: LaneWaveformsProps) {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [animTick, setAnimTick] = useState(0);

  const toggleMute = (id: string) => {
    setMutedLanes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Keep a ticking frame count to force-simulate live waves in the highlighted range
  useEffect(() => {
    if (!selectedFX) return;
    let animId: number;
    const tick = () => {
      setAnimTick((prev) => prev + 1);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [selectedFX]);

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

      // Volume scalar (0 to 1)
      const volScale = (laneVolumes[lane.id] ?? 80) / 100;

      // Draw standard audio blocks
      for (let i = 0; i < blocks; i++) {
        const n =
          (Math.sin(i * 0.28 + seed * 0.1) * 0.5 + 0.5) *
          (Math.sin(i * 0.08 + seed * 0.05) * 0.3 + 0.7);
        // Scale vertical height of waveform by channel volume
        const h = Math.max(3, n * H * 0.75 * volScale);

        // Darken if muted
        ctx.globalAlpha = mutedLanes[lane.id] ? 0.08 : 0.35 + n * 0.55;
        ctx.fillStyle = lane.color;

        ctx.fillRect(i * 4, (H - h) / 2, 2.5, h);
      }
      ctx.globalAlpha = 1;

      // Real-time FX highlight visualization layer
      if (selectedFX && FX_FREQ_MAP[selectedFX] && !mutedLanes[lane.id]) {
        const { minPct, maxPct, color } = FX_FREQ_MAP[selectedFX];
        const startX = W * minPct;
        const endX = W * maxPct;
        const bWidth = endX - startX;

        // Draw tinted backdrop band
        ctx.fillStyle = hexToRgba(color, 0.06);
        ctx.fillRect(startX, 0, bWidth, H);

        // Draw side boundary dividers
        ctx.strokeStyle = hexToRgba(color, 0.24);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, H);
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, H);
        ctx.stroke();
        ctx.setLineDash([]);

        // Interactive dynamic sinewave representing frequency excitation
        ctx.strokeStyle = hexToRgba(color, 0.45);
        ctx.lineWidth = 1;
        ctx.beginPath();
        const animTime = animTick * 0.06;
        for (let x = startX; x <= endX; x += 3) {
          const waveY = H / 2 + Math.sin(x * 0.13 - animTime + seed) * (H * 0.22) * volScale;
          if (x === startX) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.stroke();
      }

      // Draw played back cursor shroud and alignment line
      if (playProgress > 0) {
        ctx.fillStyle = mutedLanes[lane.id]
          ? "rgba(255,255,255,0.01)"
          : "rgba(255,255,255,0.06)";
        ctx.fillRect(0, 0, W * playProgress, H);

        if (!mutedLanes[lane.id]) {
          ctx.strokeStyle = lane.color;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = lane.color;
          ctx.shadowBlur = 4;
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
  }, [dimensions, playProgress, mutedLanes, laneVolumes, selectedFX, animTick]);

  return (
    <div className="flex flex-col gap-3 px-[18px]">
      {LANES.map((lane) => {
        const isMuted = mutedLanes[lane.id];
        const volume = laneVolumes[lane.id] ?? 80;

        return (
          <div
            key={lane.id}
            className={`border rounded-[14px] flex items-center p-2 pb-2 pl-3 gap-3 transition-all duration-300 relative overflow-hidden ${
              isMuted 
                ? "bg-[#04040a]/40 border-white/5 opacity-60" 
                : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
            }`}
            style={{
              borderLeft: `3px solid ${lane.color}`,
            }}
          >
            {/* Ambient subtle glow when real-time FX highlights frequency in this track */}
            {selectedFX && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03] transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${lane.color}, transparent)`
                }}
              />
            )}

            {/* Left Channel Controls Block (Tactile Mixer Design) */}
            <div className="w-[82px] shrink-0 flex flex-col gap-1.5 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-base select-none leading-none">{lane.icon}</span>
                <span className="text-[10px] font-display text-[#eef2ff] tracking-wide font-bold uppercase truncate">
                  {lane.name}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute(lane.id);
                  }}
                  className={`w-[45px] h-[19px] rounded-md flex items-center justify-center text-[8.5px] font-mono tracking-wider font-bold border transition-all cursor-pointer ${
                    isMuted
                      ? "bg-red-500/20 border-red-500/40 text-red-400 font-extrabold shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                      : "bg-white/5 border-white/10 text-dim hover:text-white"
                  }`}
                >
                  {isMuted ? "MUTED" : "MUTE"}
                </button>
                <span className="text-[9px] font-mono text-dim font-bold tabular-nums">
                  {volume}%
                </span>
              </div>
            </div>

            {/* Middle Waveform Canvas Container */}
            <div className="flex-1 h-[44px] relative">
              <div
                ref={(el) => {
                  containerRefs.current[lane.id] = el;
                }}
                className="w-full h-full"
              >
                <canvas
                  ref={(el) => {
                    canvasRefs.current[lane.id] = el;
                  }}
                  className="w-full h-full block rounded-md"
                />
              </div>

              {/* Real-time frequency spec badge absolutely positioned inside canvas bottom right */}
              {selectedFX && FX_FREQ_MAP[selectedFX] && !isMuted && (
                <div 
                  className="absolute bottom-1 right-1.5 text-[7px] font-mono p-[1px_4px] rounded-[3px] border uppercase tracking-wider font-semibold pointer-events-none animate-fadeIn select-none"
                  style={{
                    backgroundColor: "rgba(3, 3, 14, 0.85)",
                    borderColor: `${FX_FREQ_MAP[selectedFX].color}33`,
                    color: FX_FREQ_MAP[selectedFX].color
                  }}
                >
                  {FX_FREQ_MAP[selectedFX].label}
                </div>
              )}
            </div>

            {/* Right Horizontal Fader Slider Column */}
            <div className="w-[72px] shrink-0 flex flex-col items-stretch gap-1 px-1.5 border-l border-white/[0.04]">
              <span className="text-[8px] font-mono text-dim uppercase text-center font-bold tracking-wide">
                Fader Gain
              </span>
              <div className="relative h-4 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setLaneVolumes((prev) => ({ ...prev, [lane.id]: val }));
                  }}
                  className="w-full h-[3px] bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#eef2ff]"
                  style={{
                    background: `linear-gradient(to right, ${lane.color} 0%, ${lane.color} ${volume}%, rgba(255,255,255,0.08) ${volume}%, rgba(255,255,255,0.08) 100%)`
                  }}
                />
              </div>
            </div>
            
          </div>
        );
      })}
    </div>
  );
}
