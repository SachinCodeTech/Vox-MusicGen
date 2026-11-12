import React, { useState, useRef, useEffect } from "react";
import {
  MUSICAL_KEYS,
  SCALE_TYPES,
  MusicalKey,
  ScaleTypeId,
  getScaleChords,
  renderWavAudio,
  generateMidiFile,
  triggerFileDownload,
} from "../utils/audioExport";
import {
  Volume2,
  Sliders,
  Music2,
  Download,
  Flame,
  Check,
  Disc3,
  Layers,
  Sparkles,
} from "lucide-react";

interface AudioMasterControlProps {
  currentBpm: number;
  onBpmChange: (bpm: number) => void;
  currentKey: string;
  onKeyChange: (key: string) => void;
  isPlaying: boolean;
  laneVolumes: {
    drums: number;
    synth: number;
    melody: number;
    vocal: number;
    ambient: number;
  };
  mutedLanes: {
    drums: boolean;
    synth: boolean;
    melody: boolean;
    vocal: boolean;
    ambient: boolean;
  };
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  getAudioContext: () => AudioContext | null;
  showToast: (msg: string) => void;
}

export const AudioMasterControl: React.FC<AudioMasterControlProps> = ({
  currentBpm,
  onBpmChange,
  currentKey,
  onKeyChange,
  isPlaying,
  laneVolumes,
  mutedLanes,
  masterVolume,
  onMasterVolumeChange,
  getAudioContext,
  showToast,
}) => {
  // ── TAP TEMPO STATE ──
  const [tappedBpm, setTappedBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── MUSICAL SCALE STATE ──
  const parseKey = (): { root: MusicalKey; scale: ScaleTypeId } => {
    const raw = currentKey || "A Minor";
    const matchedRoot = MUSICAL_KEYS.find((k) => raw.startsWith(k)) || "A";
    const isMajor = raw.toLowerCase().includes("maj");
    return {
      root: matchedRoot,
      scale: isMajor ? "major" : "minor",
    };
  };

  const parsed = parseKey();
  const [selectedRoot, setSelectedRoot] = useState<MusicalKey>(parsed.root);
  const [selectedScale, setSelectedScale] = useState<ScaleTypeId>(parsed.scale);

  // ── EXPORT STATE ──
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTarget, setExportTarget] = useState<string>("master");

  // ── VU METER SIMULATION BASED ON PLAYBACK & VOLUME ──
  const [vuLevel, setVuLevel] = useState<number>(0);
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const updateVu = () => {
        // Dynamic dancing level based on active volume
        const base = (masterVolume / 100) * 0.75;
        const jitter = Math.sin(Date.now() / 80) * 0.15 + Math.random() * 0.1;
        setVuLevel(Math.min(1.15, Math.max(0.1, base + jitter)));
        animId = requestAnimationFrame(updateVu);
      };
      animId = requestAnimationFrame(updateVu);
    } else {
      setVuLevel(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, masterVolume]);

  // Handle Tap Tempo
  const handleTap = () => {
    const now = Date.now();
    const ctx = getAudioContext();

    // Play tactile audio click
    if (ctx) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {
        console.warn(e);
      }
    }

    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

    const times = tapTimesRef.current;
    times.push(now);

    // Keep up to 6 recent taps
    if (times.length > 6) times.shift();

    if (times.length >= 2) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval);
      if (bpm >= 40 && bpm <= 260) {
        setTappedBpm(bpm);
        setTapCount(times.length);
      }
    } else {
      setTapCount(1);
    }

    // Reset after 2.5s of inactivity
    tapTimeoutRef.current = setTimeout(() => {
      tapTimesRef.current = [];
      setTapCount(0);
    }, 2500);
  };

  const applyTappedBpm = () => {
    if (tappedBpm) {
      onBpmChange(tappedBpm);
      showToast(`Tempo synchronized to ${tappedBpm} BPM!`);
      setTappedBpm(null);
    }
  };

  // Preview Chord via Web Audio
  const playPreviewChord = (chordFreqs: number[]) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      chordFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12 * (masterVolume / 100), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
      });
    } catch (e) {
      console.warn("Chord preview error:", e);
    }
  };

  // Scale changed
  const handleScaleSelect = (key: MusicalKey, scaleId: ScaleTypeId) => {
    setSelectedRoot(key);
    setSelectedScale(scaleId);
    const scaleObj = SCALE_TYPES.find((s) => s.id === scaleId);
    const formatted = `${key} ${scaleObj ? scaleObj.label.split(" ")[0] : "Minor"}`;
    onKeyChange(formatted);
    showToast(`Harmonic Scale locked: ${formatted}`);
  };

  // Trigger Audio Stems Render & Download
  const handleExportWav = async (target: "all" | "drums" | "synth" | "melody" | "vocal" | "ambient") => {
    setIsExporting(true);
    setExportTarget(target);
    setExportProgress(10);
    try {
      showToast(`Rendering 16-bit 44.1kHz WAV: ${target.toUpperCase()}...`);
      const blob = await renderWavAudio(
        {
          bpm: currentBpm,
          durationSeconds: 16,
          rootKey: selectedRoot,
          scaleId: selectedScale,
          volumes: laneVolumes,
          mutes: mutedLanes,
          targetStem: target,
        },
        (pct) => setExportProgress(pct)
      );

      const filename = `VoxMusicGen_${selectedRoot}_${selectedScale}_${target}_${currentBpm}BPM.wav`;
      triggerFileDownload(blob, filename);
      showToast(`Downloaded: ${filename}`);
    } catch (err: any) {
      console.error("Export error:", err);
      showToast(`Export error: ${err.message || "Failed to render"}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Trigger MIDI Export
  const handleExportMidi = () => {
    try {
      const chords = getScaleChords(selectedRoot, selectedScale);
      const midiBlob = generateMidiFile(currentBpm, chords);
      const filename = `VoxMusicGen_${selectedRoot}_${selectedScale}_Progression_${currentBpm}BPM.mid`;
      triggerFileDownload(midiBlob, filename);
      showToast(`Downloaded MIDI: ${filename}`);
    } catch (err: any) {
      showToast(`MIDI export error: ${err.message}`);
    }
  };

  const scaleChords = getScaleChords(selectedRoot, selectedScale);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0c0d21]/90 to-[#04050e]/95 border border-white/10 p-5 shadow-2xl relative overflow-hidden text-left mb-6">
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#00f5ff]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f5ff]/20 to-[#8b5cf6]/20 border border-[#00f5ff]/30 flex items-center justify-center text-[#00f5ff] shadow-inner">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              Master Precision Console
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#10ffb0]/15 text-[#10ffb0] border border-[#10ffb0]/30">
                PRO ENGINE
              </span>
            </h3>
            <p className="text-[10px] font-mono text-dim">
              Tempo Lock · Harmonic Scale Quantizer · VU Limiter · True WAV Stems
            </p>
          </div>
        </div>

        {/* Live VU Peak Meter */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-mono text-dim tracking-wider uppercase">VU PEAK</span>
            <span className={`text-[10px] font-mono font-bold ${vuLevel > 1.0 ? "text-[#ff4757] animate-pulse" : "text-[#10ffb0]"}`}>
              {isPlaying ? `${(vuLevel * 100).toFixed(0)}%` : "0%"}
            </span>
          </div>
          <div className="flex items-end gap-1 h-6">
            {[...Array(12)].map((_, i) => {
              const active = isPlaying && (i / 12) <= vuLevel;
              const isRed = i >= 10;
              const isAmber = i >= 7 && i < 10;
              const colorClass = isRed
                ? "bg-[#ff4757] shadow-[0_0_6px_#ff4757]"
                : isAmber
                ? "bg-[#fbbf24] shadow-[0_0_5px_#fbbf24]"
                : "bg-[#10ffb0] shadow-[0_0_4px_#10ffb0]";
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-xs transition-all duration-75 ${
                    active ? colorClass : "bg-white/10"
                  }`}
                  style={{ height: `${(i + 1) * 2}px` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ── 1. TAP TEMPO & MASTER GAIN ── */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-[#00f5ff] font-bold tracking-wider">
                1. Tap Tempo Engine
              </span>
              <span className="text-[11px] font-mono font-bold text-white">
                {currentBpm} BPM
              </span>
            </div>
            <p className="text-[11px] text-secondary mb-3">
              Tap rhythmically to match any song or beat in your head.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTap}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f5ff]/20 to-[#8b5cf6]/20 hover:from-[#00f5ff]/30 hover:to-[#8b5cf6]/30 border border-[#00f5ff]/40 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg select-none"
              >
                <Flame className={`w-4 h-4 text-[#00f5ff] ${tapCount > 0 ? "animate-bounce" : ""}`} />
                <span>TAP BEAT</span>
                {tapCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/15">
                    {tapCount}
                  </span>
                )}
              </button>

              {tappedBpm && (
                <div className="flex flex-col items-center">
                  <span className="text-[13px] font-mono font-black text-[#10ffb0]">
                    {tappedBpm}
                  </span>
                  <button
                    type="button"
                    onClick={applyTappedBpm}
                    className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-[#10ffb0]/20 text-[#10ffb0] border border-[#10ffb0]/40 hover:bg-[#10ffb0]/30 transition-all cursor-pointer mt-1"
                  >
                    SYNC BPM
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Master Volume Slider with Limiter */}
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono text-dim mb-1.5">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#00f5ff]" />
                Master Gain (0–125%)
              </span>
              <span className="text-white font-bold">{masterVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={125}
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f5ff]"
            />
            <div className="flex justify-between text-[8px] font-mono text-dim mt-1">
              <span>Mute</span>
              <span>Unity (100%)</span>
              <span className="text-[#ff4757]">+2.5dB Boost</span>
            </div>
          </div>
        </div>

        {/* ── 2. SCALE & HARMONIC ENGINE ── */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8b5cf6] font-bold tracking-wider flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5" />
              2. Harmonic Key & Scale
            </span>
            <span className="text-[10px] font-mono text-[#8b5cf6] font-bold">
              {selectedRoot} {SCALE_TYPES.find((s) => s.id === selectedScale)?.label.split(" ")[0]}
            </span>
          </div>

          {/* Root Key Selector */}
          <div>
            <span className="text-[8px] font-mono text-dim uppercase block mb-1">Root Key:</span>
            <div className="flex flex-wrap gap-1">
              {MUSICAL_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleScaleSelect(k, selectedScale)}
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer border ${
                    selectedRoot === k
                      ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-sm"
                      : "bg-white/[0.02] text-dim border-transparent hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Type Selector */}
          <div>
            <span className="text-[8px] font-mono text-dim uppercase block mb-1">Scale / Mode:</span>
            <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-1">
              {SCALE_TYPES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleScaleSelect(selectedRoot, st.id)}
                  className={`text-[9px] font-mono text-left px-2 py-1 rounded transition-all cursor-pointer truncate border ${
                    selectedScale === st.id
                      ? "bg-[#8b5cf6]/20 text-white border-[#8b5cf6]/50"
                      : "bg-white/[0.01] text-dim border-transparent hover:bg-white/5 hover:text-secondary"
                  }`}
                  title={st.vibe}
                >
                  {st.label.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Diatonic Chord Audition Buttons */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[8px] font-mono text-dim uppercase block mb-1">Audition Chords:</span>
            <div className="grid grid-cols-4 gap-1">
              {["i", "VI", "III", "VII"].map((roman, idx) => (
                <button
                  key={roman}
                  type="button"
                  onClick={() => playPreviewChord(scaleChords[idx] || scaleChords[0])}
                  className="py-1 px-1 rounded bg-white/[0.03] hover:bg-white/10 border border-white/5 text-[9px] font-mono text-secondary hover:text-[#00f5ff] flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
                  title="Click to play chord triad"
                >
                  <span className="font-bold">{roman}</span>
                  <span className="text-[7px] text-dim">Play</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. TRUE MULTITRACK WAV & MIDI EXPORT ── */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-[#10ffb0] font-bold tracking-wider flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                3. WAV Stems & MIDI
              </span>
              <span className="text-[9px] font-mono text-dim">44.1kHz · 16-bit</span>
            </div>
            <p className="text-[11px] text-secondary mb-3">
              Export studio-grade uncompressed multitrack audio directly to your device.
            </p>

            {/* Progress Bar when rendering */}
            {isExporting && (
              <div className="mb-3 p-2.5 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/20">
                <div className="flex justify-between text-[9px] font-mono text-[#00f5ff] mb-1">
                  <span className="flex items-center gap-1">
                    <Disc3 className="w-3 h-3 animate-spin" /> Rendering {exportTarget.toUpperCase()}...
                  </span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00f5ff] to-[#10ffb0] transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Export Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportWav("all")}
                className="py-2 px-2 rounded-xl bg-[#10ffb0]/15 hover:bg-[#10ffb0]/25 border border-[#10ffb0]/40 text-[#10ffb0] font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
              >
                <Disc3 className="w-3.5 h-3.5" />
                <span>MASTER WAV</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportMidi}
                className="py-2 px-2 rounded-xl bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 border border-[#8b5cf6]/40 text-white font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span>CHORD MIDI</span>
              </button>
            </div>
          </div>

          {/* Individual Stem Export Buttons */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[8px] font-mono text-dim uppercase block mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Export Individual Stems (.wav):
            </span>
            <div className="grid grid-cols-4 gap-1">
              {(["drums", "synth", "melody", "vocal"] as const).map((stem) => (
                <button
                  key={stem}
                  type="button"
                  disabled={isExporting}
                  onClick={() => handleExportWav(stem)}
                  className="py-1 px-1 rounded bg-white/[0.03] hover:bg-white/10 border border-white/5 text-[8.5px] font-mono text-secondary hover:text-white uppercase transition-all cursor-pointer disabled:opacity-40"
                >
                  {stem}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
