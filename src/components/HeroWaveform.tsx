import { useEffect, useRef, useState } from "react";

export default function HeroWaveform() {
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

    const waves = [
      { freq: 0.038, amp: 0.33, color: "#00f5ff", alpha: 0.9, w: 2 },
      { freq: 0.065, amp: 0.22, color: "#8b5cf6", alpha: 0.7, w: 1.5 },
      { freq: 0.019, amp: 0.42, color: "#f472b6", alpha: 0.45, w: 1.5 },
    ];

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
          const y =
            H / 2 +
            Math.sin(x * w.freq + phaseRef.current + wi * 1.1) * w.amp * H * 0.5 +
            Math.sin(x * w.freq * 1.8 + phaseRef.current * 1.25) * w.amp * H * 0.16;
          
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
        ctx.shadowBlur = 7;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      // Draw reactive frequency bars
      const barCount = 48;
      for (let i = 0; i < barCount; i++) {
        const x = (i / barCount) * W;
        const h =
          (Math.sin(i * 0.38 + phaseRef.current * 2) * 0.5 + 0.5) *
          (Math.sin(i * 0.14 + phaseRef.current) * 0.3 + 0.7) *
          H *
          0.38;
        
        const alpha = 0.14 + (h / (H * 0.38)) * 0.22;
        ctx.globalAlpha = alpha;
        ctx.fillStyle =
          i % 3 === 0 ? "#00f5ff" : i % 3 === 1 ? "#8b5cf6" : "#f472b6";
        ctx.fillRect(x - 1, H / 2 - h / 2, 2, h);
      }
      ctx.globalAlpha = 1;

      // Increment phase
      phaseRef.current += 0.038;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-[60px]">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
