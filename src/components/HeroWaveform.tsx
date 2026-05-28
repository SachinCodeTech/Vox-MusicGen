import { useEffect, useRef, useState } from "react";

interface HeroWaveformProps {
  theme?: "Cosmic Orbit" | "Holographic Beats" | "Neon Rain" | "Hyper-speed Strobe";
}

export default function HeroWaveform({ theme = "Neon Rain" }: HeroWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 300, height: 60 });

  // Use ResizeObserver for accurate sizing per guidelines
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 300, height: height || 60 });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Dynamic wave definitions based on themes
    let waves = [
      { freq: 0.038, amp: 0.33, color: "#10ffb0", alpha: 0.9, w: 2 },
      { freq: 0.065, amp: 0.22, color: "#10b981", alpha: 0.7, w: 1.5 },
      { freq: 0.019, amp: 0.42, color: "#fbbf24", alpha: 0.45, w: 1.5 },
    ];

    if (theme === "Cosmic Orbit") {
      waves = [
        { freq: 0.02, amp: 0.45, color: "#a855f7", alpha: 0.85, w: 2.2 },
        { freq: 0.04, amp: 0.3, color: "#f472b6", alpha: 0.75, w: 1.8 },
        { freq: 0.015, amp: 0.5, color: "#6366f1", alpha: 0.5, w: 1.5 },
      ];
    } else if (theme === "Holographic Beats") {
      waves = [
        { freq: 0.05, amp: 0.38, color: "#00f5ff", alpha: 0.9, w: 2.5 },
        { freq: 0.08, amp: 0.25, color: "#ff007f", alpha: 0.8, w: 1.8 },
        { freq: 0.03, amp: 0.48, color: "#ffffff", alpha: 0.6, w: 1.2 },
      ];
    } else if (theme === "Hyper-speed Strobe") {
      waves = [
        { freq: 0.09, amp: 0.5, color: "#ff4757", alpha: 0.95, w: 2.8 },
        { freq: 0.12, amp: 0.32, color: "#ffa502", alpha: 0.85, w: 2 },
        { freq: 0.04, amp: 0.58, color: "#ffffff", alpha: 0.7, w: 1.5 },
      ];
    }

    let animationFrameId: number;

    const draw = () => {
      const W = dimensions.width;
      const H = dimensions.height;
      if (W === 0 || H === 0) return;

      ctx.clearRect(0, 0, W, H);

      // Draw standard glowing lines
      waves.forEach((w, wi) => {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          let y = H / 2;
          
          if (theme === "Cosmic Orbit") {
            // Gravitational orbit swell
            y += Math.sin(x * w.freq + phaseRef.current + wi * 1.5) * w.amp * H * 0.4 * Math.cos(x * 0.005);
          } else if (theme === "Hyper-speed Strobe") {
            // Jagged saw-like lightning peaks
            y += (x % 30 < 15 ? 1 : -1) * Math.sin(x * w.freq + phaseRef.current * 1.8) * w.amp * H * 0.45;
          } else {
            // Standard smooth sine curves
            y += Math.sin(x * w.freq + phaseRef.current + wi * 1.1) * w.amp * H * 0.5 +
                 Math.sin(x * w.freq * 1.8 + phaseRef.current * 1.25) * w.amp * H * 0.16;
          }
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = w.alpha;
        ctx.lineWidth = w.w;
        ctx.shadowColor = w.color;
        ctx.shadowBlur = theme === "Hyper-speed Strobe" ? 14 : 7;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      // Draw reactive frequency bars
      const barCount = 48;
      for (let i = 0; i < barCount; i++) {
        const x = (i / barCount) * W;
        let h = (Math.sin(i * 0.38 + phaseRef.current * 2) * 0.5 + 0.5) *
                (Math.sin(i * 0.14 + phaseRef.current) * 0.3 + 0.7) *
                H * 0.38;

        // Custom reaction height multiplier based on theme
        if (theme === "Hyper-speed Strobe") {
          h *= 1.4; // High spikes
        } else if (theme === "Cosmic Orbit") {
          h *= 0.8; // Calmer orbits
        }
        
        const alpha = 0.14 + (h / (H * 0.38)) * 0.22;
        ctx.globalAlpha = alpha;

        // Theme dynamic colors
        if (theme === "Cosmic Orbit") {
          ctx.fillStyle = i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#f472b6" : "#6366f1";
        } else if (theme === "Holographic Beats") {
          ctx.fillStyle = i % 3 === 0 ? "#00f5ff" : i % 3 === 1 ? "#ff007f" : "#ffffff";
        } else if (theme === "Hyper-speed Strobe") {
          ctx.fillStyle = i % 3 === 0 ? "#ff4757" : i % 3 === 1 ? "#ffa502" : "#ffffff";
        } else {
          // Neon Rain
          ctx.fillStyle = i % 3 === 0 ? "#10ffb0" : i % 3 === 1 ? "#10b981" : "#fbbf24";
        }

        ctx.fillRect(x - 1, H / 2 - h / 2, 2, h);
      }
      ctx.globalAlpha = 1;

      // Increment phase factor (speed based on theme)
      let phaseSpeed = 0.038;
      if (theme === "Hyper-speed Strobe") {
        phaseSpeed = 0.11;
      } else if (theme === "Holographic Beats") {
        phaseSpeed = 0.06;
      } else if (theme === "Cosmic Orbit") {
        phaseSpeed = 0.022;
      }
      phaseRef.current += phaseSpeed;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, theme]);

  return (
    <div ref={containerRef} className="w-full h-[60px]">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
