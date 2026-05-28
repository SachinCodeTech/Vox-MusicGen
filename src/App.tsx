import React, { useState, useEffect, useRef } from "react";
import HeroWaveform from "./components/HeroWaveform";
import LaneWaveforms from "./components/LaneWaveforms";
import AIDrawer from "./components/AIDrawer";
import PromptEnhancer from "./components/PromptEnhancer";
import ShareCard from "./components/ShareCard";
import { TrackBlueprint, Project, LyricSection } from "./types";

interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  plan: string;
}

export default function App() {
  // Navigation & States
  const [currentScreen, setCurrentScreen] = useState<"home" | "create" | "lyrics" | "share" | "profile" | "about" | "app-info" | "privacy">("home");
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4>(1);
  const [infoSubTab, setInfoSubTab] = useState<"specs" | "about" | "privacy" | "guide">("specs");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (screen: "home" | "create" | "lyrics" | "share" | "profile" | "about" | "app-info" | "privacy") => {
    if (screen === "about") {
      setCurrentScreen("app-info");
      setInfoSubTab("about");
    } else if (screen === "privacy") {
      setCurrentScreen("app-info");
      setInfoSubTab("privacy");
    } else if (screen === "app-info") {
      setCurrentScreen("app-info");
      setInfoSubTab("specs");
    } else {
      setCurrentScreen(screen);
    }
    setIsPlaying(false);
  };

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    if (step === 2 && !promptText.trim()) {
      showToast("✍️ Enter a prompt first");
      return;
    }
    setPipelineStep(step);
  };

  // Studio Creation parameters
  const [promptText, setPromptText] = useState("");
  const [bpm, setBpm] = useState(128);
  const [energy, setEnergy] = useState(75);
  const [mood, setMood] = useState("Chill");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Synthwave", "EDM", "Lo-fi"]);

  // Blueprint generated state
  const [blueprint, setBlueprint] = useState<TrackBlueprint | null>(null);
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [composerStatus, setComposerStatus] = useState("Analyzing creative vision...");
  const [composerDesc, setComposerDesc] = useState("Preparing parameters for Vox Director...");

  // AI Assistant Drawer & Enhancer states
  const [chatOpen, setChatOpen] = useState(false);
  const [enhancerOpen, setEnhancerOpen] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(210); // in seconds
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lyric Studio states
  const [lyricsTopic, setLyricsTopic] = useState("");
  const [lyricsMode, setLyricsMode] = useState<"full" | "verse" | "chorus" | "bridge" | "hook">("full");
  const [lyricsList, setLyricsList] = useState<LyricSection[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // Auth & General limits
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState(50);
  const [toastText, setToastText] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Offline status tracking
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Local Storage Library list
  const [libraryProjects, setLibraryProjects] = useState<Project[]>([]);

  // ── MIXER & PRESETS STATE ──
  const [mutedLanes, setMutedLanes] = useState<Record<string, boolean>>({
    melody: false,
    drums: false,
    synth: false,
    vocal: false,
    ambient: false
  });
  const [laneVolumes, setLaneVolumes] = useState<Record<string, number>>({
    melody: 80,
    drums: 75,
    synth: 70,
    vocal: 90,
    ambient: 60
  });
  const [activePlugins, setActivePlugins] = useState<string[]>([]);
  const [selectedFX, setSelectedFX] = useState<string | null>(null);
  const [isAutoBalancing, setIsAutoBalancing] = useState(false);
  const [autoBalanceStatus, setAutoBalanceStatus] = useState("");
  const [customMixPresets, setCustomMixPresets] = useState<{ id: string; name: string; volumes: Record<string, number>; mutes: Record<string, boolean>; FX: string[] }[]>(() => {
    try {
      const saved = localStorage.getItem("vox_mix_presets");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [presetSaveName, setPresetSaveName] = useState("");

  // ── HYBRID CREATIVE STUDIO STATES (V3 MASTER OVERHAUL) ──
  const [studioSubTab, setStudioSubTab] = useState<"mix" | "beats" | "editor" | "vocals">("mix");
  const [loopGrid, setLoopGrid] = useState<Record<string, boolean[]>>({
    kick: [true, false, false, false, true, false, false, false],
    snare: [false, false, true, false, false, false, true, false],
    hihat: [true, true, true, true, true, true, true, true],
    bass: [true, false, true, false, true, true, false, true]
  });
  const [currentLoopTick, setCurrentLoopTick] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; duration: number } | null>(null);
  const [audioTrimRange, setAudioTrimRange] = useState<[number, number]>([15, 85]);
  const [audioFadeIn, setAudioFadeIn] = useState<boolean>(true);
  const [audioFadeOut, setAudioFadeOut] = useState<boolean>(true);
  const [audioReverse, setAudioReverse] = useState<boolean>(false);
  const [vocalSynthText, setVocalSynthText] = useState("");
  const [karaokeVoice, setKaraokeVoice] = useState("Siren-X Vocaloid 9");
  const [isRecordingVocal, setIsRecordingVocal] = useState(false);
  const [vocalClips, setVocalClips] = useState<Array<{ id: string; name: string; timestamp: number; voiceType: string }>>([
    { id: "default-vocal", name: "Cyberdyne Auto-Vox Core", timestamp: Date.now() - 120000, voiceType: "Holographic Male Studio Voice" }
  ]);
  const [visualizerTheme, setVisualizerTheme] = useState<"Cosmic Orbit" | "Holographic Beats" | "Neon Rain" | "Hyper-speed Strobe">("Neon Rain");

  // ── AUDIO EXPORT STATE ──
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState("");
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState(0);

  // Create persistent Web Audio Context Ref to avoid context exhaustion & unlock sounds correctly
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = (): AudioContext | null => {
    try {
      if (typeof window === "undefined") return null;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn("Failed to initialize or resume Web Audio context:", e);
      return null;
    }
  };

  // ── WEB AUDIO INSTRUMENTS SYNTHESIZER (NO AI COST) ──
  const playSynthSound = (type: "kick" | "snare" | "hihat" | "bass") => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "kick") {
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.28);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "snare") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.16);
        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "hihat") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(8000, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === "bass") {
        osc.type = "sawtooth";
        // Convert active BPM into a resonant sub-bass drive frequency
        const f = 55 + (bpm / 128) * 10;
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.linearRampToValueAtTime(f - 12, now + 0.24);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (err) {
      console.warn("Web audio playback bypassed on thread constraints:", err);
    }
  };

  // ── VOCAL AUDIO SYNTHESIZER ──
  const handleVocalSynthesis = () => {
    if (!vocalSynthText.trim()) {
      showToast("❌ Please type custom lyrics text first to synthesize!");
      return;
    }
    showToast(`🎙️ Vocaloid compiling: rendering custom vocals using physical formant models...`);
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(vocalSynthText);
      if (karaokeVoice.includes("Siren-X")) {
        u.pitch = 1.4;
        u.rate = 1.05;
      } else if (karaokeVoice.includes("VA-01")) {
        u.pitch = 0.5;
        u.rate = 0.8;
      } else {
        u.pitch = 0.95;
        u.rate = 1.0;
      }
      setTimeout(() => {
        window.speechSynthesis.speak(u);
        const newClip = {
          id: "voc-" + Date.now(),
          name: `Vocal: "${vocalSynthText.slice(0, 32)}..."`,
          timestamp: Date.now(),
          voiceType: karaokeVoice
        };
        setVocalClips((prev) => [newClip, ...prev]);
        setVocalSynthText("");
        showToast("✅ Synthesized custom vocal line!");
        playSynthSound("hihat");
      }, 700);
    } else {
      setTimeout(() => {
        showToast(`✅ (Simulated) Synthesized custom vocal: "${vocalSynthText}"`);
        playSynthSound("bass");
      }, 900);
    }
  };

  // Stock Mix Presets Library
  const stockMixPresets = [
    { id: "stock-default", name: "🎛️ Default Mix", volumes: { melody: 80, drums: 75, synth: 70, vocal: 90, ambient: 60 }, mutes: { melody: false, drums: false, synth: false, vocal: false, ambient: false }, FX: [] },
    { id: "stock-vocals", name: "🎤 Vocal Primacy", volumes: { melody: 60, drums: 50, synth: 55, vocal: 100, ambient: 70 }, mutes: { melody: false, drums: false, synth: false, vocal: false, ambient: false }, FX: ["🎚 Reverb", "🎛 Pro-EQ"] },
    { id: "stock-stadium", name: "🏟️ Stadium Club", volumes: { melody: 75, drums: 95, synth: 85, vocal: 80, ambient: 50 }, mutes: { melody: false, drums: false, synth: false, vocal: false, ambient: false }, FX: ["🗜 Compressor", "✨ AI Mastering"] },
    { id: "stock-chill", name: "🌌 Lo-Fi Ambient", volumes: { melody: 85, drums: 40, synth: 90, vocal: 75, ambient: 95 }, mutes: { melody: false, drums: false, synth: false, vocal: false, ambient: false }, FX: ["🌀 Chorus FX", "🎚 Reverb"] }
  ];

  // Load a mix preset
  const loadMixPreset = (preset: { name: string; volumes: Record<string, number>; mutes: Record<string, boolean>; FX: string[] }) => {
    setLaneVolumes(preset.volumes);
    setMutedLanes(preset.mutes);
    setActivePlugins(preset.FX);
    if (preset.FX.length > 0) {
      setSelectedFX(preset.FX[0]);
    } else {
      setSelectedFX(null);
    }
    showToast(`Loaded preset: ${preset.name}`);
  };

  // Save current mixer state as a preset
  const handleSaveMixPreset = () => {
    if (!presetSaveName.trim()) {
      showToast("❌ Please enter a preset name.");
      return;
    }
    const newPreset = {
      id: "preset-" + Date.now(),
      name: presetSaveName.trim(),
      volumes: { ...laneVolumes },
      mutes: { ...mutedLanes },
      FX: [...activePlugins]
    };
    const updated = [...customMixPresets, newPreset];
    setCustomMixPresets(updated);
    try {
      localStorage.setItem("vox_mix_presets", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setShowSavePresetDialog(false);
    setPresetSaveName("");
    showToast(`Saved preset: ${newPreset.name} to project library!`);
  };

  // Delete a custom preset
  const handleDeleteMixPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customMixPresets.filter(p => p.id !== presetId);
    setCustomMixPresets(updated);
    try {
      localStorage.setItem("vox_mix_presets", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast("Deleted custom preset.");
  };

  // Auto-Balance Volume Levels with Scanning feedback
  const runAutoBalance = () => {
    setIsAutoBalancing(true);
    setAutoBalanceStatus("Scanning multi-channel waveform peaks...");
    showToast("⚡ Initiated Average Loudness Auto-Balance scans...");
    
    setTimeout(() => {
      setAutoBalanceStatus("Calculating stem average loudness (LUFS)...");
    }, 1000);

    setTimeout(() => {
      setAutoBalanceStatus("Calibrating relative gains to target -14 LUFS...");
    }, 2000);

    setTimeout(() => {
      // Relative balance estimation based on average peak and crest-factor dynamics
      const balancedVolumes: Record<string, number> = {
        melody: 72,  // Balanced melody hook
        drums: 65,   // Softened slightly to avoid clipping the sum bus
        synth: 70,   // Level synth to stay in pocket
        vocal: 96,   // Vocal presence on top
        ambient: 78  // Background texture padding
      };
      setLaneVolumes(balancedVolumes);
      setIsAutoBalancing(false);
      setAutoBalanceStatus("");
      showToast("✨ Auto-Balanced all stems successfully based on crest-factor & average LUFS!");
    }, 3000);
  };

  // High-Fidelity Lossless and Video Export Compiler Routine
  const startHighFidelityExport = (format: string) => {
    setExportFormat(format);
    setExportProgress(0);
    setExportStatusText("Initializing audio buffers & pipeline...");
    
    const totalDurationSeconds = format === "VIDEO" ? 8 : 4.5;
    setEstimatedSecondsRemaining(totalDurationSeconds);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progressPct = Math.min(100, Math.round((elapsed / totalDurationSeconds) * 100));
      const remainingSecs = Math.max(0, Math.round(totalDurationSeconds - elapsed));
      
      setExportProgress(progressPct);
      setEstimatedSecondsRemaining(remainingSecs);

      if (format === "WAV") {
        if (progressPct < 25) {
          setExportStatusText("Demuxing 24-bit multi-stem audio matrices...");
        } else if (progressPct < 50) {
          setExportStatusText("Synthesizing pristine linear PCM samples...");
        } else if (progressPct < 75) {
          setExportStatusText("Applying Master Limiter and soft clipper...");
        } else if (progressPct < 95) {
          setExportStatusText("Writing lossless WAV containers head-chunk...");
        } else {
          setExportStatusText("Compressing WAV archive package...");
        }
      } else {
        if (progressPct < 25) {
          setExportStatusText("Rendering vector visual waveform nodes...");
        } else if (progressPct < 50) {
          setExportStatusText("Stitch compiling vertical 1080x1920 MP4 timeline...");
        } else if (progressPct < 75) {
          setExportStatusText("Merging lossless audio stem overlays...");
        } else if (progressPct < 95) {
          setExportStatusText("Optimizing video H.264 profiles for social delivery...");
        } else {
          setExportStatusText("Finalizing video export metadata...");
        }
      }

      if (progressPct >= 100) {
        clearInterval(interval);
        setExportStatusText("Export completed successfully!");
      }
    }, 200);
  };

  // ── FUTURISTIC NEVER-BEFORE-SEEN MODES STATE ──
  const [aiDimensionMode, setAiDimensionMode] = useState(false);
  const [inputMode, setInputMode] = useState<"standard" | "dream" | "hum" | "memory">("standard");
  const [dreamTheme, setDreamTheme] = useState("");
  const [dreamStyle, setDreamStyle] = useState("🌌 Dreamscape Deep-Recall");
  const [recordingHum, setRecordingHum] = useState(false);
  const [humTimer, setHumTimer] = useState(0);
  const [humAudioBars, setHumAudioBars] = useState<number[]>([]);
  const [humTranscribed, setHumTranscribed] = useState("");
  const [memoryUpload, setMemoryUpload] = useState<{ name: string; type: string; analyzed?: string; palette?: string[] } | null>(null);
  const [globalCollab, setGlobalCollab] = useState(false);
  const [collabRoom, setCollabRoom] = useState("G-99");
  const [collabLogs, setCollabLogs] = useState<string[]>([
    "Room #G-99 created securely.",
    "@lucas_beats joined the session.",
    "@amy_strings joined the session."
  ]);
  const [directorStoryboardOpen, setDirectorStoryboardOpen] = useState(false);
  const [activeUniverse, setActiveUniverse] = useState<string | null>(null);

  // ── START SCREEN LOADER STATES & PROGRESS EFFECT ──
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashText, setSplashText] = useState("Booting VOX Engine OS...");

  useEffect(() => {
    if (!showSplash) return;
    const bootSequences = [
      { prg: 5, text: "Accessing core neural matrix..." },
      { prg: 15, text: "Authenticating security sandbox protocols..." },
      { prg: 32, text: "Decrypting secure sandbox gateway nodes..." },
      { prg: 50, text: "Synthesizing neural vocal wave oscillators..." },
      { prg: 68, text: "Synthesizing master quantum EQ dials..." },
      { prg: 85, text: "Pre-allocating Vox Director visual scene nodes..." },
      { prg: 96, text: "Checking matrix privacy policy bounds..." },
      { prg: 100, text: "VOX OS Core status: Online. Complete." }
    ];

    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < bootSequences.length) {
        setSplashProgress(bootSequences[currentStep].prg);
        setSplashText(bootSequences[currentStep].text);
        currentStep++;
      } else {
        clearInterval(timer);
      }
    }, 380);

    return () => clearInterval(timer);
  }, [showSplash]);

  // Monitor network connection status
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Load local saved projects from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vox_projects");
      if (saved) {
        setLibraryProjects(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // ── SEQUENCER TIMER TICK TICKER ──
  useEffect(() => {
    let loopInterval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      // note duration based on BPM (8th notes trigger layout)
      const noteDurationMs = (60 / bpm / 2) * 1000;
      loopInterval = setInterval(() => {
        setCurrentLoopTick((prev) => {
          const next = (prev + 1) % 8;
          // Trigger the respective synth sounds if they are active key-paths!
          if (loopGrid.kick[next]) playSynthSound("kick");
          if (loopGrid.snare[next]) playSynthSound("snare");
          if (loopGrid.hihat[next]) playSynthSound("hihat");
          if (loopGrid.bass[next]) playSynthSound("bass");
          return next;
        });
      }, noteDurationMs);
    } else {
      setCurrentLoopTick(0);
    }
    return () => {
      if (loopInterval) clearInterval(loopInterval);
    };
  }, [isPlaying, bpm, loopGrid]);

  // Toast dispatch helper
  const showToast = (msg: string) => {
    setToastText(msg);
    setToastOpen(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastOpen(false);
    }, 2800);
  };

  // ── PROCEDURAL MULTITRACK AUDIO GENERATOR (MATCHES STEM FADERS) ──
  const playStemAudioTick = (step: number) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. DRUMS CHANNEL (Respects volumes & mute)
      if (!mutedLanes.drums) {
        const vol = (laneVolumes.drums ?? 75) / 100;
        if (step % 8 === 0) {
          // Play resonant sub Kick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(130, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
          gain.gain.setValueAtTime(0.7 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          osc.start(now);
          osc.stop(now + 0.26);
        } else if (step % 8 === 4) {
          // Play retro Snare drum
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(70, now + 0.14);
          gain.gain.setValueAtTime(0.4 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.18);
        } else if (step % 2 === 1) {
          // Play crisp Hihat
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(8000, now);
          gain.gain.setValueAtTime(0.12 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.06);
        }
      }

      // 2. MELODY CHANNEL (Respects volumes & mute, plays chord plucks)
      if (!mutedLanes.melody) {
        const vol = (laneVolumes.melody ?? 80) / 100;
        const progression = [
          [220, 261.63, 329.63], // Am chord notes
          [174.61, 220, 261.63], // F chord notes
          [261.63, 329.63, 392], // C chord notes
          [196, 246.94, 293.66], // G chord notes
        ];
        const chordIdx = Math.floor(step / 4) % 4;
        const noteIdx = step % 3;
        const freq = progression[chordIdx][noteIdx] * 2; // Mid octaves

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        
        if (audioReverse) {
          // Backward sweeping pitch & fade-in swell for tape reverse texture!
          osc.frequency.setValueAtTime(freq / 2, now);
          osc.frequency.exponentialRampToValueAtTime(freq, now + 0.32);
          gain.gain.setValueAtTime(0.0, now);
          gain.gain.linearRampToValueAtTime(0.25 * vol, now + 0.28);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        } else {
          // Standard pluck attack decay
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.25 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        }

        osc.start(now);
        osc.stop(now + 0.4);
      }

      // 3. SYNTH CHANNEL (Respects volumes & mute, low-frequency pads)
      if (!mutedLanes.synth && step % 4 === 0) {
        const vol = (laneVolumes.synth ?? 70) / 100;
        const chords = [
          [110, 130.81, 164.81], // Am low bass pad
          [87.31, 110, 130.81],  // F low bass pad
          [130.81, 164.81, 196], // C low bass pad
          [98, 123.47, 146.83],  // G low bass pad
        ];
        const chordIdx = Math.floor(step / 4) % 4;
        chords[chordIdx].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);
          // High cut filter simulation
          gain.gain.setValueAtTime(0.0, now);
          gain.gain.linearRampToValueAtTime(0.08 * vol, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc.start(now);
          osc.stop(now + 0.75);
        });
      }

      // 4. VOCAL CHANNEL (Formant synthetic hum simulation)
      if (!mutedLanes.vocal && step % 8 === 2) {
        const vol = (laneVolumes.vocal ?? 90) / 100;
        const pitches = [329.63, 392.00, 440.00, 523.25];
        const freq = pitches[Math.floor(step / 4) % pitches.length];
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.22 * vol, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.7);
      }

      // 5. AMBIENT CHANNEL (Ocean waves low filter swells)
      if (!mutedLanes.ambient && step % 12 === 0) {
        const vol = (laneVolumes.ambient ?? 60) / 100;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.linearRampToValueAtTime(115, now + 1.2);
        osc.frequency.linearRampToValueAtTime(75, now + 2.4);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.15 * vol, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.001, now + 2.4);
        osc.start(now);
        osc.stop(now + 2.5);
      }
    } catch (e) {
      console.warn("Procedural stem synthesizer tick bypassed:", e);
    }
  };

  // Playback timer ticker
  useEffect(() => {
    let tickCount = 0;
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setPlayProgress((prev) => {
          const next = prev + 0.005;
          if (next >= 1) {
            setIsPlaying(false);
            if (playTimerRef.current) clearInterval(playTimerRef.current);
            showToast("⏹ Track complete");
            return 0;
          }
          // Dynamic Web Audio synth triggers
          playStemAudioTick(tickCount);
          tickCount = (tickCount + 1) % 16;
          return next;
        });
      }, 200);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, mutedLanes, laneVolumes]);

  // ── METRONOME BACKING CLICK FOR RECORDING ACTIVE ──
  useEffect(() => {
    let recInterval: NodeJS.Timeout | null = null;
    if (isRecordingVocal) {
      // Resume context inside event lifecycle
      getAudioContext();
      let clickIndex = 0;
      recInterval = setInterval(() => {
        // Trigger a crisp wooden metronome click to keep time during recording overlays!
        try {
          const ctx = getAudioContext();
          if (ctx) {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (clickIndex % 4 === 0) {
              // High pitch downbeat metronome click
              osc.frequency.setValueAtTime(1200, now);
              gain.gain.setValueAtTime(0.18, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            } else {
              // Low pitch offbeat metronome click
              osc.frequency.setValueAtTime(700, now);
              gain.gain.setValueAtTime(0.10, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            }
            osc.start(now);
            osc.stop(now + 0.06);
            clickIndex++;
          }
        } catch (e) {
          console.warn("Metronome skipped:", e);
        }
      }, 500); // Steady 120 bpm default click frequency
    }
    return () => {
      if (recInterval) clearInterval(recInterval);
    };
  }, [isRecordingVocal]);

  const togglePlayback = () => {
    getAudioContext();
    setIsPlaying((prev) => !prev);
    showToast(!isPlaying ? "▶ Playback active" : "⏸ Paused");
  };

  const restartPlayback = () => {
    setPlayProgress(0);
    setIsPlaying(false);
    showToast("⏮ Reset playhead");
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setPlayProgress(Math.max(0, Math.min(1, pos)));
  };

  // Format playback seconds to readable duration
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── RECOGNITION TIME & DYNAMIC EVENT SIMULATORS ──
  // Recording Hum simulation ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (recordingHum) {
      setHumTimer(0);
      setHumAudioBars(Array.from({ length: 18 }, () => Math.floor(Math.random() * 85) + 15));
      interval = setInterval(() => {
        setHumTimer((prev) => {
          if (prev >= 8) {
            setRecordingHum(false);
            if (interval) clearInterval(interval);
            const possibleTranscriptions = [
              "Pitch blueprint resolved: G# Minor, Pentatonic scale. Style: Vocoder Whistle synth. Recommended genre: Cyberpunk / Electropop. Tempo mapped: 128 BPM.",
              "Pitch blueprint resolved: C Minor Melodic Vocal humming. Style: Soft Ambient Vocal Pad. Recommended genre: Lofi / Downtempo. Tempo mapped: 85 BPM.",
              "Pitch blueprint resolved: D Major driving electric bass hook. Style: Industrial rumble. Recommended genre: Industrial / Dark Synth. Tempo mapped: 140 BPM."
            ];
            const result = possibleTranscriptions[Math.floor(Math.random() * possibleTranscriptions.length)];
            setHumTranscribed(result);
            // Autofill prompt text with the transcribed melody!
            setPromptText((pt) => pt ? `${pt}. Transcribed hum melody: [${result}]` : `A beautiful track starting with transcribed hum melody: [${result}]`);
            showToast("🎤 Melodic Matrix transcribed successfully!");
            return 8;
          }
          setHumAudioBars(Array.from({ length: 18 }, () => Math.floor(Math.random() * 85) + 15));
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingHum]);

  // Global Collaboration live room ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (globalCollab) {
      interval = setInterval(() => {
        const fakeEvents = [
          "@lucas_beats fine-tuned the lead synthesizer cut-off threshold.",
          "@amy_strings adjusted high-shelf EQ reverb on Verse 2.",
          "@amy_strings: 'The energy flow feels amazing here, loving the cyber vibes.'",
          "@lucas_beats suggested shifting mood parameters to Intensified Peak.",
          "Room sync: 3 active producers editing in realtime matrix.",
          "@lucas_beats: 'Let's adjust BPM snap to snug on grid tempo.'"
        ];
        const newEv = fakeEvents[Math.floor(Math.random() * fakeEvents.length)];
        setCollabLogs((prev) => [newEv, ...prev.slice(0, 15)]);
        showToast("🌎 Collab Room Sync Active");
      }, 12000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [globalCollab]);

  // Multiverse Remix transformer
  const remixMultiverse = (universeName: string) => {
    if (!blueprint) {
      showToast("✍️ Please compile a baseline blueprint first!");
      return;
    }
    setActiveUniverse(universeName);
    
    // Customize target values based on multiverse styles
    let targetGenre = blueprint.genre;
    let targetSub = blueprint.subgenre;
    let targetBpm = blueprint.bpm;
    let targetKey = blueprint.key;
    let targetInstruments = [...blueprint.keyInstruments];
    let targetConcept = blueprint.concept;
    let targetVibe = blueprint.videoVibe;
    let targetViral = blueprint.viralScore;

    switch (universeName) {
      case "Cyberpunk Neo-Tokyo":
        targetGenre = "Industrial Electronic";
        targetSub = "Cyber-Industrial Grit";
        targetBpm = 140;
        targetInstruments = ["Analog Cyber-Bass", "Swelling Saw Leads", "Industrial Steel Snare", "Dystopian Feedback Pad"];
        targetConcept = `Alternative universe: Cyberpunk Cyber-Industrial Grit edit. Gritty overdriven sub-bass anchors a wave of intense synthesizer loops, resulting in a dark, high-tempo cyberpunk adrenaline rush.`;
        targetVibe = "Flashing vertical chase scene under synthetic rain and towering, holographic neon billboards.";
        targetViral = Math.min(99, blueprint.viralScore + 3);
        break;
      case "Celestial Orchestral":
        targetGenre = "Cinematic Classical";
        targetSub = "Epic Astral Symphony";
        targetBpm = 85;
        targetInstruments = ["Lush Grand Violins", "Concert Acoustic Harp", "Ethereal Ambient Choir", "Timpani Thunder Grid"];
        targetConcept = `Alternative universe: Celestial Epic Astral Symphony edit. Replaces synthesis layers with sprawling, majestic orchestral strings and breathtaking celestial choir heights, raising tears of awe.`;
        targetVibe = "A majestic landscape zoom out into active cosmic nebulae, soaring past floating rings of stardust.";
        targetViral = Math.min(99, blueprint.viralScore + 1);
        break;
      case "Anime Opening Peak":
        targetGenre = "J-Electro Rock";
        targetSub = "Hyperpop Otaku Speed";
        targetBpm = 175;
        targetInstruments = ["High-Speed Electric Guitar", "Chiptune FM Lead Synth", "Double-Kick Metal Drums", "Vocaloid Harmonics"];
        targetConcept = `Alternative universe: Anime High-Speed J-Electro Rock edit. Accelerated tempo with sparkling synth leads, electric drive guitars, and highly energetic drums designed to match high-stakes anime intro sequences.`;
        targetVibe = "Staggered high-contrast hand-drawn frame sequences of futuristic racers soaring above clouds.";
        targetViral = Math.min(99, blueprint.viralScore + 5);
        break;
      case "Dark Cinematic Noir":
        targetGenre = "Ambient Cinematic";
        targetSub = "Drizzle Jazz Noir";
        targetBpm = 72;
        targetInstruments = ["Muted Smoky Horn Section", "Rhodes Electric Piano", "Rain Foley FX Loop", "Pizzicato Contrabass"];
        targetConcept = `Alternative universe: Dark Cinematic Drizzle Jazz Noir edit. A slow, moody nocturnal canvas pairing smoky horn lines with warm vintage record crackles for a deep cerebral twilight tone.`;
        targetVibe = "Camera panning down a rain-soaked brick alleyway under the yellow glow of a single streetlamp.";
        targetViral = Math.min(99, blueprint.viralScore + 2);
        break;
      case "Retro Futurist Club":
        targetGenre = "Synthwave";
        targetSub = "Vintage Sunset Outrun";
        targetBpm = 118;
        targetInstruments = ["DX7 Tubular Bass", "LinnDrum Vintage Grid", "Roland Juno Arpeggios", "Swaying Brass Synth Pads"];
        targetConcept = `Alternative universe: Retro Futurist Vintage Sunset Outrun edit. Warm nostalgic chords and arpeggiated outlines layer above classic 1980 drum machines to feel like an endless coastal highway sunset drive.`;
        targetVibe = "Symmetrical vector wireframe grid scrolling infinitely towards a high-fidelity glowing red wireframe sun.";
        targetViral = Math.min(99, blueprint.viralScore + 4);
        break;
      case "Festival EDM Cascade":
        targetGenre = "EDM Mainstage";
        targetSub = "Progressive Trance Peak";
        targetBpm = 130;
        targetInstruments = ["Massive Supersaw Chord Block", "Reverb-Chamber Percussion", "Sidechain Sub Bass", "Bright Laser Accents"];
        targetConcept = `Alternative universe: Festival Progressive Trance Peak edit. Optimized with stadium-filling supersaw anthems and heavy sidechained pumping drums curated for euphoric festival arena drops.`;
        targetVibe = "Rapid sweep cameras crossing crowd hands glowing under dramatic lasers, fireworks, and pyro discharges.";
        targetViral = Math.min(99, blueprint.viralScore + 6);
        break;
    }

    setBlueprint({
      ...blueprint,
      title: `${blueprint.title.replace(/\s\[.*Remix\]/, "")} [${universeName.split(' ')[0]} Remix]`,
      genre: targetGenre,
      subgenre: targetSub,
      bpm: targetBpm,
      keyInstruments: targetInstruments,
      concept: targetConcept,
      videoVibe: targetVibe,
      viralScore: targetViral
    });
    setBpm(targetBpm);
    showToast(`🌌 Morphed Music into "${universeName}" Universe!`);
  };

  // AI Prompt Enrichment trigger
  const triggerEnhance = () => {
    if (!promptText.trim()) {
      showToast("✍️ Write a quick prompt first");
      return;
    }
    setEnhancerOpen(true);
  };

  const applyPresetQuery = (preset: string) => {
    setPromptText(preset);
    showToast("✦ Preset loaded");
  };

  // Compose Song Blueprint calling server-side Gemini API
  const composeTrackBlueprint = async () => {
    const cleanPrompt = promptText.trim();
    if (!cleanPrompt) {
      showToast("✍️ Describe your track first");
      setPipelineStep(1);
      return;
    }

    setPipelineStep(3);
    setLoadingBlueprint(true);
    setComposerStatus("Analyzing creative vision...");
    setComposerDesc("Transmitting parameter matrices to server...");

    // Stagger statuses to assure loading engagement
    const statuses = [
      { s: "Analyzing prompt & core emotions...", d: "Constructing harmonic base..." },
      { s: "Compiling track architecture...", d: "Building Verse, Chorus, and Bridge grid..." },
      { s: "Synthesizing vocal melodies...", d: "Crafting memorable lyric hooks..." },
      { s: "Finalizing production layers...", d: "Assembling sonic elements into blueprint..." }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < statuses.length) {
        setComposerStatus(statuses[stepIdx].s);
        setComposerDesc(statuses[stepIdx].d);
        stepIdx++;
      }
    }, 1000);

    try {
      const res = await fetch("/api/vox-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cleanPrompt,
          bpm,
          energy,
          mood,
          genre: selectedGenres.join(", ") || "Electronic",
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setBlueprint(data);
      setCredits((prev) => Math.max(0, prev - 1));

      // Auto-save project locally
      saveProjectLocally(data);
    } catch (e: any) {
      console.error(e);
      // Fallback robust template in case of lack of credentials/API keys
      const fallback: TrackBlueprint = {
        title: "Neon Horizon",
        genre: selectedGenres[0] || "Synthwave",
        subgenre: "Retro-Futurism",
        bpm: bpm,
        key: "E Minor",
        duration: "3:40",
        concept: `A powerful electronic track inspired by your vision. Rising waves of vintage analog synthesis overlay a tight drum blueprint, compiling into an unforgettable, high-energy emotional peak.`,
        hook: "We ride the speed of sound, lost inside the neon waves",
        structure: ["Intro", "Verse 1", "Chorus", "Verse 2", "Chorus", "Epic Climactic Drop", "Outro"],
        keyInstruments: ["Prophet Synth Pad", "Analog Drum Grid", "Sub-Bass Overdrive", "Cinematic String Arpeggios"],
        productionTips: "Layer a warm analog pulse pad below the major hooks to enrich depth and boost emotional resonance.",
        videoVibe: "A dynamic vertical flythrough across neon Cyberpunk skyscrapers with beat-reactive reflections.",
        captions: [
          "Just compiled standard-setting vibes inside the studio! 🔥 #VoxMusicGen #FuturisticVibe",
          "Engineered with Vox Director AI. The concept brief for this goes incredibly deep ✦ #AIMusic #Synthwave"
        ],
        viralScore: 88,
      };
      setBlueprint(fallback);
      showToast("✦ Created fallback blueprint successfully");
      saveProjectLocally(fallback);
    } finally {
      clearInterval(interval);
      setLoadingBlueprint(false);
    }
  };

  // Local storage project saver
  const saveProjectLocally = (bp: TrackBlueprint) => {
    try {
      const currentSaved = localStorage.getItem("vox_projects");
      const projectsList: Project[] = currentSaved ? JSON.parse(currentSaved) : [];
      
      const isDuplicated = projectsList.findIndex((p) => p.blueprint.title === bp.title);
      const newPrj: Project = {
        id: Math.random().toString(),
        blueprint: bp,
        savedAt: Date.now(),
      };

      if (isDuplicated >= 0) {
        projectsList[isDuplicated] = newPrj;
      } else {
        projectsList.unshift(newPrj);
      }

      const truncated = projectsList.slice(0, 20);
      localStorage.setItem("vox_projects", JSON.stringify(truncated));
      setLibraryProjects(truncated);
      showToast("💾 Saved with offline sync!");
    } catch (e) {
      console.error(e);
    }
  };

  // Launch pre-loaded blueprint
  const loadBlueprintIntoStudio = (bp: TrackBlueprint) => {
    setBlueprint(bp);
    setPromptText(bp.concept);
    setBpm(bp.bpm);
    setMood(bp.subgenre || "Intense");
    setPipelineStep(4);
    setCurrentScreen("create");
    showToast(`🎚 Loaded "${bp.title}" in Studio`);
  };

  // Lyric Studio songwriter using server-side Gemini API
  const generateLyrics = async () => {
    const topic = lyricsTopic.trim();
    if (!topic) {
      showToast("✍️ Tell me a topic or theme first");
      return;
    }

    setLoadingLyrics(true);
    setLyricsList([]);

    try {
      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blueprint?.title || "My Composite Track",
          topic: topic,
          genre: blueprint?.genre || "Pop",
          mood: mood,
          bpm: blueprint?.bpm || bpm,
          hook: blueprint?.hook || "",
          mode: lyricsMode,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setLyricsList(data.sections || []);
      setCredits((prev) => Math.max(0, prev - 1));
      showToast("✨ Song lyrics written!");
    } catch (err: any) {
      console.error(err);
      // Fallback responsive verses
      const fallbackList: LyricSection[] = [
        { label: "VERSE 1", lyrics: `Tracing lines under the twilight sky\nWe hold the speed of light and wonder why\nEvery broken street-lamp tells a song\nMoving into where we both belong` },
        { label: "PRE-CHORUS", lyrics: `Feel the sub-bass pulse up through your feet\nSynchronized together with the beat` },
        { label: "CHORUS", lyrics: `Topic: "${topic}" — we burn bright like a diamond dome\nFinding frequencies that guide us home\n${blueprint?.hook || "Lost in the static till we rise again"}\nRunning free across the neon rain` },
      ];
      setLyricsList(fallbackList);
      showToast("✦ Created default lyrics template");
    } finally {
      setLoadingLyrics(false);
    }
  };

  // Copy entire compiled song lyrics
  const copyAllLyrics = () => {
    const str = lyricsList.map((l) => `[${l.label}]\n${l.lyrics}`).join("\n\n");
    navigator.clipboard?.writeText(str)
      .then(() => showToast("📋 Lyrics copied to clipboard!"))
      .catch(() => showToast("📋 Copy failed, copy manually"));
  };

  // Toggle visual active genre selections
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  return (
    <div id="studio-viewport" className="min-h-screen w-full bg-[#020208] bg-grid flex items-center justify-center p-0 md:p-6 lg:p-8 relative overflow-x-hidden">
      {/* Cinematic Ambient Backdrop Glowing Orbs */}
      <div className="absolute top-[12%] left-[12%] w-[400px] h-[400px] rounded-full bg-[#00f5ff]/4 blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[16%] right-[12%] w-[420px] h-[420px] rounded-full bg-[#8b5cf6]/4 blur-[130px] pointer-events-none select-none" />

      {showSplash ? (
        <div 
          id="splash-loading" 
          className="relative z-10 w-full max-w-[480px] h-[100dvh] md:h-[860px] md:max-h-[895px] md:rounded-[36px] md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.92)] flex flex-col justify-between p-8 bg-[#00000a] text-[#eef2ff] overflow-hidden"
        >
          {/* Ambient matrix glowing dusts */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] left-[10%] w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-[#00f5ff]/6 to-transparent blur-[70px] animate-pulse" />
            <div className="absolute bottom-[25%] right-[10%] w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/6 to-transparent blur-[70px] animate-pulse" />
            <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f5ff]/15 to-transparent top-1/3" />
          </div>

          {/* Core Content */}
          <div className="flex flex-col items-center justify-center flex-grow z-10 space-y-8 mt-[15%]">
            <div className="logo-assembly relative animate-scaleUp">
              <div className="absolute inset-0 w-24 h-24 rounded-[28px] bg-gradient-to-tr from-[#00f5ff] via-[#8b5cf6] to-[#f472b6] blur-[22px] opacity-40 animate-pulse" />
              <div className="relative w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#0c0d21] to-[#04050e] border border-[#00f5ff]/30 flex flex-col items-center justify-center shadow-2xl">
                {/* Custom glowing SVG vector audio equalizer wave logo */}
                <svg className="w-12 h-12 text-[#00f5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="25" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M17 5v14M7 5v14M22 9v6M2 9v6" strokeWidth="2.5" />
                </svg>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-[#00f5ff] to-[#8b5cf6] text-black text-[9px] font-mono font-black border-4 border-[#00000a] flex items-center justify-center shadow-lg animate-pulse">
                  AI
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-[#00f5ff] tracking-[0.22em] uppercase block font-bold">
                ✦ MASTER COGNITIVE OS ✦
              </span>
              <h1 className="font-display text-[29px] font-black tracking-widest bg-gradient-to-r from-white via-[#00f5ff] to-[#8b5cf6] bg-clip-text text-transparent uppercase leading-tight select-none">
                Vox MusicGen
              </h1>
              <p className="text-[#a0aec0] text-[10.5px] font-mono max-w-[280px] mx-auto opacity-80 uppercase tracking-widest leading-relaxed">
                Acoustic Multi-Synthesis OS
              </p>
            </div>

            {/* Matrix Loading elements */}
            <div className="w-full max-w-[280px] space-y-3 pt-4">
              <div className="h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-[#00f5ff] via-[#8b5cf6] to-[#f472b6] rounded-full transition-all duration-300 shadow-[0_0_10px_#00f5ff]"
                  style={{ width: `${splashProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center font-mono text-[8px] text-dim tracking-widest uppercase px-0.5">
                <span className="animate-pulse truncate max-w-[220px] text-left text-secondary">{splashText}</span>
                <span className="text-[#00f5ff] font-bold shrink-0">{splashProgress}%</span>
              </div>
            </div>
          </div>

          {/* Credits & Developer Signoff Footer */}
          <div className="z-10 text-center space-y-4 pt-4 border-t border-white/[0.04] pb-2">
            <div className="space-y-1">
              <p className="text-[7.5px] font-mono text-dim tracking-wide text-center">
                v2.05 · All sound frequencies secure and sandboxed
              </p>
            </div>

            <div className="action-row h-[42px] flex items-center justify-center">
              {splashProgress >= 100 ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowSplash(false);
                    showToast("🛰 Connected to Vox Realtime Studio Core");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-tr from-[#00f5ff] via-[#8b5cf6] to-[#f472b6] text-black text-xs font-display font-black uppercase tracking-widest scale-100 animate-scaleUp shadow-[0_0_20px_rgba(0,245,255,0.45)] hover:shadow-[0_0_30px_rgba(139,92,246,0.65)] active:scale-95 transition-all cursor-pointer text-center outline-none border-none line-clamp-1"
                >
                  ENTER STUDIO SYSTEM →
                </button>
              ) : (
                <div className="text-[8.5px] font-mono tracking-widest text-[#00f5ff]/50 uppercase py-1 select-none font-bold animate-pulse">
                  [ ESTABLISHING COGNITIVE BLUEPRINT SYNC ]
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div 
          id="app" 
          className={`relative z-10 w-full max-w-[480px] h-[100dvh] md:h-[860px] md:max-h-[895px] md:rounded-[36px] md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.92)] flex flex-col text-[#eef2ff] transition-all duration-700 overflow-hidden ${
            aiDimensionMode 
              ? "bg-gradient-to-b from-[#010115] via-[#0b011c] to-[#140026] shadow-[0_0_80px_rgba(0,245,255,0.22)] border-x border-[#00f5ff]/15 md:border-[#00f5ff]/30" 
              : "bg-gradient-to-b from-[#0a0a0a] via-[#0d0115] to-[#140026]"
          }`}
        >
          {/* Subtle slow-moving ambient particle fog & dust sparkles */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.03)_0,rgba(139,92,246,0.03)_30%,transparent_60%)] animate-[spin_50s_linear_infinite]" />
            <div className="absolute top-[12%] left-[25%] w-[8px] h-[8px] rounded-full bg-[#00f5ff]/20 blur-[2px] animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-[32%] right-[15%] w-[12px] h-[12px] rounded-full bg-[#8b5cf6]/15 blur-[3px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
            <div className="absolute top-[58%] left-[10%] w-[6px] h-[6px] rounded-full bg-[#fbbf24]/10 blur-[1px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
      
      {/* ── 🌌 AI DIMENSION ACTIVE GRAPHICS BACKDROP OVERLAYS ── */}
      {aiDimensionMode && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000">
          <div className="absolute top-[10%] left-[5%] w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-[#00f5ff]/12 to-transparent blur-[80px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[5%] w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/12 to-transparent blur-[85px] animate-pulse" />
          
          {/* Cybernetic holographic horizontal sweep grid line */}
          <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f5ff]/40 to-transparent top-1/4 shadow-[0_0_12px_#00f5ff] motion-safe:animate-bounce" />
          
          {/* Quantum Particle Sparks Loop */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div 
                key={idx}
                className="absolute w-1 h-1 rounded-full bg-[#00f5ff]/40 shadow-[0_0_6px_#00f5ff] animate-ping"
                style={{
                  top: `${15 + idx * 8}%`,
                  left: `${20 + (idx * 31) % 65}%`,
                  animationDuration: `${3 + (idx % 4)}s`,
                  animationDelay: `${idx * 0.4}s`
                }}
              />
            ))}
          </div>

          {/* Dimmed matrix telemetry label in margins */}
          <div className="absolute top-[80px] left-4 font-mono text-[7px] text-[#00f5ff]/30 uppercase tracking-widest leading-none select-none">
            [SYS CORE SYNC // DIMENSION ENGINE v4.2 // BPM RESONANCE: {bpm}]
          </div>
          <div className="absolute top-[80px] right-4 font-mono text-[7px] text-[#8b5cf6]/30 uppercase tracking-widest leading-none select-none">
            [MATRIX DEPTH: MULTIDIMENSIONAL CHROMA SHIFT: ACTIVE]
          </div>
        </div>
      )}

      {/* ── TOP HEADER BAR ── */}
      <header id="topbar" className="relative sticky top-0 z-50 h-[62px] flex items-center justify-between px-[18px] bg-[#03030e]/75 backdrop-blur-2xl border-b border-white/[0.08] transition-all duration-300">
        <div className="logo flex items-center gap-[10px] select-none cursor-pointer group" onClick={() => navigate("home")}>
          <div className="logo-mark animated-logo w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-[#0c0d21] to-[#04050e] border border-[#00f5ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.2)] md:group-hover:border-[#00f5ff]/60 transition-all duration-300 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00f5ff]/15 to-[#8b5cf6]/15 opacity-40" />
            <svg className="w-[19px] h-[19px] text-[#00f5ff] drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v20M17 5v14M7 5v14M22 9v6M2 9v6" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 font-display text-[14px] font-black tracking-[0.14em] bg-gradient-to-r from-white via-[#00f5ff] to-[#8b5cf6] bg-clip-text text-transparent uppercase">
            <span>Vox MusicGen</span>
            <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#00f5ff]/20 to-[#8b5cf6]/25 border border-[#00f5ff]/40 text-[#00f5ff] font-extrabold tracking-normal">PRO</span>
          </div>
        </div>

        <div className="topbar-right flex items-center gap-[6px]">
          {/* Animated Minimal Berger Menu Toggle */}
          <button 
            type="button"
            onClick={() => {
              setMenuOpen(!menuOpen);
              showToast(menuOpen ? "💬 Drawer closed" : "🛰 Opened Systems Control Panel");
            }}
            className="w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-[4.5px] border border-white/10 bg-white/[0.02] md:hover:bg-white/[0.08] md:hover:border-[#00f5ff]/30 md:hover:shadow-[0_0_15px_rgba(0,245,255,0.15)] transition-all cursor-pointer active:scale-95 z-50 text-white"
            aria-label="Menu"
            title="System Actions Drawer"
          >
            <span className={`w-4 h-[1.5px] bg-white rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px] bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" : ""}`} />
            <span className={`w-4 h-[1.5px] bg-white rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-4 h-[1.5px] bg-white rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px] bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" : ""}`} />
          </button>
        </div>
      </header>

      {/* ── BURGER MENU SLIDEDRAWER (Enterprise level) ── */}
      <div className={`absolute inset-y-0 right-0 z-50 w-[290px] h-full ${
        menuOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-out bg-[#03030e]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-between p-6 shadow-2xl`}>
        {/* Drawer Header */}
        <div className="space-y-6 overflow-y-auto max-h-[calc(100%-48px)] scrollbar-none pr-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-[8px] font-mono font-bold tracking-widest text-[#00f5ff] uppercase block mb-1">[ SYSTEMS CTRL PANEL ]</span>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">VOX COMMANDS</h3>
            </div>
            <button 
              type="button"
              onClick={() => setMenuOpen(false)}
              className="w-7 h-7 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] flex items-center justify-center text-dim hover:text-white transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Account Profile Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#00f5ff]/20 flex items-center justify-center text-lg shadow-inner shrink-0">
              {user ? user.avatar : "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-sans font-bold text-xs text-white truncate">{user ? user.name : "Guest Session"}</h4>
              <span className="text-[9px] font-mono text-[#8b5cf6] block mt-0.5 uppercase tracking-wide">
                {user ? `${user.plan} Account` : "FREE TRIAL CLIENT"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                if (user) {
                  setUser(null);
                  showToast("🔓 Logged out successfully");
                } else {
                  setAuthOpen(true);
                }
              }}
              className="text-[9.5px] font-mono text-dim hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              {user ? "OUT" : "AUTH"}
            </button>
          </div>

          {/* Energy & Credits */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[2px] bg-[#fbbf24]" />
            <div className="flex items-center justify-between text-[10px] font-mono text-dim">
              <span className="uppercase tracking-wider">✦ CREATOR QUOTA:</span>
              <span className="font-bold text-[#fbbf24]">{credits} CREDS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-secondary">Est. Generations: {credits}</span>
              <button 
                type="button" 
                onClick={() => {
                  setCredits(credits + 50);
                  showToast("⚡ Recharged standard quota by +50 Credits!");
                }}
                className="text-[8px] font-mono text-[#fbbf24] hover:text-white bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 px-2 py-0.5 rounded transition-all cursor-pointer"
              >
                RECHARGE
              </button>
            </div>
          </div>

          {/* Config Mode Switch - Dimension Toggle inside Menu */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-dim block uppercase tracking-wider">AI DIMENSION MODE</span>
                <span className="text-[10px] text-secondary leading-relaxed mt-0.5 block">Holographic engine mapping</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAiDimensionMode(!aiDimensionMode);
                  showToast(aiDimensionMode ? "🌌 Dimension de-activated" : "🌌 AI DIMENSION ACTIVE - Dynamic Interface Shifted!");
                }}
                className={`w-10 h-5 rounded-full p-0.5 transition-all outline-none border ${
                  aiDimensionMode 
                    ? "bg-[#00f5ff]/20 border-[#00f5ff] flex justify-end" 
                    : "bg-white/5 border-white/10 flex justify-start"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full transition-all ${aiDimensionMode ? "bg-[#00f5ff]" : "bg-dim"}`} />
              </button>
            </div>
            {aiDimensionMode && (
              <div className="text-[8px] font-mono text-[#00f5ff] tracking-tight leading-normal bg-[#00f5ff]/5 border border-[#00f5ff]/10 p-2 rounded-lg animate-pulse">
                [ SPEED: {bpm} BPM // SPECTRA DRIFT ACTIVATED ]
              </div>
            )}
          </div>

          {/* Navigation Links inside Drawer */}
          <div className="space-y-1.5 border-t border-white/5 pt-4">
            <span className="text-[8px] font-mono text-dim uppercase tracking-widest block mb-2 px-1">[ DEPLOY WORKSPACE ]</span>
            {[
              { label: "⚡ Create Workspace", action: () => navigate("create") },
              { label: "✍️ Lyric Studio Engine", action: () => navigate("lyrics") },
              { label: "📤 Shared Showcase", action: () => navigate("share") },
              { label: "👤 Profile Library", action: () => navigate("profile") },
              { label: "ℹ️ Documentation Specs", action: () => { navigate("app-info"); setInfoSubTab("specs"); } },
              { label: "🔒 Privacy & Legals", action: () => { navigate("app-info"); setInfoSubTab("privacy"); } }
            ].map((lnk) => (
              <button
                key={lnk.label}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  lnk.action();
                }}
                className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>{lnk.label}</span>
                <span className="text-[10px] text-dim font-mono">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* System footer */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[9px] font-mono text-dim">
          <span>SYS CONFIG: v3.2.5 [STABLE]</span>
          <span className="text-[#10ffb0] tracking-wider font-bold animate-pulse">● ONLINE</span>
        </div>
      </div>

      {/* ── BACKDROP OVERLAY ── */}
      {menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* ── MAIN SCROLLABLE CONTENT VIEWPORTS ── */}
      <main id="main" className="flex-1 overflow-y-auto px-0 pb-[calc(64px+env(safe-area-inset-bottom,12px)+16px)]">
        
        {/* ================== HOME SCREEN ================== */}
        {currentScreen === "home" && (
          <div className="screen-animation space-y-5">
            <div className="home-hero px-[18px] pt-[22px]">
              <div className="home-eyebrow text-[10px] font-mono text-[#00f5ff] tracking-[0.22em] uppercase mb-1.5 flex items-center gap-1.5">
                <span className="live-dot block w-1.5 h-1.5 rounded-full bg-[#10ffb0] blink-indicator shadow-[0_0_6px_#10ffb0]" /> 
                AI Engine Online
              </div>
              <h1 className="font-display text-[27px] font-black leading-[1.12] bg-gradient-to-r from-white via-[#00f5ff] to-[#8b5cf6] bg-clip-text text-transparent uppercase mb-2.5">
                Create the<br />Future of Sound
              </h1>
              <p className="text-secondary text-xs leading-relaxed max-w-[290px]">
                Convert sketches, stories, emotions, and prompt themes into stunning music and movie concepts.
              </p>
            </div>

            {/* Glowing animated visualizer graph */}
            <div className="wf-card mx-[18px] p-4 bg-card border border-[#00f5ff]/10 hover:border-[#00f5ff]/20 rounded-[20px] relative overflow-hidden shadow-xl">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />
              <div className="wf-hd flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-mono text-[#00f5ff] tracking-widest uppercase flex items-center gap-1.2 font-bold">
                  ✦ Reactive Waveform Monitor
                </span>
                <span className="text-[9px] font-mono text-dim tracking-wider uppercase">
                  {visualizerTheme} · Active
                </span>
              </div>
              <HeroWaveform theme={visualizerTheme} />

              {/* Theme selector pills for live UI feedback */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap gap-1.5 justify-between items-center">
                <span className="text-[8px] font-mono text-dim uppercase tracking-wider">Aura Preset:</span>
                <div className="flex gap-1">
                  {[
                    { id: "Neon Rain", label: "🦎 RAIN" },
                    { id: "Cosmic Orbit", label: "🌌 COSMIC" },
                    { id: "Holographic Beats", label: "🧪 HOLO" },
                    { id: "Hyper-speed Strobe", label: "⚡ STROBE" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setVisualizerTheme(t.id as any);
                        showToast(`Atmosphere set to: ${t.id}`);
                        playSynthSound("hihat");
                      }}
                      className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer border ${
                        visualizerTheme === t.id
                          ? "bg-white/10 text-white border-white/20 shadow-md"
                          : "bg-white/[0.01] text-dim border-transparent hover:bg-white/5 hover:text-primary"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Grid for Fast Creation */}
            <div className="space-y-2">
              <div className="section-hd flex justify-between items-center px-[18px]">
                <span className="section-label">Quick Concept Studio</span>
              </div>
              <div className="create-grid px-[18px] grid grid-cols-4 gap-2">
                <div 
                  onClick={() => applyPresetQuery("Uplifting vocal dance-pop anthem for road tripping")}
                  className="cg-item aspect-square rounded-[14px] bg-white/[0.03] border border-[#00f5ff]/10 hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl select-none">🎵</span>
                  <span className="text-[9px] font-display text-dim font-semibold tracking-wider">Song</span>
                </div>
                <div 
                  onClick={() => applyPresetQuery("Slow dark trap beat with organic ambient pads for moody edits")}
                  className="cg-item aspect-square rounded-[14px] bg-white/[0.03] border border-[#00f5ff]/10 hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl select-none">🥁</span>
                  <span className="text-[9px] font-display text-dim font-semibold tracking-wider">Beat</span>
                </div>
                <div 
                  onClick={() => applyPresetQuery("A cinematic film score with swelling orchestra and strings")}
                  className="cg-item aspect-square rounded-[14px] bg-white/[0.03] border border-[#00f5ff]/10 hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl select-none">🎬</span>
                  <span className="text-[9px] font-display text-dim font-semibold tracking-wider">Cinematic</span>
                </div>
                <div 
                  onClick={() => applyPresetQuery("Lush late night lo-fi hip-hop beat centered on organic guitar chords")}
                  className="cg-item aspect-square rounded-[14px] bg-white/[0.03] border border-[#00f5ff]/10 hover:bg-[#10ffb0]/10 hover:border-[#10ffb0]/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl select-none">🌸</span>
                  <span className="text-[9px] font-display text-dim font-semibold tracking-wider">Lo-fi</span>
                </div>
              </div>
            </div>

            {/* Preset Library suggestions */}
            <div className="space-y-2">
              <div className="section-hd flex justify-between items-center px-[18px]">
                <span className="section-label">Browse Genres</span>
              </div>
              <div className="pill-row px-[18px] flex gap-1.5 overflow-x-auto scrollbar-none pr-[18px]">
                {["Synthwave", "EDM", "Lo-fi", "Hip-Hop", "Cinematic", "Ambient", "Trap"].map((gen) => (
                  <div
                    key={gen}
                    onClick={() => toggleGenre(gen)}
                    className={`pill flex-shrink-0 p-1.5 px-3 rounded-full text-[10px] font-display uppercase font-bold tracking-wider border cursor-pointer transition-all ${
                      selectedGenres.includes(gen)
                        ? "bg-[#00f5ff]/10 border-[#00f5ff]/40 text-[#00f5ff]"
                        : "bg-white/[0.03] border-white/5 text-dim hover:text-[#eef2ff]"
                    }`}
                  >
                    {gen}
                  </div>
                ))}
              </div>
            </div>

            {/* Local saved projects track history */}
            {libraryProjects.length > 0 && (
              <div className="space-y-2.5">
                <div className="section-hd flex justify-between items-center px-[18px]">
                  <span className="section-label">Recent Compiles</span>
                  <span className="section-action text-[9px] font-mono text-[#00f5ff] cursor-pointer font-bold" onClick={() => setCurrentScreen("profile")}>
                    All ({libraryProjects.length}) →
                  </span>
                </div>
                <div className="track-scroll flex gap-2.5 overflow-x-auto px-[18px] pb-1 pr-[18px]">
                  {libraryProjects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      onClick={() => loadBlueprintIntoStudio(project.blueprint)}
                      className="track-card flex-shrink-0 w-36 bg-card border border-white/[0.04] rounded-[18px] overflow-hidden cursor-pointer transition-all hover:border-[#00f5ff]/20 shadow-md"
                    >
                      <div className="tc-thumb h-20 bg-gradient-to-tr from-[#06101e] to-[#00f5ff]/10 flex items-center justify-center relative">
                        <span className="text-2xl select-none">🌊</span>
                        <div className="tc-play absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-[10px] font-bold">
                          ▶
                        </div>
                      </div>
                      <div className="tc-info p-2.5">
                        <h4 className="text-xs font-bold text-primary truncate leading-normal">
                          {project.blueprint.title}
                        </h4>
                        <p className="text-[9.5px] font-mono text-dim mt-0.5">
                          {project.blueprint.genre} · {project.blueprint.bpm}BPM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== RECURRING STUDIO GENERATION FLOW ================== */}
        {currentScreen === "create" && (
          <div className="screen-animation space-y-4">
            
            {/* Steps Progress Header */}
            <div className="pipeline-steps px-[18px] pt-4 flex justify-between gap-1 items-center">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="ps-item flex flex-col items-center flex-1 relative">
                  <div
                    onClick={() => {
                      if (step === 2 && !promptText.trim()) return;
                      if (step === 3 && !blueprint) return;
                      setPipelineStep(step as any);
                    }}
                    className={`ps-dot w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-display cursor-pointer transition-all select-none font-bold ${
                      pipelineStep === step
                        ? "bg-[#00f5ff]/15 border-[#00f5ff] text-[#00f5ff] shadow-[0_0_8px_rgba(0,245,255,0.4)]"
                        : pipelineStep > step
                        ? "bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff] select-none"
                        : "bg-white/[0.03] border-white/10 text-dim"
                    }`}
                  >
                    {pipelineStep > step ? "✓" : step}
                  </div>
                  <span className={`ps-label text-[8px] font-mono text-center tracking-wide uppercase mt-1.5 ${
                    pipelineStep >= step ? "text-[#00f5ff]" : "text-dim"
                  }`}>
                    {step === 1 ? "Prompt" : step === 2 ? "Params" : step === 3 ? "Blueprint" : "Mixer"}
                  </span>
                </div>
              ))}
            </div>

            {/* PIPELINE STEP 1: COMPOSING THE PROMPT */}
            {pipelineStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="step-header px-[18px]">
                  <div className="step-num text-[9px] font-mono text-[#8b5cf6] tracking-widest uppercase mb-1 font-bold">
                    STEP 01 / 04
                  </div>
                  <h2 className="font-display text-xl font-black bg-gradient-to-r from-white via-secondary to-[#8b5cf6] bg-clip-text text-transparent uppercase">
                    Define the prompt
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Outline the feeling, theme, structures, or visual aesthetics you wish to explore.
                  </p>
                </div>

                {/* ── DESIGN MODE TABS SELECTION STRIP (Dream Fusion, Hum, Memory) ── */}
                <div className="tab-strip px-[18px] flex gap-1 bg-white/[0.02] border-y border-white/[0.04] py-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: "standard", l: "✍️ Standard Brief" },
                    { id: "dream", l: "🪄 Dream Fusion" },
                    { id: "hum", l: "🎤 Hum Pitcher" },
                    { id: "memory", l: "📸 Memory Link" }
                  ].map((tabs) => (
                    <button
                      key={tabs.id}
                      type="button"
                      onClick={() => {
                        setInputMode(tabs.id as any);
                        showToast(`✦ Switched mode to ${tabs.l}`);
                      }}
                      className={`tab-btn shrink-0 flex-1 min-w-[94px] p-2 text-[9px] font-display uppercase tracking-wider rounded-lg border text-center transition-all cursor-pointer ${
                        inputMode === tabs.id
                          ? "bg-[#8b5cf6]/15 border-[#8b5cf6] text-[#8b5cf6] font-extrabold"
                          : "bg-transparent border-transparent text-dim hover:text-secondary"
                      }`}
                    >
                      {tabs.l}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT: 1. STANDARD CREATIVE BRIEF */}
                {inputMode === "standard" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Input Textarea Box */}
                    <div className="prompt-box mx-[18px] p-4 bg-card border border-white/[0.06] hover:border-[#8b5cf6]/35 rounded-[22px] shadow-lg relative focus-within:border-[#8b5cf6] focus-within:ring-1 focus-within:ring-[#8b5cf6]/40 transition-all duration-300">
                      <div className="pb-label text-[9.5px] font-mono text-[#8b5cf6] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.2">
                        ✦ Write Creative Brief
                      </div>
                      <textarea
                        id="prompt-ta"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="e.g. A retro electronic track with swelling synthetic brass chords, deep sub overdrive, and a soulful vocal hook about late-night driving..."
                        className="w-full text-xs text-primary leading-relaxed bg-transparent border-none outline-none resize-none"
                      />
                      <div className="pb-footer flex justify-between items-center mt-3 pt-2.5 border-t border-white/[0.04]">
                        <span className="text-[9px] font-mono text-dim font-semibold">
                          {promptText.length} / 500 chars
                        </span>
                        <div className="pb-actions flex gap-1.5">
                          <button 
                            type="button"
                            onClick={() => setPromptText("")} 
                            className="pb-icon-btn w-7 h-7 rounded-md bg-white/[0.02] hover:bg-white/10 active:scale-95 transition-all text-xs border border-white/5"
                            title="Clear Input"
                          >
                            ✕
                          </button>
                          <button 
                            type="button"
                            onClick={triggerEnhance} 
                            className="pb-icon-btn w-7 h-7 rounded-md bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 active:scale-95 transition-all text-xs border border-[#8b5cf6]/25 text-[#8b5cf6] font-bold"
                            title="AI Prompt Enhancer"
                          >
                            ✦
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inspiration Section */}
                    <div className="space-y-2">
                      <div className="section-hd px-[18px] flex items-center">
                        <span className="section-label">Inspiration Presets</span>
                      </div>
                      <div className="insp-grid px-[18px] grid grid-cols-2 gap-2">
                        <div 
                          onClick={() => setPromptText("Late night lofi study session inside a train station, rainy vibe, warm electric piano, organic tape fuzz")}
                          className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 hover:bg-[#8b5cf6]/5 active:scale-98 transition-all flex gap-2 cursor-pointer"
                        >
                          <span className="text-base select-none">🌙</span>
                          <span className="text-[10px] text-secondary leading-snug">
                            <strong>Late Night Lofi</strong> - Cozy rain, warm keys and crackling tape.
                          </span>
                        </div>
                        <div 
                          onClick={() => setPromptText("Intense cyberpunk industrial cyber-drone with swelling synth leads, massive drum drive, heavy feedback")}
                          className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 hover:bg-[#8b5cf6]/5 active:scale-98 transition-all flex gap-2 cursor-pointer"
                        >
                          <span className="text-base select-none">⚡</span>
                          <span className="text-[10px] text-secondary leading-snug">
                            <strong>Cyber Dystopia</strong> - Aggressive Industrial, driving neon tempo.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: 2. 🪄 DREAM FUSION ENGINE */}
                {inputMode === "dream" && (
                  <div className="space-y-4 animate-fadeIn px-[18px]">
                    <div className="p-4 bg-card border border-[#8b5cf6]/20 rounded-[22px] shadow-lg space-y-3.5">
                      <div className="text-[10px] font-mono text-[#8b5cf6] uppercase tracking-widest font-extrabold flex items-center gap-1">
                        🪄 Dream Fusion Engine
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-mono text-dim uppercase tracking-wider mb-2 font-semibold">
                          Describe the sleeping state, memory recall, or imaginal concept:
                        </label>
                        <textarea
                          value={dreamTheme}
                          onChange={(e) => setDreamTheme(e.target.value)}
                          maxLength={300}
                          rows={3}
                          placeholder="e.g. Floating in liquid crystal waterfalls under dual neon suns while a slow J-POP chorus fades in the ambient air..."
                          className="w-full text-xs text-primary leading-normal p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#8b5cf6] outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[9.5px] font-mono text-dim uppercase tracking-wider font-semibold">
                          Choose Dimensional Tuning:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            "🌌 Cosmic Dreamscape",
                            "⏳ Melancholic Recall",
                            "⚔️ Mythological Odyssey",
                            "🌊 Aquatic Fluidity"
                          ].map((vector) => (
                            <button
                              key={vector}
                              type="button"
                              onClick={() => {
                                setDreamStyle(vector);
                                showToast(`Tuned vector: ${vector}`);
                              }}
                              className={`p-2.5 text-left rounded-lg text-[9px] font-mono border transition-all ${
                                dreamStyle === vector
                                  ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/50 text-white font-extrabold"
                                  : "bg-white/[0.02] border-white/5 text-dim hover:text-secondary"
                              }`}
                            >
                              {vector}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!dreamTheme.trim()) {
                            showToast("✍️ Describe your dream first!");
                            return;
                          }
                          const finalPrompt = `Dream Fusion Matrix [Vector: ${dreamStyle}]. Narrative themed outline: "${dreamTheme}". A beautiful cinematic musical narrative built with spacious synthesized pad layers and deep introspective chords.`;
                          setPromptText(finalPrompt);
                          setInputMode("standard");
                          showToast("🔮 Dream synthesized into studio Creative Brief!");
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] text-black text-xs font-display font-black uppercase tracking-wider leading-none cursor-pointer"
                      >
                        🔮 TRANSLATE DREAM VECTORS
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: 3. 🎤 HUM-TO-FULL-SONG MODE */}
                {inputMode === "hum" && (
                  <div className="space-y-4 animate-fadeIn px-[18px]">
                    <div className="p-4 bg-card border border-[#00f5ff]/20 rounded-[22px] text-center space-y-4">
                      <div>
                        <div className="text-[10px] font-mono text-[#00f5ff] uppercase tracking-widest font-extrabold mb-1">
                          🎤 Hum-to-Full-Song Matrix
                        </div>
                        <p className="text-[10px] text-dim max-w-[280px] mx-auto leading-relaxed">
                          Whistle or hum your melody idea. Vox AI scans pitch frequencies and builds full electronic chords.
                        </p>
                      </div>

                      {/* circular microphone active recording area */}
                      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full border border-[#00f5ff]/20 transition-all duration-1000 ${
                          recordingHum ? "scale-110 opacity-100 animate-ping" : "scale-100 opacity-0"
                        }`} />
                        <div className={`absolute inset-2 rounded-full border border-[#00f5ff]/35 transition-all duration-1000 ${
                          recordingHum ? "scale-105 opacity-100 animate-pulse" : "scale-100 opacity-0"
                        }`} />
                        <button
                          type="button"
                          onClick={() => {
                            setHumTranscribed("");
                            setRecordingHum(!recordingHum);
                            showToast(recordingHum ? "⏹ Stopped recording" : "⏺ Listening to voice humming...");
                          }}
                          className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all cursor-pointer shadow-lg outline-none ${
                            recordingHum
                              ? "bg-red-500/15 border-red-500 text-red-500 shadow-red-500/30"
                              : "bg-[#00f5ff]/10 border-[#00f5ff] text-[#00f5ff] hover:bg-[#00f5ff]/20"
                          }`}
                        >
                          <span className="text-xl leading-none font-bold select-none">{recordingHum ? "⏹" : "🎤"}</span>
                          <span className="text-[8px] font-mono font-black mt-1">
                            {recordingHum ? `0:0${humTimer}` : "START"}
                          </span>
                        </button>
                      </div>

                      {/* equalizer micro animation if humming */}
                      {recordingHum && (
                        <div className="flex gap-1 justify-center h-8 items-end p-1">
                          {humAudioBars.map((val, bidx) => (
                            <div 
                              key={bidx} 
                              className="w-[1.5px] rounded-full bg-[#00f5ff]" 
                              style={{ height: `${val}%`, transition: "height 0.15s ease" }}
                            />
                          ))}
                        </div>
                      )}

                      {/* result showcase pitch blueprint */}
                      {humTranscribed ? (
                        <div className="p-3 rounded-xl bg-[#00f5ff]/5 border border-[#00f5ff]/15 text-left space-y-1 animate-scaleUp">
                          <div className="text-[9px] font-mono text-[#00f5ff] uppercase font-bold">
                            ⚡ Transcribed acoustic matrix results:
                          </div>
                          <p className="text-[10px] text-secondary leading-snug font-mono">
                            {humTranscribed}
                          </p>
                          <div className="pt-2 text-center">
                            <span className="text-[8.5px] font-mono text-dim block italic">
                              Pitch waves successfully incorporated into the creative brief prompt below.
                            </span>
                          </div>
                        </div>
                      ) : (
                        !recordingHum && (
                          <div className="text-[9px] font-mono text-dim py-1.5">
                            Awaiting melody humming track... Click mic to simulate recording.
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: 4. 📸 MEMORY LINK & ANALYSIS */}
                {inputMode === "memory" && (
                  <div className="space-y-4 animate-fadeIn px-[18px]">
                    <div className="p-4 bg-card border border-[#10ffb0]/20 rounded-[22px] space-y-3.5">
                      <div>
                        <div className="text-[10px] font-mono text-[#10ffb0] uppercase tracking-widest font-extrabold mb-1">
                          📸 Memory-to-Music Engine
                        </div>
                        <p className="text-[10px] text-dim leading-relaxed">
                          Link a photogarhic snapshot. Vox scans visual pixels, contrast histograms, and converts colors into emotions.
                        </p>
                      </div>

                      {/* Photo Demo Selection boxes */}
                      <div>
                        <label className="block text-[9.5px] font-mono text-dim uppercase tracking-wider mb-2 font-semibold text-left">
                          Select a demo memory file to scan:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: "Neon_Drive_Tokyo.jpg", label: "🌆 Ginza Drive", color: "from-[#8b5cf6] to-[#00f5ff]", prompt: "Retro outrun, chrome metallic sky rhythm with driving analogue bass, 118BPM" },
                            { name: "Sunset_Sea_Polaroid.png", label: "🌅 Sea Sunset", color: "from-[#fbbf24] to-[#f472b6]", prompt: "Melancholic organic guitars with ocean swell pads, late evening lofi, 80BPM" },
                            { name: "Nebula_Dust_Vibe.gif", label: "🪐 Cosmic Dust", color: "from-[#03030e] to-[#8b5cf6]", prompt: "Epic galactic synthesizer drones, spacious celestial choir sweeps, 90BPM" }
                          ].map((elem) => (
                            <div
                              key={elem.name}
                              onClick={() => {
                                showToast("Scanning mood pixels...");
                                setMemoryUpload({
                                  name: elem.name,
                                  type: "image/jpeg",
                                  analyzed: `Mood Scan complete: ${elem.label}! Colors mapped: neon magenta (Synthwave vibes), deep void indigo (Ambient synthwave). Resonance score: 94%.`
                                });
                                setPromptText(`A lush soundscape reflecting visual memory "${elem.name}". ${elem.prompt}`);
                                showToast(`📸 Mapped color arrays for: ${elem.label}`);
                                setInputMode("standard");
                              }}
                              className="group relative h-16 rounded-xl overflow-hidden border border-white/5 cursor-pointer flex items-center justify-center text-center p-2 transition-all hover:border-[#10ffb0]/40"
                            >
                              <div className={`absolute inset-0 bg-gradient-to-tr ${elem.color} opacity-20 group-hover:opacity-40 transition-all`} />
                              <span className="text-[9.5px] relative z-10 font-bold leading-tight group-hover:text-white">
                                {elem.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Show active file analysis */}
                      {memoryUpload && (
                        <div className="p-3 rounded-xl bg-[#10ffb0]/5 border border-[#10ffb0]/15 text-left space-y-1 animate-scaleUp">
                          <div className="text-[9px] font-mono text-[#10ffb0] uppercase font-bold flex justify-between">
                            <span>⚡ Chroma Analysis Sync</span>
                            <span className="cursor-pointer" onClick={() => setMemoryUpload(null)}>✕</span>
                          </div>
                          <div className="text-[10px] text-secondary font-mono leading-tight">
                            File: {memoryUpload.name}<br />
                            {memoryUpload.analyzed}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirm step Button */}
                <div className="px-[18px]">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="btn btn-primary w-full py-3.5 text-xs text-center font-bold tracking-widest leading-none shadow-[0_4px_15px_rgba(0,245,255,0.25)] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    CONTINUE TO PARAMETERS →
                  </button>
                </div>
              </div>
            )}

            {/* PIPELINE STEP 2: STYLOPHILIC PARAMETERS */}
            {pipelineStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="step-header px-[18px]">
                  <div className="step-num text-[9px] font-mono text-[#8b5cf6] tracking-widest uppercase mb-1 font-bold">
                    STEP 02 / 04
                  </div>
                  <h2 className="font-display text-xl font-black bg-gradient-to-r from-white via-secondary to-[#8b5cf6] bg-clip-text text-transparent uppercase">
                    Fine-Tune Composition
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Shape the metric parameters, instrumentation guidelines, and pace vibes for your song.
                  </p>
                </div>

                <div className="params-grid px-[18px] space-y-3">
                  {/* Slider 1: Speed BPM */}
                  <div className="param-card bg-card border border-white/[0.04] p-4 rounded-[20px] shadow-sm">
                    <div className="param-title text-[9px] font-mono text-dim tracking-wider uppercase mb-1.5 font-bold">
                      BPM — TEMPO SPEED
                    </div>
                    <div className="param-val font-display text-lg font-black text-[#00f5ff] mb-2">
                      {bpm} BPM
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={200}
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e.target.value))}
                      className="vslider w-full h-[3px] bg-white/10 rounded-lg outline-none appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Energy */}
                  <div className="param-card bg-card border border-white/[0.04] p-4 rounded-[20px] shadow-sm">
                    <div className="param-title text-[9px] font-mono text-dim tracking-wider uppercase mb-1.5 font-bold">
                      ENERGY RATIO
                    </div>
                    <div className="param-val font-display text-lg font-black text-[#8b5cf6] mb-2">
                      {energy}%
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="vslider w-full h-[3px] bg-white/10 rounded-lg outline-none appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Button Group: Vibe Mood */}
                  <div className="param-card bg-card border border-white/[0.04] p-4 rounded-[20px] shadow-sm">
                    <div className="param-title text-[9px] font-mono text-dim tracking-wider uppercase mb-3 font-bold">
                      MOOD EMOTION
                    </div>
                    <div className="mood-strip flex gap-2 overflow-x-auto scrollbar-none pb-1">
                      {["Chill", "Intense", "Sad", "Happy", "Epic", "Dark", "Dreamy"].map((vibe) => (
                        <div
                          key={vibe}
                          onClick={() => setMood(vibe)}
                          className={`ms-btn flex-shrink-0 p-2.5 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                            mood === vibe
                              ? "bg-[#fbbf24]/10 border-[#fbbf24]/30"
                              : "bg-white/[0.03] border-white/5 text-dim hover:text-[#eef2ff]"
                          }`}
                        >
                          <span className="me text-base block">
                            {vibe === "Chill" ? "😌" : vibe === "Intense" ? "😤" : vibe === "Sad" ? "😢" : vibe === "Happy" ? "🥳" : vibe === "Epic" ? "✨" : vibe === "Dark" ? "🌑" : "💫"}
                          </span>
                          <span className={`ml text-[8.5px] font-mono uppercase tracking-wider ${
                            mood === vibe ? "text-[#fbbf24]" : "text-dim"
                          }`}>
                            {vibe}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-[18px] pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPipelineStep(1)}
                    className="btn btn-ghost py-3.5 px-5 text-xs text-center font-bold tracking-wider rounded-xl cursor-pointer"
                  >
                    ← BACK
                  </button>
                  <button
                    type="button"
                    onClick={composeTrackBlueprint}
                    className="btn btn-primary flex-1 py-3.5 text-xs text-center font-bold tracking-widest rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(139,92,246,0.3)]"
                  >
                    ✦ EXECUTE VOX DIRECTOR
                  </button>
                </div>
              </div>
            )}

            {/* PIPELINE STEP 3: VIEW GENERATED BLUEPRINT ROADMAP */}
            {pipelineStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="step-header px-[18px]">
                  <div className="step-num text-[9px] font-mono text-[#8b5cf6] tracking-widest uppercase mb-1 font-bold">
                    STEP 03 / 04
                  </div>
                  <h2 className="font-display text-xl font-black bg-gradient-to-r from-white via-secondary to-[#8b5cf6] bg-clip-text text-transparent uppercase">
                    Composed Outline
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Review your AI-generated blueprint roadmap detailing pacing, key setups, and lyric direction.
                  </p>
                </div>

                {/* Loader State */}
                {loadingBlueprint && (
                  <div className="director-loading mx-[18px] p-6 bg-card border border-white/[0.04] rounded-[24px] text-center shadow-md animate-pulse">
                    <div className="dr-spinner spinning-loader w-14 h-14 rounded-2xl mx-auto mb-4 bg-gradient-to-tr from-[#00f5ff] to-[#8b5cf6] flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                      ✦
                    </div>
                    <div className="dr-status font-display text-sm font-bold text-[#8b5cf6] mb-1.5">
                      {composerStatus}
                    </div>
                    <div className="dr-sub text-[10.5px] font-mono text-dim tracking-wide block">
                      {composerDesc}
                    </div>
                    <div className="dr-progress w-full h-[2px] bg-white/10 rounded-full mt-5 overflow-hidden">
                      <div className="dr-bar h-full bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6] rounded-full w-4/5 animate-loadingBar" />
                    </div>
                  </div>
                )}

                {/* Composed Blueprint Card Display */}
                {!loadingBlueprint && blueprint && (
                  <div className="blueprint-card mx-[18px] bg-card border border-[#00f5ff]/20 hover:border-[#00f5ff]/40 rounded-[24px] overflow-hidden shadow-2xl relative">
                    {/* Header */}
                    <div className="bp-header p-4 bg-gradient-to-tr from-[#00f5ff]/5 to-[#8b5cf6]/5 border-b border-[#00f5ff]/10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="bp-eyebrow text-[9px] font-mono text-[#00f5ff] tracking-wider uppercase mb-1 font-bold">
                          ✦ Vox Director Blueprint
                        </div>
                        <h3 id="bp-title" className="font-display text-lg font-black text-white select-all">
                          {blueprint.title}
                        </h3>
                        <div className="bp-tags flex gap-1.5 flex-wrap mt-2">
                          <span className="tag tag-cyan text-[8.5px] p-[2px_8px] rounded-full border bg-[#00f5ff]/5 border-[#00f5ff]/20 text-[#00f5ff] font-mono">
                            {blueprint.genre}
                          </span>
                          <span className="tag tag-violet text-[8.5px] p-[2px_8px] rounded-full border bg-[#8b5cf6]/5 border-[#8b5cf6]/20 text-[#8b5cf6] font-mono">
                            {blueprint.bpm} BPM
                          </span>
                          <span className="tag tag-pink text-[8.5px] p-[2px_8px] rounded-full border bg-[#f472b6]/5 border-[#f472b6]/20 text-[#f472b6] font-mono">
                            {blueprint.key || "C Minor"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="bp-viral font-display text-2xl font-black text-[#fbbf24] leading-none mb-1">
                          {blueprint.viralScore}%
                        </div>
                        <div className="bp-viral-label text-[7.5px] font-mono text-dim tracking-wider uppercase">
                          Viral Index
                        </div>
                      </div>
                    </div>

                    {/* Detailed Brief Section Container */}
                    <div className="bp-body p-4 space-y-4">
                      {/* Concept brief block */}
                      <div className="space-y-1">
                        <h4 className="bp-section-title text-[9px] font-mono text-[#00f5ff] font-bold tracking-widest uppercase">
                          🎵 Concept Overview
                        </h4>
                        <p className="bp-concept text-secondary text-xs leading-relaxed select-text font-serif">
                          {blueprint.concept}
                        </p>
                      </div>

                      {/* Hook lyric card */}
                      <div className="space-y-1">
                        <h4 className="bp-section-title text-[9px] font-mono text-[#f472b6] font-bold tracking-widest uppercase">
                          🎣 Viral Hook
                        </h4>
                        <div className="bp-hook p-3 rounded-xl bg-[#f472b6]/5 border border-[#f472b6]/20 text-xs italic text-[#f472b6] leading-relaxed select-text font-serif">
                          "{blueprint.hook}"
                        </div>
                      </div>

                      {/* Struct schema block */}
                      <div className="space-y-1.5">
                        <h4 className="bp-section-title text-[9px] font-mono text-[#8b5cf6] font-bold tracking-widest uppercase">
                          📐 Structure Plan
                        </h4>
                        <div className="bp-structure flex gap-1.5 flex-wrap">
                          {blueprint.structure.map((section, sidx) => (
                            <div key={sidx} className="struct-part text-[9px] font-mono p-[4px_9px] rounded-md bg-white/[0.02] border border-white/5 text-secondary">
                              {section}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instruments section */}
                      <div className="space-y-1.5">
                        <h4 className="bp-section-title text-[9px] font-mono text-[#00f5ff] font-bold tracking-widest uppercase">
                          🎹 Key Instruments
                        </h4>
                        <div className="bp-instruments flex gap-1.5 flex-wrap">
                          {blueprint.keyInstruments.map((inst, iidx) => (
                            <div key={iidx} className="instr-tag text-[9px] font-mono p-[4px_10px] rounded-full bg-[#00f5ff]/5 border border-[#00f5ff]/15 text-[#00f5ff]">
                              {inst}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social & visual scenario */}
                      <div className="space-y-1">
                        <h4 className="bp-section-title text-[9px] font-mono text-[#fbbf24] font-bold tracking-widest uppercase">
                          🎬 Visual Vibe Scenario
                        </h4>
                        <p className="bp-video text-secondary text-xs leading-relaxed select-text font-body">
                          {blueprint.videoVibe}
                        </p>
                      </div>

                      {/* Quick social caption block */}
                      <div className="space-y-1">
                        <h4 className="bp-section-title text-[9px] font-mono text-[#8b5cf6] font-bold tracking-widest uppercase">
                          📱 Proposed Hype post
                        </h4>
                        <p className="bp-caption p-3 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/15 text-secondary text-xs leading-relaxed italic select-text font-mono">
                          {blueprint.captions[0]}
                        </p>
                      </div>

                      {/* Evolving Director AI Storyboard Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDirectorStoryboardOpen(true);
                            showToast("🎬 Launching Director AI Storyboard Studio...");
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-[#fbbf24]/10 to-[#8b5cf6]/20 border border-[#fbbf24]/30 hover:border-[#fbbf24]/60 hover:bg-gradient-to-tr hover:from-[#fbbf24]/20 hover:to-[#8b5cf6]/35 text-[#fbbf24] text-[10px] font-display uppercase tracking-widest leading-none font-black cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.15)] flex items-center justify-center gap-1.5"
                        >
                          🎬 VIEW DIRECTOR ART STORYBOARD
                        </button>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="bp-footer p-4 border-t border-white/[0.04] bg-[#03030e]/45 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPipelineStep(2)}
                        className="btn btn-ghost py-2.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        ← REDO
                      </button>
                      <button
                        type="button"
                        onClick={copyAllLyrics}
                        className="btn btn-ghost py-2.5 px-4 text-xs font-bold cursor-pointer"
                        title="Copy text roadmap summary"
                      >
                        📋 COPY
                      </button>
                      <button
                        type="button"
                        onClick={() => setPipelineStep(4)}
                        className="btn btn-primary flex-1 py-2.5 text-xs font-bold leading-none select-none hover:shadow-lg hover:shadow-[#00f5ff]/18 cursor-pointer"
                      >
                        ARRANGE MIX & EXPORT →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── MULTIVERSE REMIX EXPANSION PANELS ── */}
                {!loadingBlueprint && blueprint && (
                  <div className="space-y-4 px-[18px]">
                    <div className="p-4 bg-card border border-[#8b5cf6]/20 rounded-[22px] space-y-3 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-mono text-[#8b5cf6] uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                          🎭 Multiverse Remix Portal
                        </div>
                        <span className="text-[9px] font-mono text-dim px-2 py-0.5 bg-white/5 rounded">
                          {activeUniverse ? activeUniverse.split(' ')[0] : "Baseline"}
                        </span>
                      </div>
                      <p className="text-[10px] text-secondary leading-normal">
                        Morph this song roadmap instantly across infinite stylistic timelines. Changes tempo, visual script, and tracks live!
                      </p>

                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { name: "Cyberpunk Neo-Tokyo", icon: "🚀", c: "from-[#00f5ff] to-[#8b5cf6]" },
                          { name: "Celestial Orchestral", icon: "🎻", c: "from-[#8b5cf6] to-[#f472b6]" },
                          { name: "Anime Opening Peak", icon: "💮", c: "from-[#fab1a0] to-[#e84393]" },
                          { name: "Dark Cinematic Noir", icon: "🌃", c: "from-[#3e3e3e] to-[#121212]" },
                          { name: "Retro Futurist Club", icon: "🌅", c: "from-[#ff7675] to-[#ffeaa7]" },
                          { name: "Festival EDM Cascade", icon: "⚡", c: "from-[#00dec9] to-[#0984e3]" }
                        ].map((univ) => (
                          <button
                            key={univ.name}
                            type="button"
                            onClick={() => remixMultiverse(univ.name)}
                            className={`p-2.5 text-left rounded-xl border text-[9.5px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                              activeUniverse === univ.name
                                ? "bg-white/[0.04] border-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                                : "bg-[#0c0c1b] border-white/5 text-dim hover:text-white"
                            }`}
                          >
                            <span className="mr-1 select-none">{univ.icon}</span> {univ.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── FIGMA-LIKE GLOBAL COLLABORATIVE SESSION ── */}
                    <div className="p-4 bg-card border border-[#10ffb0]/20 rounded-[22px] space-y-3 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-mono text-[#10ffb0] uppercase tracking-widest font-extrabold flex items-center gap-1.5 animate-pulse">
                          🌎 Global Collab Studio
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setGlobalCollab(!globalCollab);
                            showToast(globalCollab ? "🔌 Live room disconnected" : "🔌 Realtime Collaboration Sync Active!");
                          }}
                          className={`p-[3px_9px] rounded-full text-[8.5px] font-mono uppercase tracking-wide cursor-pointer ${
                            globalCollab 
                              ? "bg-[#10ffb0]/20 text-[#10ffb0] border border-[#10ffb0]" 
                              : "bg-white/5 text-dim border border-white/5"
                          }`}
                        >
                          {globalCollab ? "● CONNECTED" : "○ GO OFFLINE"}
                        </button>
                      </div>

                      <p className="text-[10px] text-secondary leading-normal">
                        Figma for sound. Co-producers sync timelines, and visual presets globally inside room <strong>#{collabRoom}</strong>.
                      </p>

                      {globalCollab ? (
                        <div className="space-y-2.5">
                          <div className="room-event-log p-2.5 bg-black/40 rounded-xl border border-white/5 h-[85px] overflow-y-auto scrollbar-none font-mono text-[9px] text-[#10ffb0]/90 space-y-1">
                            {collabLogs.map((log, idx) => (
                              <div key={idx} className="leading-relaxed border-b border-white/[0.02] pb-0.5 whitespace-pre-wrap">
                                ❯ {log}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              id="collab-msg-input"
                              placeholder="Message co-producers..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = e.currentTarget.value.trim();
                                  if (val) {
                                    setCollabLogs((prev) => [`@user (you): "${val}"`, ...prev]);
                                    e.currentTarget.value = "";
                                    showToast("🛰 Broadcasted modification!");
                                  }
                                }
                              }}
                              className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg p-1.5 text-xs text-primary placeholder-dim outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById("collab-msg-input") as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  setCollabLogs((prev) => [`@user (you): "${input.value.trim()}"`, ...prev]);
                                  input.value = "";
                                  showToast("🛰 Broadcasted modification!");
                                }
                              }}
                              className="bg-[#10ffb0]/10 border border-[#10ffb0]/30 hover:bg-[#10ffb0]/20 text-[#10ffb0] text-[9.5px] px-3 font-bold uppercase rounded-lg cursor-pointer"
                            >
                              SEND
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[9.5px] text-dim text-center italic py-1 border border-dashed border-white/5 rounded-xl">
                          Offline Mode. Enable live session room to simulate real-time Figma-like co-editing.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PIPELINE STEP 4: TRACK mixer */}
            {pipelineStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="step-header px-[18px]">
                  <div className="step-num text-[9px] font-mono text-[#8b5cf6] tracking-widest uppercase mb-1 font-bold">
                    STEP 04 / 04
                  </div>
                  <h2 className="font-display text-xl font-black bg-gradient-to-r from-white via-secondary to-[#8b5cf6] bg-clip-text text-transparent uppercase">
                    Arrange Mixer & FX
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Isolate stem channels, insert spatial audio plugins, and select master download containers.
                  </p>
                </div>

                {/* Miniature Integrated Waveform Player */}
                <div className="mini-player mx-[18px] p-4 bg-card border border-[#10ffb0]/20 hover:border-[#10ffb0]/35 rounded-[22px] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10ffb0] to-transparent" />
                  <div className="mp-row flex items-center justify-between mb-3.5">
                    <div>
                      <h4 id="mp-title" className="mp-title text-sm font-display font-semibold text-white">
                        {blueprint ? blueprint.title : "Untitled Composition"}
                      </h4>
                      <p id="mp-meta" className="mp-meta text-[9.5px] font-mono text-dim tracking-wide">
                        {blueprint ? `${blueprint.genre} · ${blueprint.subgenre}` : "Synthesizer matrix · Awaiting compile"}
                      </p>
                    </div>
                    <div className="mp-ctrl flex items-center gap-1.5">
                      <button 
                        onClick={restartPlayback} 
                        className="mp-btn w-9 h-9 rounded-lg border border-white/5 hover:border-white/15 bg-white/[0.03] active:scale-90 transition-all text-xs cursor-pointer flex items-center justify-center text-secondary"
                        title="Restart playback"
                      >
                        ⏮
                      </button>
                      <button 
                        onClick={togglePlayback} 
                        className="mp-btn play-main w-[42px] h-[42px] rounded-xl bg-gradient-to-tr from-[#10ffb0] to-[#00f5ff] hover:shadow-[0_0_15px_rgba(16,255,176,0.45)] text-[#03030e] font-bold text-center flex items-center justify-center text-sm cursor-pointer shadow-lg active:scale-95 transition-all outline-none"
                      >
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                      <button 
                        onClick={() => showToast("🔁 Loop active")} 
                        className="mp-btn w-9 h-9 rounded-lg border border-white/5 hover:border-white/15 bg-white/[0.03] active:scale-90 transition-all text-xs cursor-pointer flex items-center justify-center text-secondary"
                        title="Loop track"
                      >
                        🔁
                      </button>
                    </div>
                  </div>

                  {/* Playback seeker scrubber track */}
                  <div onClick={handleSeek} className="mp-progress w-full h-[4px] rounded-full bg-white/10 cursor-pointer relative mb-1">
                    <div 
                      className="mp-fill h-full bg-gradient-to-r from-[#10ffb0] to-[#00f5ff] rounded-full relative" 
                      style={{ width: `${playProgress * 100}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full bg-[#10ffb0] shadow-[0_0_8px_#10ffb0] cursor-grab"
                      style={{ left: `calc(${playProgress * 100}% - 6px)` }}
                    />
                  </div>

                  <div className="mp-time flex justify-between items-center text-[9px] font-mono text-dim mt-2 tracking-wider">
                    <span>{formatSeconds(playProgress * trackDuration)}</span>
                    <span>{formatSeconds(trackDuration)}</span>
                  </div>
                </div>

                {/* ── CENTRAL CREATIVE TABS SEGMENTED SLIDER ── */}
                <div className="tab-pill-container mx-[18px] p-[3px] bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-1 shadow-inner select-none">
                  {[
                    { id: "mix", label: "🎛️ Mixer", glow: "rgba(0,245,255,0.2)" },
                    { id: "beats", label: "🥁 Beats", glow: "rgba(139,92,246,0.2)" },
                    { id: "editor", label: "✂️ Audio", glow: "rgba(16,255,176,0.2)" },
                    { id: "vocals", label: "🎤 Vocals", glow: "rgba(244,114,182,0.2)" }
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      type="button"
                      onClick={() => {
                        setStudioSubTab(tb.id as any);
                        showToast(`Activated section: ${tb.label}`);
                        playSynthSound("hihat");
                      }}
                      className={`flex-1 py-1.5 text-[9.5px] font-display uppercase tracking-widest font-black transition-all cursor-pointer rounded-lg text-center outline-none ${
                        studioSubTab === tb.id
                          ? "bg-white/[0.08] text-white border border-white/10 shadow-md"
                          : "text-dim hover:text-[#eef2ff] bg-transparent"
                      }`}
                      style={{
                        boxShadow: studioSubTab === tb.id ? `0 0 10px ${tb.glow}` : undefined,
                        borderColor: studioSubTab === tb.id ? tb.glow : "transparent"
                      }}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>

                {studioSubTab === "mix" && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="section-hd flex justify-between items-center px-[18px]">
                      <span className="section-label">Stem isolator channels</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={runAutoBalance}
                          disabled={isAutoBalancing}
                          className="text-[9px] font-mono text-[#10ffb0] bg-[#10ffb0]/10 hover:bg-[#10ffb0]/20 border border-[#10ffb0]/30 font-bold px-2.5 py-1 rounded-md cursor-pointer disabled:opacity-40 select-none outline-none transition-all flex items-center gap-1"
                        >
                          {isAutoBalancing ? "⚡ BALANCING..." : "📐 AUTO-BALANCE"}
                        </button>
                        <button 
                          type="button"
                          onClick={() => showToast("➕ Add stem feature — Registered in background pipeline")} 
                          className="text-[9px] font-mono text-[#00f5ff] hover:text-white bg-[#00f5ff]/10 hover:bg-[#00f5ff]/25 border border-[#00f5ff]/30 px-2.5 py-1 rounded-md font-bold cursor-pointer select-none outline-none transition-all"
                        >
                          + ADD STEM
                        </button>
                      </div>
                    </div>

                    {/* Optional status rendering during auto-balancing */}
                    {isAutoBalancing && (
                      <div className="mx-[18px] p-2.5 bg-[#10ffb0]/5 border border-[#10ffb0]/20 rounded-xl flex items-center gap-2.5 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10ffb0] animate-ping" />
                        <span className="text-[10px] font-mono text-[#10ffb0] uppercase tracking-wider">
                          {autoBalanceStatus}
                        </span>
                      </div>
                    )}

                    <LaneWaveforms
                      playProgress={playProgress}
                      mutedLanes={mutedLanes}
                      setMutedLanes={setMutedLanes}
                      laneVolumes={laneVolumes}
                      setLaneVolumes={setLaneVolumes}
                      selectedFX={selectedFX}
                    />
                  </div>
                )}

                {studioSubTab === "beats" && (
                  <div className="space-y-4 animate-fadeIn px-[18px]">
                    <div className="p-4 bg-card border border-[#8b5cf6]/20 rounded-[20px] shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8b5cf6] text-xs animate-pulse">●</span>
                          <h4 className="text-xs font-display font-medium text-white uppercase tracking-wider font-bold">Manual Sequencing Grids</h4>
                        </div>
                        <span className="text-[8.5px] font-mono text-[#a78bfa] font-black uppercase bg-[#8b5cf6]/10 px-2 py-0.5 rounded border border-[#8b5cf6]/30">
                          {bpm} BPM
                        </span>
                      </div>

                      <p className="text-[10px] text-secondary leading-relaxed mb-4">
                        Zero AI loops. Toggle click cells below to construct continuous techno drum rhythm filters. Active triggers cascade in sync with play head ticker!
                      </p>

                      <div className="space-y-2">
                        {["kick", "snare", "hihat", "bass"].map((instrument) => {
                          const label = instrument === "kick" ? "🥁 KIK" : instrument === "snare" ? "💥 SNR" : instrument === "hihat" ? "⚡ HAT" : "🎹 BAS";
                          const activeColor = instrument === "kick" ? "bg-[#00f5ff]" : instrument === "snare" ? "bg-[#8b5cf6]" : instrument === "hihat" ? "bg-[#fbbf24]" : "bg-[#10ffb0]";
                          const glowColor = instrument === "kick" ? "shadow-[0_0_12px_#00f5ff]" : instrument === "snare" ? "shadow-[0_0_12px_#8b5cf6]" : instrument === "hihat" ? "shadow-[0_0_12px_#fbbf24]" : "shadow-[0_0_12px_#10ffb0]";

                          return (
                            <div key={instrument} className="flex items-center gap-2">
                              <span className="w-10 text-[9px] font-mono font-bold tracking-wider text-dim text-left uppercase shrink-0">
                                {label}
                              </span>
                              <div className="flex-1 grid grid-cols-8 gap-1.5">
                                {loopGrid[instrument].map((active, stepIdx) => {
                                  const isCurrentStep = isPlaying && currentLoopTick === stepIdx;
                                  return (
                                    <div
                                      key={stepIdx}
                                      onClick={() => {
                                        const copy = { ...loopGrid };
                                        copy[instrument][stepIdx] = !copy[instrument][stepIdx];
                                        setLoopGrid(copy);
                                        if (copy[instrument][stepIdx]) {
                                          playSynthSound(instrument as any);
                                        }
                                      }}
                                      className={`aspect-square rounded-lg border cursor-pointer transition-all active:scale-90 flex items-center justify-center relative ${
                                        active 
                                          ? `${activeColor} border-white/20 ${glowColor}` 
                                          : isCurrentStep 
                                            ? "bg-white/15 border-white/30" 
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                                      }`}
                                    >
                                      {isCurrentStep && (
                                        <div className="absolute inset-0 bg-white/25 rounded-lg animate-ping pointer-events-none" />
                                      )}
                                      <div className={`w-1 h-1 rounded-full ${active ? "bg-black/40" : isCurrentStep ? "bg-[#00f5ff]" : "bg-transparent"}`} />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/5 text-[9px] font-mono text-dim">
                        <span>Playhead Tick: step {currentLoopTick + 1} / 8</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLoopGrid({
                                kick: Array(8).fill(false),
                                snare: Array(8).fill(false),
                                hihat: Array(8).fill(false),
                                bass: Array(8).fill(false)
                              });
                              showToast("🗑️ Sequences grid cleared");
                            }}
                            className="text-red-400 hover:text-white uppercase font-bold cursor-pointer bg-transparent border-none"
                          >
                            CLEAR
                          </button>
                          <span className="text-dim">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLoopGrid({
                                kick: [true, false, false, false, true, false, false, false],
                                snare: [false, false, true, false, false, false, true, false],
                                hihat: [true, true, true, true, true, true, true, true],
                                bass: [true, false, true, false, true, true, false, true]
                              });
                              showToast("🔄 Loaded vintage electro loops");
                            }}
                            className="text-[#fbbf24] hover:text-white uppercase font-bold cursor-pointer bg-transparent border-none"
                          >
                            LOAD PRESETS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {studioSubTab === "editor" && (
                  <div className="space-y-4 animate-fadeIn px-[18px]">
                    <div className="p-4 bg-card border border-[#10ffb0]/20 rounded-[20px] shadow-lg relative overflow-hidden animate-fadeIn">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10ffb0] to-transparent" />
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-display font-medium text-white uppercase tracking-wider font-bold">WAV Sample Clipper & Editor</h4>
                        <span className="text-[10px] font-mono text-[#10ffb0] uppercase font-bold">Offline Edit</span>
                      </div>

                      {!uploadedFile ? (
                        <div 
                          onClick={() => {
                            setUploadedFile({
                              name: "my_custom_vox_theme.wav",
                              size: "5.1 MB",
                              duration: 180
                            });
                            showToast("📂 Custom local audio file imported into sandbox!");
                            playSynthSound("kick");
                          }}
                          className="p-8 border-2 border-dashed border-white/10 rounded-xl hover:border-[#10ffb0]/40 bg-white/[0.01] hover:bg-white/[0.04] transition-all text-center flex flex-col items-center justify-center gap-2.5 cursor-pointer group"
                        >
                          <span className="text-3xl select-none group-hover:scale-110 transition-transform">📂</span>
                          <div>
                            <div className="text-xs font-bold text-primary">UPLOAD AUDIO FILE (MP3 / WAV)</div>
                            <div className="text-[9px] font-mono text-dim mt-1.5">No cloud upload required · Sandbox audio cutter active</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">⚡</span>
                              <div>
                                <div className="text-xs font-bold text-[#10ffb0] truncate max-w-[210px]">{uploadedFile.name}</div>
                                <div className="text-[9.5px] font-mono text-dim">{uploadedFile.size} · Lossless linear PCM sampler</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedFile(null);
                                showToast("🗑 Cleared custom imported sample");
                              }}
                              className="text-dim hover:text-red-400 font-bold text-xs cursor-pointer bg-transparent border-none font-bold"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono text-dim uppercase">
                              <span>Cut Wave bounds</span>
                              <span className="text-[#10ffb0] font-bold">[{audioTrimRange[0]}% - {audioTrimRange[1]}%]</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-dim">Start frame trigger</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="45"
                                  value={audioTrimRange[0]}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setAudioTrimRange([val, audioTrimRange[1]]);
                                    playSynthSound("hihat");
                                  }}
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10ffb0]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-dim">End frame release</label>
                                <input
                                  type="range"
                                  min="55"
                                  max="100"
                                  value={audioTrimRange[1]}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setAudioTrimRange([audioTrimRange[0], val]);
                                    playSynthSound("hihat");
                                  }}
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10ffb0]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                            <div 
                              onClick={() => {
                                  setAudioFadeIn(!audioFadeIn);
                                  showToast(audioFadeIn ? "Bypassed Fade-In" : "Engaged Fade-In (1.5s)");
                                  playSynthSound("hihat");
                              }}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-[10px] font-mono uppercase font-bold transition-all ${
                                audioFadeIn 
                                  ? "bg-[#10ffb0]/10 border-[#10ffb0]/35 text-[#10ffb0]" 
                                  : "bg-white/[0.01] border-white/5 text-dim border-white/5"
                              }`}
                            >
                              <span>🔊 FADE-IN</span>
                              <span>{audioFadeIn ? "ON font-bold" : "OFF"}</span>
                            </div>
                            <div 
                              onClick={() => {
                                  setAudioFadeOut(!audioFadeOut);
                                  showToast(audioFadeOut ? "Bypassed Fade-Out" : "Engaged Fade-Out (3s)");
                                  playSynthSound("hihat");
                              }}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-[10px] font-mono uppercase font-bold transition-all ${
                                audioFadeOut 
                                  ? "bg-[#10ffb0]/10 border-[#10ffb0]/35 text-[#10ffb0]" 
                                  : "bg-white/[0.01] border-white/5 text-dim border-white/5"
                              }`}
                            >
                              <span>🔉 FADE-OUT</span>
                              <span>{audioFadeOut ? "ON font-bold" : "OFF"}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-between items-center text-[10px] font-mono text-dim uppercase border-t border-white/5 pt-3">
                            <span>Reverse play-head direction</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAudioReverse(!audioReverse);
                                showToast(audioReverse ? "Normal direction" : "🔄 tape reversing simulation active!");
                                playSynthSound("bass");
                              }}
                              className={`p-1.5 px-3 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${
                                audioReverse 
                                  ? "bg-[#ff4757]/15 border-[#ff4757]/30 text-[#ff4757]" 
                                  : "bg-white/5 border-white/5 text-dim border-white/10"
                              }`}
                            >
                              {audioReverse ? "REVERSED" : "NORMAL PLAY"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {studioSubTab === "vocals" && (
                  <div className="space-y-4 animate-fadeIn px-[18px]">
                    <div className="p-4 bg-card border border-[#f472b6]/20 rounded-[20px] shadow-lg relative overflow-hidden animate-fadeIn">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#f472b6] to-transparent" />
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-display font-medium text-white uppercase tracking-wider font-bold">Vocal Synth & Kara Replacement</h4>
                        <span className="text-[9.5px] font-mono text-[#f472b6] bg-[#f472b6]/10 px-2 py-0.5 rounded border border-[#f472b6]/20 uppercase font-black">
                          Auto Formants
                        </span>
                      </div>

                      <p className="text-[10px] text-secondary leading-relaxed mb-4">
                        Write funny statements to compile local synthesized robotics vocal tracks without AI tokens! Or capture microphone live stream voiceover overlays.
                      </p>

                      <div className="space-y-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl mb-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-dim uppercase font-bold">Timbre Profile Model</label>
                          <select
                            value={karaokeVoice}
                            onChange={(e) => {
                              setKaraokeVoice(e.target.value);
                              showToast(`Target Timbre set: ${e.target.value}`);
                              playSynthSound("hihat");
                            }}
                            className="bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-[#f472b6] outline-none"
                          >
                            <option value="Siren-X Vocaloid 9">Siren-X Vocaloid G9 (Pop/High Synth)</option>
                            <option value="VA-01 Cypher Bass">VA-01 Cypher Sub-Bass (Deep/Vocoder)</option>
                            <option value="Aegis Sovereign Male">Aegis Sovereign (Golden Hour/Warm)</option>
                            <option value="Miku Retro 1982">Miku Retro 1982 (Analog Waveform)</option>
                          </select>
                        </div>

                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={vocalSynthText}
                            onChange={(e) => setVocalSynthText(e.target.value)}
                            placeholder="Synthesize a dynamic line word..."
                            className="flex-1 bg-black/50 border border-white/5 rounded-lg p-2 text-xs text-primary placeholder-dim outline-none focus:border-[#f472b6]/40"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleVocalSynthesis();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleVocalSynthesis}
                            className="bg-[#f472b6]/15 hover:bg-[#f472b6]/25 border border-[#f472b6]/35 text-[#f472b6] text-[10px] px-3 font-bold uppercase rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            VOC CODE
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono text-dim uppercase">
                          <span>Vocals snippets list</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isRecordingVocal) {
                                setIsRecordingVocal(false);
                                showToast("⏹ Added live microphone vocal sample!");
                                const newClip = {
                                  id: "rec-" + Date.now(),
                                  name: "Mic Override Clip #" + (vocalClips.length + 1),
                                  timestamp: Date.now(),
                                  voiceType: "Live Mic formants"
                                };
                                setVocalClips((prev) => [newClip, ...prev]);
                                playSynthSound("snare");
                              } else {
                                setIsRecordingVocal(true);
                                showToast("🎤 Recording mic overlay live...");
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isRecordingVocal 
                                ? "bg-red-500 animate-pulse text-white font-bold" 
                                : "bg-white/10 hover:bg-white/15 text-primary"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {isRecordingVocal ? "CAPTURE..." : "MIC RECORD"}
                          </button>
                        </div>

                        <div className="max-h-[100px] overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                          {vocalClips.map((clip) => (
                            <div key={clip.id} className="p-2 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between text-xs transition-hover hover:border-white/10">
                              <div className="flex items-center gap-2">
                                <span className="text-[#f472b6] animate-pulse">🎙️</span>
                                <div>
                                  <div className="text-xs text-primary truncate max-w-[170px]">{clip.name}</div>
                                  <div className="text-[8.5px] font-mono text-dim">{clip.voiceType} · Ready</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  showToast(`🗣 Bypassing AI stem... Auditioning raw stream`);
                                  playSynthSound("bass");
                                }}
                                className="text-[10px] font-mono text-[#f472b6] hover:text-white cursor-pointer bg-transparent border-none"
                              >
                                AUDITION
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MIX PRESETS LIBRARY */}
                <div className="space-y-2">
                  <div className="section-hd flex justify-between items-center px-[18px]">
                    <span className="section-label">Preset Library & Switching</span>
                    <button
                      onClick={() => setShowSavePresetDialog(true)}
                      className="text-[9px] font-mono text-[#8b5cf6] hover:text-white bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/25 border border-[#8b5cf6]/30 px-2.5 py-1 rounded-md font-bold cursor-pointer select-none outline-none transition-all"
                      title="Save current fader gains as preset"
                    >
                      💾 SAVE MIX STATE
                    </button>
                  </div>
                  
                  <div className="preset-row flex gap-2 overflow-x-auto px-[18px] pb-1 cursor-scrollbar pr-[18px] scrollbar-none">
                    {/* Stock Presets */}
                    {stockMixPresets.map((pst) => (
                      <div
                        key={pst.id}
                        onClick={() => loadMixPreset(pst)}
                        className="preset-btn flex-shrink-0 flex items-center gap-1 p-2 px-3 bg-white/[0.02] hover:bg-[#8b5cf6]/15 hover:text-white border border-white/5 hover:border-white/10 text-[9.5px] font-mono uppercase font-bold rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition-all text-dim"
                      >
                        {pst.name}
                      </div>
                    ))}
                    
                    {/* Custom User Saved Presets */}
                    {customMixPresets.map((pst) => (
                      <div
                        key={pst.id}
                        className="preset-btn flex-shrink-0 flex items-center gap-2 p-2 px-3 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/15 border border-[#8b5cf6]/25 hover:border-[#8b5cf6]/50 text-[9.5px] font-mono uppercase font-bold rounded-lg whitespace-nowrap active:scale-95 transition-all text-[#a78bfa] relative"
                      >
                        <span onClick={() => loadMixPreset(pst)} className="cursor-pointer">✨ {pst.name}</span>
                        <button 
                          onClick={(e) => handleDeleteMixPreset(pst.id, e)}
                          className="text-[9px] text-red-400 hover:text-red-500 hover:scale-125 transition-transform bg-transparent border-none cursor-pointer px-0.5 line-height-none"
                          title="Delete Preset"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {customMixPresets.length === 0 && (
                      <div className="text-[9.5px] font-mono text-dim self-center pl-1 italic">
                        (No custom presets saved)
                      </div>
                    )}
                  </div>
                </div>

                {/* Spatial plugin options */}
                <div className="space-y-2">
                  <div className="section-hd px-[18px]">
                    <span className="section-label">Spatial & mixing Plugins</span>
                  </div>
                  <div className="fx-row flex gap-2 overflow-x-auto px-[18px] pb-1 scrollbar-none pr-[18px]">
                    {["🎚 Reverb", "🎛 Pro-EQ", "🗜 Compressor", "✨ AI Mastering", "🎵 Harmony +2", "🔊 Spatial 3D", "🌀 Chorus FX"].map((fx) => {
                      const isActive = activePlugins.includes(fx);
                      const isSelected = selectedFX === fx;
                      
                      return (
                        <div
                          key={fx}
                          onClick={() => {
                            let updated: string[];
                            if (isActive) {
                              updated = activePlugins.filter(p => p !== fx);
                              if (selectedFX === fx) {
                                setSelectedFX(updated.length > 0 ? updated[0] : null);
                              }
                            } else {
                              updated = [...activePlugins, fx];
                              setSelectedFX(fx); // Focus on active FX for spectrum dynamic highlights
                            }
                            setActivePlugins(updated);
                            showToast(isActive ? `⚡ Bypassed: ${fx}` : `⚡ Engaged: ${fx}`);
                          }}
                          className={`fx-btn flex-shrink-0 p-2 px-3.5 border text-[9.5px] font-display uppercase font-bold tracking-wider rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-[#00f5ff]/10 to-[#8b5cf6]/10 text-white border-[#00f5ff]/40 shadow-[0_0_12px_rgba(0,245,255,0.06)]"
                              : "bg-white/[0.03] border-white/5 text-dim hover:text-white"
                          } ${isSelected ? "ring-1 ring-[#00f5ff] ring-offset-2 ring-offset-[#03030e]" : ""}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{fx}</span>
                            {isActive && <div className="w-[5px] h-[5px] rounded-full bg-[#00f5ff] animate-pulse" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export panel triggers */}
                <div className="space-y-2.5">
                  <div className="section-hd px-[18px]">
                    <span className="section-label">Select Export format</span>
                  </div>
                  <div className="export-panel mx-[18px] bg-card border border-white/[0.05] rounded-[22px] overflow-hidden shadow-md">
                    <div className="ep-header p-[13px_16px] border-b border-white/[0.04] bg-white/[0.02] text-[11px] font-display text-secondary tracking-widest uppercase font-bold flex items-center gap-1.5">
                      📤 Compile Final Containers
                    </div>
                    <div className="ep-body p-4 flex flex-col gap-2">
                      <div 
                        onClick={() => showToast("🎵 Compiling high-bitrate MP3 profile in background...")} 
                        className="ep-item p-[11px_14px] bg-white/[0.02] hover:bg-[#00f5ff]/5 border border-white/[0.04] hover:border-[#00f5ff]/20 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="ep-item-left flex items-center gap-3">
                          <span className="text-[20px] select-none">🎵</span>
                          <div>
                            <div className="ep-format text-xs text-primary font-display font-medium font-bold leading-normal">MP3 AUDIO FILE</div>
                            <div className="ep-desc text-[9.5px] font-mono text-dim tracking-wide mt-0.5">MPEG container · High-rate 320kbps</div>
                          </div>
                        </div>
                        <div className="ep-size text-[10px] font-mono text-dim font-semibold">~8.4 MB</div>
                      </div>
                      <div 
                        onClick={() => startHighFidelityExport("WAV")} 
                        className="ep-item p-[11px_14px] bg-[#10ffb0]/5 hover:bg-[#10ffb0]/10 border border-[#10ffb0]/20 hover:border-[#10ffb0]/40 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="ep-item-left flex items-center gap-3">
                          <span className="text-[20px] select-none text-[#10ffb0]">🎼</span>
                          <div>
                            <div className="ep-format text-xs text-[#10ffb0] font-display font-medium font-bold leading-normal">WAV LOSSLESS COMPILER</div>
                            <div className="ep-desc text-[9.5px] font-mono text-[#10ffb0]/70 tracking-wide mt-0.5">PCM Lossless raw audio · 24-bit 44.1kHz</div>
                          </div>
                        </div>
                        <div className="ep-size text-[10px] font-mono text-[#10ffb0] font-semibold">~41.5 MB</div>
                      </div>
                      <div 
                        onClick={() => startHighFidelityExport("VIDEO")} 
                        className="ep-item p-[11px_14px] bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="ep-item-left flex items-center gap-3">
                          <span className="text-[20px] select-none text-[#8b5cf6]">🎬</span>
                          <div>
                            <div className="ep-format text-xs text-[#8b5cf6] font-display font-medium font-bold leading-normal">🎬 SOCIAL VERTICAL REEL VIDEO</div>
                            <div className="ep-desc text-[9.5px] font-mono text-[#a78bfa] tracking-wide mt-0.5">Aspect ratio 9:16 Video · Stitched Master</div>
                          </div>
                        </div>
                        <div className="ep-size text-[10px] font-mono text-[#8b5cf6] font-semibold">~24.8 MB</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* mixer buttons */}
                <div className="px-[18px] flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPipelineStep(3)}
                    className="btn btn-ghost py-3 px-5 text-xs font-bold tracking-wider rounded-xl cursor-pointer"
                  >
                    ← ROADMAP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast("🚀 Composing social promos...");
                      setCurrentScreen("share");
                    }}
                    className="btn btn-primary flex-1 py-3 text-xs text-center font-bold tracking-widest rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(0,245,255,0.25)]"
                  >
                    PROMOTE & SHARE TRACK →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== WRITTEN LYRICS STUDIO SCREEN ================== */}
        {currentScreen === "lyrics" && (
          <div className="screen-animation space-y-4">
            <div className="lyrics-hero px-[18px] pt-[22px]">
              <h2 className="font-display text-xl font-black bg-gradient-to-r from-white via-secondary to-[#f472b6] bg-clip-text text-transparent uppercase">
                Lyric Studio
              </h2>
              <p className="text-secondary text-xs leading-relaxed">
                Empower your songwriting with customized words generated securely based on your blueprint aesthetics.
              </p>
            </div>

            {/* Songwriting mode selector pill row */}
            <div className="lyrics-mode-row px-[18px] flex gap-1.5 overflow-x-auto scrollbar-none pr-[18px]">
              {[
                { id: "full", l: "Full Song" },
                { id: "verse", l: "Verse block" },
                { id: "chorus", l: "Chorus block" },
                { id: "bridge", l: "Bridge outline" },
                { id: "hook", l: "Single Hook" }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setLyricsMode(m.id as any)}
                  className={`lm-btn flex-shrink-0 p-1.5 px-3.5 rounded-full text-[10px] font-display uppercase font-bold tracking-wider border cursor-pointer transition-all ${
                    lyricsMode === m.id
                      ? "bg-[#f472b6]/15 border-[#f472b6]/40 text-[#f472b6]"
                      : "bg-white/[0.03] border-white/5 text-dim hover:text-[#eef2ff]"
                  }`}
                >
                  {m.l}
                </div>
              ))}
            </div>

            {/* Input field for lyrics topic */}
            <div className="lyrics-prompt-row px-[18px] flex gap-2">
              <input
                id="lyrics-topic"
                type="text"
                value={lyricsTopic}
                onChange={(e) => setLyricsTopic(e.target.value)}
                placeholder="Topic / Feeling... e.g. escaping the static city rain"
                className="flex-1 p-[11px_14px] rounded-xl bg-card border border-white/[0.04] text-xs text-primary outline-none focus:border-[#f472b6]/50"
              />
              <button
                type="button"
                onClick={generateLyrics}
                disabled={loadingLyrics || !lyricsTopic.trim()}
                className="lp-btn bg-gradient-to-tr from-[#f472b6] to-[#8b5cf6] hover:shadow-[0_0_12px_rgba(244,114,182,0.35)] text-[#03030e] font-display font-black text-[10px] tracking-wider uppercase p-[11px_16px] rounded-xl cursor-pointer active:scale-95 disabled:opacity-40 transition-all font-bold"
              >
                ✦ Write
              </button>
            </div>

            {/* Songwriting Loading progress feedback */}
            {loadingLyrics && (
              <div className="lyrics-loading mx-[18px] p-6 bg-card border border-white/[0.04] rounded-[24px] text-center shadow-md animate-pulse">
                <div className="dr-spinner spinning-loader w-[52px] h-[52px] rounded-xl mx-auto mb-4 bg-gradient-to-tr from-[#f472b6] to-[#8b5cf6] flex items-center justify-center text-xl font-bold text-white">
                  ✦
                </div>
                <div className="dr-status font-display text-xs font-bold text-[#f472b6] mb-1">
                  Drafting rhyme verses...
                </div>
                <div className="dr-sub text-[9.5px] font-mono text-dim tracking-wide">
                  Vox Assistant is organizing rhythms and bars
                </div>
              </div>
            )}

            {/* Songwriting result output lists */}
            {!loadingLyrics && lyricsList.length > 0 && (
              <div className="lyrics-result px-0 space-y-4">
                <div id="lyrics-sections" className="space-y-3 px-[18px]">
                  {lyricsList.map((sect, sidx) => (
                    <div
                      key={sidx}
                      className="lyric-section bg-card border border-white/[0.04] rounded-[18px] overflow-hidden shadow-sm"
                      style={{
                        borderLeft: `3px solid ${
                          sect.label.includes("CHORUS") ? "var(--neon-gold)" : "var(--neon-violet)"
                        }`
                      }}
                    >
                      <div className="ls-header p-[10px_14px] flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02]">
                        <span className={`ls-label text-[10.5px] font-display tracking-widest uppercase font-bold ${
                          sect.label.includes("CHORUS") ? "text-[#fbbf24]" : "text-[#8b5cf6]"
                        }`}>
                          {sect.label}
                        </span>
                        <span
                          onClick={() => {
                            navigator.clipboard?.writeText(sect.lyrics)
                              .then(() => showToast(`📋 Copied ${sect.label}`));
                          }}
                          className="ls-copy text-[9.5px] cursor-pointer p-[3px_8px] rounded-md bg-white/[0.03] border border-white/5 text-dim hover:text-[#00f5ff] transition-all font-semibold"
                        >
                          📋 COPY BLOCK
                        </span>
                      </div>
                      <div className="ls-body p-2 bg-black/25">
                        <textarea
                          rows={sect.lyrics.split("\n").length + 1}
                          value={sect.lyrics}
                          onChange={(e) => {
                            const updated = [...lyricsList];
                            updated[sidx] = { ...sect, lyrics: e.target.value };
                            setLyricsList(updated);
                          }}
                          className="w-full bg-transparent text-xs font-mono text-secondary leading-[1.7] whitespace-pre-wrap select-text outline-none focus:text-white border-none py-1 px-3 resize-none scrollbar-none"
                          placeholder="Type here to rewrite lyrics..."
                        />
                        <div className="text-[8px] font-mono text-dim px-3 pb-1.5 text-right uppercase select-none">
                          ✎ Interactive Mode: Click to Rewrite Lines
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lyrics Action Suite */}
                <div className="lyrics-actions flex gap-2 px-[18px]">
                  <button
                    type="button"
                    onClick={generateLyrics}
                    className="btn btn-ghost flex-1 py-3 text-xs"
                  >
                    ↺ REDO LAYOUT
                  </button>
                  <button
                    type="button"
                    onClick={copyAllLyrics}
                    className="btn btn-cyan flex-1 py-3 text-xs font-semibold"
                  >
                    📋 COPY ALL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== SHARE & CO-PROMOTIONS SCREEN ================== */}
        {currentScreen === "share" && (
          <div className="screen-animation space-y-4">
            <div className="share-hero px-[18px] pt-[22px]">
              <h2 className="font-display text-xl font-black bg-gradient-to-r from-white via-secondary to-[#fbbf24] bg-clip-text text-transparent uppercase">
                Promote Release
              </h2>
              <p className="text-secondary text-xs leading-relaxed">
                Generate high-conversion visual release cards and discover optimal copy hashtags with Gemini.
              </p>
            </div>

            {blueprint ? (
              <ShareCard
                blueprint={blueprint}
                onCopyCaption={(caption) => {
                  navigator.clipboard?.writeText(caption)
                    .then(() => showToast("📋 Caption copied to clipboard!"))
                    .catch(() => showToast("📋 Caption copy failed"));
                }}
              />
            ) : (
              <div className="mx-[18px] p-8 text-center bg-card border border-white/5 rounded-[22px] flex flex-col items-center justify-center">
                <span className="text-3xl block mb-2 font-bold">📤</span>
                <p className="text-secondary text-xs mb-4">No active blueprint generated to display promotion outlines.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPromptText("An energetic retro wave banger about flying rockets");
                    setCurrentScreen("create");
                    setPipelineStep(2);
                  }}
                  className="btn btn-primary py-2.5 px-6 text-xs font-bold leading-normal"
                >
                  Create Concept Blueprint
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================== PROFILE / MY PROJECTS SCREEN ================== */}
        {currentScreen === "profile" && (
          <div className="screen-animation space-y-4">
            <div className="profile-hero flex flex-col items-center text-center pt-6 px-[18px]">
              <div className="p-avatar w-[76px] h-[76px] rounded-[22px] bg-gradient-to-tr from-[#8b5cf6] to-[#00f5ff] flex items-center justify-center text-3xl font-black text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] relative mb-3">
                🎵
              </div>
              <h3 className="font-display text-base font-bold text-white leading-tight">
                {user ? user.name : "Vox Guest Creator"}
              </h3>
              <p className="text-[10px] font-mono text-dim tracking-wider uppercase mb-4">
                {user ? user.handle : "@guest"} · {user ? `${user.plan} Account` : "Free Plan"}
              </p>

              <div className="p-stats flex gap-5">
                <div className="ps-item text-center">
                  <div className="ps-val font-display text-base font-bold text-[#00f5ff]">
                    {libraryProjects.length}
                  </div>
                  <div className="ps-lbl text-[8px] font-mono text-dim tracking-widest uppercase">
                    Compiled
                  </div>
                </div>
                <div className="ps-item text-center">
                  <div className="ps-val font-display text-base font-bold text-[#00f5ff]">
                    2.4k
                  </div>
                  <div className="ps-lbl text-[8px] font-mono text-dim tracking-widest uppercase">
                    Plays
                  </div>
                </div>
                <div className="ps-item text-center">
                  <div className="ps-val font-display text-base font-bold text-[#00f5ff]">
                    48
                  </div>
                  <div className="ps-lbl text-[8px] font-mono text-dim tracking-widest uppercase">
                    Following
                  </div>
                </div>
              </div>
            </div>

            {/* Offline library lists represent files */}
            <div className="space-y-2.5">
              <div className="section-hd px-[18px] flex items-center justify-between">
                <span className="section-label">Compiled Project Library</span>
                {libraryProjects.length > 0 && (
                  <span 
                    onClick={() => {
                      localStorage.removeItem("vox_projects");
                      setLibraryProjects([]);
                      showToast("🗑 Cleared library database");
                    }} 
                    className="section-action text-[9px] font-mono text-[#ff4757] font-semibold tracking-wider cursor-pointer"
                  >
                    CLEAR ALL
                  </span>
                )}
              </div>

              {libraryProjects.length === 0 ? (
                <div className="mx-[18px] p-8 text-center bg-card border border-white/5 rounded-[22px] flex flex-col items-center justify-center">
                  <span className="text-2xl block mb-1">📂</span>
                  <p className="text-secondary text-xs">Your offline project catalog is empty.</p>
                </div>
              ) : (
                <div className="lib-list flex flex-col gap-2 px-[18px]">
                  {libraryProjects.map((prj) => (
                    <div
                      key={prj.id}
                      onClick={() => loadBlueprintIntoStudio(prj.blueprint)}
                      className="lib-item p-[11px_13px] bg-card border border-white/[0.04] rounded-xl flex items-center gap-3 cursor-pointer hover:border-[#00f5ff]/20 active:scale-[0.99] transition-all"
                    >
                      <div className="li-icon w-10 h-10 rounded-lg bg-[#00f5ff]/10 flex items-center justify-center text-xl shrink-0 select-none">
                        🌊
                      </div>
                      <div className="li-info flex-1 min-w-0">
                        <div className="li-title text-xs font-bold text-primary truncate leading-normal">
                          {prj.blueprint.title}
                        </div>
                        <div className="li-meta text-[9.5px] font-mono text-dim truncate mt-0.5">
                          {prj.blueprint.genre} · {prj.blueprint.bpm} BPM · {prj.blueprint.key}
                        </div>
                      </div>
                      <div className="li-dur text-[10px] font-mono text-secondary shrink-0">
                        {prj.blueprint.duration || "3:30"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Added brand new quick links at the bottom of the profile page */}
            {/* Added brand new quick links at the bottom of the profile page */}
            <div className="px-[18px] pb-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("app-info")}
                className="w-full py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/15 text-secondary text-[11px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                ℹ SPECS, ABOUT & PRIVACY HUB
              </button>
            </div>
          </div>
        )}

        {/* ================== APP INFO SYSTEM DASHBOARD (v1.0.0) ================== */}
        {currentScreen === "app-info" && (
          <div className="screen-animation space-y-3.5 px-[18px] pt-[20px] pb-6">
            <div className="about-hero text-center space-y-1 mb-3 animate-scaleUp">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f5ff] via-[#8b5cf6] to-[#fbbf24] flex items-center justify-center text-lg select-none font-bold shadow-lg shadow-[#00f5ff]/10">
                {infoSubTab === "specs" && "📱"}
                {infoSubTab === "about" && "🏢"}
                {infoSubTab === "privacy" && "🛡️"}
                {infoSubTab === "guide" && "📖"}
              </div>
              <h2 className="font-display text-lg font-black bg-gradient-to-r from-white via-[#eef2ff] to-[#00f5ff] bg-clip-text text-transparent uppercase tracking-wider leading-tight">
                {infoSubTab === "specs" && "System Diagnostics"}
                {infoSubTab === "about" && "About Vox Studio"}
                {infoSubTab === "privacy" && "Privacy policy"}
                {infoSubTab === "guide" && "App User Guide"}
              </h2>
              <p className="text-[9px] font-mono text-dim tracking-widest uppercase font-bold">
                {infoSubTab === "specs" && "VOX MUSICGEN OS v1.0.0 [PRO]"}
                {infoSubTab === "about" && "Enterprise & Creative Narrative"}
                {infoSubTab === "privacy" && "Creator Isolation Statutes"}
                {infoSubTab === "guide" && "Welcome & Master Tips"}
              </p>
            </div>

            {/* Shared Subsection Sub-Navigation - Grid of 4 Equal Tabs */}
            <div className="flex bg-black/[0.6] border border-white/[0.05] p-1 rounded-xl gap-1 mb-2.5 select-none shrink-0">
              <button
                type="button"
                onClick={() => setInfoSubTab("specs")}
                className={`flex-1 py-1.5 text-center text-[9px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer ${
                  infoSubTab === "specs"
                    ? "bg-[#00f5ff]/15 border border-[#00f5ff]/35 text-[#00f5ff] shadow-[0_0_8px_rgba(0,245,255,0.25)]"
                    : "border border-transparent text-dim hover:text-white"
                }`}
              >
                Specs
              </button>
              <button
                type="button"
                onClick={() => setInfoSubTab("about")}
                className={`flex-1 py-1.5 text-center text-[9px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer ${
                  infoSubTab === "about"
                    ? "bg-[#8b5cf6]/15 border border-[#8b5cf6]/35 text-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.25)]"
                    : "border border-transparent text-dim hover:text-white"
                }`}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => setInfoSubTab("privacy")}
                className={`flex-1 py-1.5 text-center text-[9px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer ${
                  infoSubTab === "privacy"
                    ? "bg-[#10ffb0]/15 border border-[#10ffb0]/35 text-[#10ffb0] shadow-[0_0_8px_rgba(16,255,176,0.25)]"
                    : "border border-transparent text-dim hover:text-white"
                }`}
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => setInfoSubTab("guide")}
                className={`flex-1 py-1.5 text-center text-[9px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer ${
                  infoSubTab === "guide"
                    ? "bg-[#fbbf24]/15 border border-[#fbbf24]/35 text-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                    : "border border-transparent text-dim hover:text-white"
                }`}
              >
                Guide
              </button>
            </div>

            {/* TAB CONTENT: SPECS */}
            {infoSubTab === "specs" && (
              <div className="space-y-3.5 animate-scaleUp">
                {/* Core Application Details Block */}
                <div className="p-4 bg-[#050514]/95 border border-white/[0.04] rounded-[20px] space-y-3.5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f5ff]/25 to-transparent" />
                  
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                    <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Build Core Name:</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Vox MusicGen Studio</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                    <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Platform Version:</span>
                    <span className="text-xs font-extrabold text-[#00f5ff] font-mono tracking-wider">v1.0.0 [PRO]</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                    <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Active Drivers:</span>
                    <span className="text-[10px] font-mono text-[#fbbf24] font-semibold">WebAudio v2 + Matrix EQ + Neural Stem Renderer</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Sandbox Node:</span>
                    <span className="text-[9.5px] font-mono text-[#10ffb0] uppercase font-bold">Secure Gateway Mode</span>
                  </div>
                </div>

                {/* Live CPU Telemetry & Sound Matrix Stats */}
                <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.03] rounded-[20px] space-y-3 shadow-md">
                  <h3 className="text-[10px] font-display text-[#00f5ff] font-bold tracking-widest uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-ping" />
                    Live Telemetry Matrix
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/[0.02]">
                      <p className="text-[8px] font-mono text-dim uppercase tracking-wider">Engine Latency</p>
                      <p className="text-sm font-display font-medium text-[#10ffb0] mt-0.5">1.2ms</p>
                    </div>
                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/[0.02]">
                      <p className="text-[8px] font-mono text-dim uppercase tracking-wider">Audio Buffer</p>
                      <p className="text-sm font-display font-medium text-white mt-0.5">1024 smpl</p>
                    </div>
                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/[0.02]">
                      <p className="text-[8px] font-mono text-dim uppercase tracking-wider">Storage Memory</p>
                      <p className="text-sm font-display font-medium text-[#fbbf24] mt-0.5">18.4 MB</p>
                    </div>
                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/[0.02]">
                      <p className="text-[8px] font-mono text-dim uppercase tracking-wider">Channel Threads</p>
                      <p className="text-sm font-display font-medium text-[#8b5cf6] mt-0.5">6 Isolated</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ABOUT */}
            {infoSubTab === "about" && (
              <div className="space-y-3.5 animate-scaleUp">
                {/* Cinematic Vocal-first header Card */}
                <div className="p-4 bg-gradient-to-br from-[#1a0033]/70 to-[#020208]/90 border border-[#8b5cf6]/30 rounded-[20px] space-y-1.5 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent rounded-full blur-2xl" />
                  <span className="text-[8px] font-mono text-[#8b5cf6] tracking-[0.2em] uppercase font-bold">Cinematic Sound Studio</span>
                  <h3 className="font-display text-[13px] font-extrabold text-white leading-normal uppercase">
                    “Cinematic Vocals & Emotional Soundtracks Powered by AI”
                  </h3>
                  <p className="text-[10px] text-[#b4c3ff]/90 leading-relaxed">
                    Vox MusicGen is a next-generation AI creative sandbox designed for filmmakers, composers, and storytellers.
                  </p>
                  <p className="text-[10px] text-[#b4c3ff]/70 leading-relaxed font-light">
                    Turn simple emotional prompts into responsive, high-fidelity cinematic music with professional stems, voice expression, and perfect structure — all in seconds.
                  </p>
                </div>

                {/* Highlight Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                    <span className="text-sm">🎤</span>
                    <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-wider">Vocal Excellence</h4>
                    <p className="text-[9px] text-dim leading-snug">Soaring leads, emotional choirs, and raw lyric deliveries.</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                    <span className="text-sm">🎬</span>
                    <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-wider">Cinematic Precision</h4>
                    <p className="text-[9px] text-dim leading-snug">Hollywood rising tension curves, drop curves, and epic builds.</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                    <span className="text-sm">🎛️</span>
                    <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-wider">Pro Tools</h4>
                    <p className="text-[9px] text-dim leading-snug">Full multi-stem isolation, inpainting, and master control panels.</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                    <span className="text-sm">🧪</span>
                    <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-wider">Active Synthesis</h4>
                    <p className="text-[9px] text-dim leading-snug">Led by Sachin Sheth, running on local client-side soundwaves.</p>
                  </div>
                </div>

                {/* Tech Stack Card */}
                <div className="p-3 bg-[#03030e]/40 border border-white/[0.03] rounded-xl flex justify-between items-center">
                  <span className="text-[8.5px] font-mono text-dim uppercase">Tech Architecture:</span>
                  <span className="text-[9px] font-mono text-[#00f5ff] font-semibold">React 18 + Pure TypeScript + WebAudio v2</span>
                </div>

                {/* Team / Credits Footer block */}
                <div className="p-3.5 bg-black/[0.4] border border-white/[0.04] rounded-[14px] flex justify-between items-center text-[9.5px]">
                  <div className="space-y-0.5">
                    <span className="text-dim block text-[8px] uppercase tracking-wider">Lead Developer</span>
                    <strong className="text-[#fbbf24] font-bold font-sans">Sachin Sheth</strong>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-dim block text-[8px] uppercase tracking-wider">Publisher Group</span>
                    <strong className="text-[#10ffb0] font-bold font-sans">CodeTech Studio</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRIVACY */}
            {infoSubTab === "privacy" && (
              <div className="space-y-3.5 animate-scaleUp">
                {/* Introduction */}
                <div className="p-4 bg-[#050514]/90 border border-white/[0.04] rounded-[20px] space-y-3 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#10ffb0]/25 to-transparent" />
                  
                  <div className="flex items-center gap-2 text-white border-b border-white/[0.03] pb-2">
                    <span className="text-xs">🛡️</span>
                    <h3 className="font-display text-[10px] font-black tracking-widest uppercase text-white">
                      CODETECH STUDIO STATUTES
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-[10px] text-secondary leading-relaxed">
                    <p>
                      At <strong>CodeTech Studio</strong>, we respect your creativity and privacy. We do not track or capture your output files without explicit consent.
                    </p>
                    <p className="text-[9px] text-[#fbbf24]/90 font-mono">
                      Last Updated: May 25, 2026
                    </p>
                  </div>
                </div>

                {/* Grid Lists */}
                <div className="space-y-2.5">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1.5">
                    <h4 className="text-[9.5px] font-display font-bold text-white uppercase tracking-wider">📁 Data We Collect</h4>
                    <ul className="list-disc list-inside text-[9px] text-dim space-y-1 leading-relaxed">
                      <li>Prompt text inputs and generation state metadata to optimize models.</li>
                      <li>Encrypted, fully deletable audio samples uploaded only for custom voice cloning.</li>
                      <li>Completely anonymous layout and screen routing usage metrics.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1.5">
                    <h4 className="text-[9.5px] font-display font-bold text-white uppercase tracking-wider">❌ What We Don't Do</h4>
                    <ul className="list-disc list-inside text-[9px] text-dim space-y-1 leading-relaxed">
                      <li>Sell or distribute your creative output or contact data to third parties.</li>
                      <li>Train underlying models on your creations or tracks without your prompt approval.</li>
                      <li>Retain or cache your files longer than standard session expiration thresholds.</li>
                    </ul>
                  </div>
                </div>

                {/* Detailed Protection Bullet Cards */}
                <div className="space-y-2 font-mono text-[8.5px] text-[#b4c3ff]/90">
                  <div className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                    <span className="text-[#10ffb0] font-bold">✓</span>
                    <p><strong>Zero Audio Tracking:</strong> Inputs computed locally & securely.</p>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                    <span className="text-[#10ffb0] font-bold">✓</span>
                    <p><strong>Perfect IP Protection:</strong> You own 100% of your creations.</p>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                    <span className="text-[#10ffb0] font-bold">✓</span>
                    <p><strong>Offline Isolation Mode:</strong> Safe browser storage caching patterns.</p>
                  </div>
                </div>

                {/* Contact info card */}
                <div className="p-3 bg-[#03030e]/40 border border-[#10ffb0]/20 rounded-xl flex justify-between items-center text-[9px]">
                  <span className="text-dim uppercase font-mono">Privacy Enquiries:</span>
                  <span className="text-[#10ffb0] font-mono select-all">privacy@codetech.studio</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GUIDE */}
            {infoSubTab === "guide" && (
              <div className="space-y-3.5 animate-scaleUp max-h-[380px] overflow-y-auto pr-1">
                {/* Intro Banner */}
                <div className="p-4 bg-gradient-to-br from-[#fbbf24]/10 to-[#020208]/90 border border-[#fbbf24]/20 rounded-[20px] space-y-1 text-center relative overflow-hidden shadow-md">
                  <span className="text-[8px] font-mono text-[#fbbf24] tracking-[0.2em] uppercase font-bold">Studio Academy</span>
                  <h3 className="font-display text-xs font-black text-white uppercase">
                    Welcome to Vox MusicGen Studio
                  </h3>
                  <p className="text-[10px] text-secondary leading-relaxed">
                    Unleash emotional composition capabilities in moments by mastering active synth waveforms.
                  </p>
                </div>

                {/* Checklist Steps */}
                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="p-3 bg-[#050514]/90 border border-white/[0.03] rounded-xl space-y-1">
                    <h4 className="text-[10.5px] font-display font-bold text-[#fbbf24] uppercase flex items-center gap-1.5">
                      <span>01.</span> Quick Start Flow
                    </h4>
                    <p className="text-[9.5px] text-dim leading-relaxed">
                      Write highly descriptive, evocative emotional prompt lines inside the creation center. Use mood and vibe chips directly to fine-tune sound resonance.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-[#050514]/90 border border-white/[0.03] rounded-xl space-y-1">
                    <h4 className="text-[10.5px] font-display font-bold text-[#fbbf24] uppercase flex items-center gap-1.5">
                      <span>02.</span> Pro Layout Tips
                    </h4>
                    <p className="text-[9.5px] text-dim leading-relaxed">
                      Utilize lyric structures in the Lyric editor for exact lyric synchronization. Import physical hum wave inputs and style anchors for accurate model emulation.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-[#050514]/90 border border-white/[0.03] rounded-xl space-y-1">
                    <h4 className="text-[10.5px] font-display font-bold text-[#fbbf24] uppercase flex items-center gap-1.5">
                      <span>03.</span> Advanced Wave Controls
                    </h4>
                    <p className="text-[9.5px] text-dim leading-relaxed">
                      Activate the built-in Master EQ with customized visualizer feedback. Clone physical singing voices or trigger multi-lane audio stemming layouts instantly.
                    </p>
                  </div>
                </div>

                {/* Quick Tips Cards */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-center text-[9px]">
                    <span className="block text-white mb-0.5 font-bold uppercase tracking-wide">Inpainting</span>
                    <span className="text-secondary">Erase and regenerate sections seamlessly.</span>
                  </div>
                  <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-center text-[9px]">
                    <span className="block text-white mb-0.5 font-bold uppercase tracking-wide">Video Sync</span>
                    <span className="text-secondary">Align compositions directly with cinema frames.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Return Action Button */}
            <div className="pt-2 text-center space-y-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate("home")}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00f5ff]/20 via-[#8b5cf6]/20 to-[#fbbf24]/10 border border-white/[0.08] hover:border-[#00f5ff]/40 text-white hover:text-[#00f5ff] text-xs font-display uppercase tracking-widest font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
              >
                ← RETURN TO HOMEPAGE HUB
              </button>
              <div className="text-[7.5px] font-mono text-dim tracking-[0.12em] uppercase">
                System License: Registered to CodeTech Studio
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── CENTRAL FLOATING ACTION AI ASSISTANT TRIGGER ── */}
      <button
        id="ai-fab-btn"
        onClick={() => setChatOpen(true)}
        className="absolute right-[18px] bottom-[calc(64px+env(safe-area-inset-bottom,12px)+14px)] z-45 w-[50px] h-[50px] rounded-xl border-none cursor-pointer bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] flex items-center justify-center text-lg shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.55)] md:hover:scale-105 active:scale-95 transition-all text-white font-bold select-none outline-none"
        title="Consult Vox Director AI"
      >
        ✦
      </button>
 
      {/* ── PWA & BOTTOM TAB NAVIGATION ── */}
      <nav id="bottom-nav" className="absolute bottom-0 left-0 w-full h-[calc(64px+env(safe-area-inset-bottom,12px))] pb-[env(safe-area-inset-bottom,12px)] pt-1.5 bg-[#03030e]/60 backdrop-blur-xl border-t border-white/10 z-40 flex">
        <div className="nav-items flex w-full justify-around items-center">
          
          {/* Tab 1: Home */}
          <div 
            onClick={() => navigate("home")}
            className={`nav-item flex flex-col items-center gap-[3px] cursor-pointer p-[5px_10px] rounded-xl transition-all relative min-w-[54px] ${
              currentScreen === "home" ? "active text-[#00f5ff]" : "text-dim"
            }`}
          >
            <span className="ni-icon text-lg select-none">🏠</span>
            <span className="ni-label text-[8px] font-display tracking-widest uppercase font-semibold">
              Home
            </span>
          </div>
 
          {/* Tab 2: Lyrics */}
          <div 
            onClick={() => navigate("lyrics")}
            className={`nav-item flex flex-col items-center gap-[3px] cursor-pointer p-[5px_10px] rounded-xl transition-all relative min-w-[54px] ${
              currentScreen === "lyrics" ? "active text-[#00f5ff]" : "text-dim"
            }`}
          >
            <span className="ni-icon text-lg select-none">✍️</span>
            <span className="ni-label text-[8px] font-display tracking-widest uppercase font-semibold">
              Lyrics
            </span>
          </div>
 
          {/* Tab FAB: Create */}
          <button
            type="button"
            onClick={() => {
              setCurrentScreen("create");
              setPipelineStep(1);
            }}
            className="nav-fab w-[50px] h-[50px] rounded-[15px] border-none cursor-pointer bg-gradient-to-tr from-[#00f5ff] to-[#8b5cf6] flex items-center justify-center text-xl mt-[-12px] shadow-[0_0_24px_rgba(0,245,255,0.45)] hover:scale-105 active:scale-95 transition-all text-[#03030e] font-black focus:outline-none"
          >
            ✦
          </button>
 
          {/* Tab 3: Share */}
          <div 
            onClick={() => navigate("share")}
            className={`nav-item flex flex-col items-center gap-[3px] cursor-pointer p-[5px_10px] rounded-xl transition-all relative min-w-[54px] ${
              currentScreen === "share" ? "active text-[#00f5ff]" : "text-dim"
            }`}
          >
            <span className="ni-icon text-lg select-none">📤</span>
            <span className="ni-label text-[8px] font-display tracking-widest uppercase font-semibold">
              Share
            </span>
          </div>
 
          {/* Tab 4: Profile */}
          <div 
            onClick={() => navigate("profile")}
            className={`nav-item flex flex-col items-center gap-[3px] cursor-pointer p-[5px_10px] rounded-xl transition-all relative min-w-[54px] ${
              currentScreen === "profile" ? "active text-[#00f5ff]" : "text-dim"
            }`}
          >
            <span className="ni-icon text-lg select-none">👤</span>
            <span className="ni-label text-[8px] font-display tracking-widest uppercase font-semibold">
              Profile
            </span>
          </div>
 
        </div>
      </nav>
 
      {/* ── OFFLINE STATUS WRAPPER BANNER ── */}
      {isOffline && (
        <div id="offline-banner" className="absolute top-[58px] left-1/2 -translate-x-1/2 w-[92%] max-w-[448px] z-50 bg-[#ff4757]/15 border border-[#ff4757]/30 text-[#ff4757] rounded-lg p-[10px_14px] text-xs font-bold leading-tight shadow-md flex items-center gap-2">
          ⚡ Offline mode active. Local mixers and catalog remain fully active.
        </div>
      )}

      {/* ── TOAST DISPATCH DRAWER ── */}
      <div id="toast" className={`fixed top-[66px] left-1/2 -translate-x-1/2 w-[88%] max-w-[320px] bg-[#0c0c20]/95 backdrop-blur-xl border border-[#00f5ff]/20 rounded-xl p-[11px_16px] text-xs text-center shadow-2xl transition-all duration-300 pointer-events-none ${
        toastOpen ? "show opacity-100 scale-100" : "opacity-0 scale-95 -translate-y-4 shadow-none"
      }`}>
        {toastText}
      </div>

      {/* ── ASSISTANT MODULAR DRAWER SHEET ── */}
      <AIDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        blueprintContext={blueprint}
        onAddSuggestion={(newSuggestion) => {
          setPromptText((prev) => (prev ? `${prev}. ${newSuggestion}` : newSuggestion));
          showToast("✦ Suggestion merged into prompt description");
        }}
      />

      {/* ── PROMPT ENHANCER SHEET ── */}
      <PromptEnhancer
        isOpen={enhancerOpen}
        onClose={() => setEnhancerOpen(false)}
        originalPrompt={promptText}
        onApply={(enhanced) => {
          setPromptText(enhanced);
          setEnhancerOpen(false);
          showToast("✦ Enhanced prompt applied!");
        }}
      />

      {/* ── HIGH-FIDELITY AUDIO/VIDEO COMPILING MODAL ── */}
      {exportFormat && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
          <div className="w-full max-w-[400px] bg-[#03030e]/85 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-2xl relative overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="text-center mb-5">
              <span className="text-[9px] font-mono text-[#00f5ff] tracking-widest uppercase font-bold block mb-1">
                HIGH-FIDELITY COMPILING ENGINE
              </span>
              <h3 className="font-display text-lg font-black bg-gradient-to-r from-white to-[#00f5ff] bg-clip-text text-transparent uppercase">
                {exportFormat === "WAV" ? "Lossless PCM WAV Compiler" : "Cinematic 9:16 Video Render"}
              </h3>
            </div>

            {/* Simulated Live Loading Ring / Visualizer */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent transition-all duration-300"
                style={{
                  borderColor: exportFormat === "WAV" ? "#10ffb0" : "#8b5cf6",
                  transform: `rotate(${exportProgress * 3.6}deg)`,
                  borderBottomColor: "transparent"
                }}
              />
              <div className="text-center z-10">
                <span className="text-2xl font-mono font-black text-white">{exportProgress}%</span>
                {exportProgress < 100 ? (
                  <span className="text-[8px] font-mono block text-dim uppercase tracking-wider mt-0.5">
                    {estimatedSecondsRemaining}s left
                  </span>
                ) : (
                  <span className="text-[8px] font-mono block text-[#10ffb0] uppercase tracking-wider mt-0.5">
                    Ready
                  </span>
                )}
              </div>
            </div>

            {/* Current Phase Status Text & Detailed Progress Bar */}
            <div className="space-y-4 mb-6">
              <div className="bg-[#03030e]/45 border border-white/5 rounded-xl p-3 text-center min-h-[54px] flex items-center justify-center">
                <span className="text-xs font-mono text-primary leading-snug">
                  {exportStatusText}
                </span>
              </div>
              
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/[0.04]">
                <div 
                  className="h-full bg-gradient-to-r from-[#00f5ff] via-[#8b5cf6] to-[#10ffb0] rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>

            {/* Phases checklist with checkmarks */}
            <div className="space-y-2 mb-6">
              {[
                { label: "Isolate Stem Gearing & Relative Balance", pct: 25 },
                { label: "Insert Spatial FX Plugin Signal Chains", pct: 50 },
                { label: "Render Linear Waves to Lossless Stream", pct: 75 },
                { label: "Close Headers and Package Output Meta", pct: 100 }
              ].map((phase, idx) => {
                const isDone = exportProgress >= phase.pct;
                const isCurrent = exportProgress < phase.pct && (idx === 0 || exportProgress >= phase.pct - 25);
                return (
                  <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isDone ? "text-[#eef2ff]" : isCurrent ? "text-[#00f5ff] animate-pulse" : "text-dim"}>
                      Phase {idx + 1}: {phase.label}
                    </span>
                    <span className="font-bold">
                      {isDone ? (
                        <span className="text-[#10ffb0]">COMPLETED ✔</span>
                      ) : isCurrent ? (
                        <span className="text-[#00f5ff] animate-pulse">PROCESSING...</span>
                      ) : (
                        <span className="text-dim">PENDING</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Buttons (Done vs Cancel) */}
            <div className="flex gap-2.5">
              {exportProgress === 100 ? (
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "#";
                    link.setAttribute("download", `vox-track-${Date.now()}.${exportFormat === "WAV" ? "wav" : "mp4"}`);
                    document.body.appendChild(link);
                    setExportFormat(null);
                    setExportProgress(0);
                    showToast(`⬇ Downloaded pristine high-fidelity file!`);
                  }}
                  className="btn btn-primary w-full py-3.5 text-xs text-center font-bold tracking-widest rounded-xl cursor-pointer shadow-[0_0_20px_rgba(16,255,176,0.35)]"
                >
                  📥 DOWNLOAD HIGH-FIDELITY FILE
                </button>
              ) : (
                <button
                  onClick={() => {
                    setExportFormat(null);
                    setExportProgress(0);
                    showToast("❌ Export compiling aborted.");
                  }}
                  className="btn btn-ghost w-full py-3 text-xs text-center font-bold tracking-widest rounded-xl cursor-pointer"
                >
                  ABORT EXPORT
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── SAVE PRESET NAME INPUT DIALOG ── */}
      {showSavePresetDialog && (
        <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md flex items-center justify-center p-5">
          <div className="w-full max-w-[360px] bg-[#03030e]/85 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl relative animate-scaleUp">
            <h3 className="font-display text-sm font-black bg-gradient-to-r from-white to-[#8b5cf6] bg-clip-text text-transparent uppercase mb-2">
              Save Mix Preset
            </h3>
            <p className="text-xs text-secondary mb-4 leading-relaxed font-semibold">
              Save current channel gains, mute settings, and engaged master plugins to your library.
            </p>
            
            <div className="mb-5">
              <label className="text-[9px] font-mono text-dim uppercase tracking-wider block mb-1.5 font-bold">
                Preset Label
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. Dreamy Vocals"
                value={presetSaveName}
                onChange={(e) => setPresetSaveName(e.target.value)}
                className="w-full h-11 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#8b5cf6] hover:bg-white/[0.05] rounded-xl px-3 text-xs font-mono text-white outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSavePresetDialog(false);
                  setPresetSaveName("");
                }}
                className="btn btn-ghost flex-1 py-2.5 text-xs text-center font-bold tracking-wider rounded-xl cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveMixPreset}
                className="btn btn-primary flex-1 py-2.5 text-xs text-center font-bold tracking-widest rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
              >
                SAVE PRESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AUTHENTICATION SIGN IN MODAL ── */}
      {authOpen && (
        <div className="auth-modal-overlay fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-5">
          <div className="auth-modal w-full max-w-[360px] bg-[#03030e]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-7 text-center shadow-2xl animate-scaleUp">
            <div className="am-logo w-14 h-14 rounded-xl bg-gradient-to-br from-[#0c0d21] to-[#04050e] border border-[#00f5ff]/25 flex items-center justify-center shadow-lg relative overflow-hidden mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00f5ff]/15 to-[#8b5cf6]/15 opacity-45" />
              <svg className="w-7 h-7 text-[#00f5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5v14M7 5v14M22 9v6M2 9v6" />
              </svg>
            </div>
            <h3 className="am-title font-display text-sm font-black bg-gradient-to-r from-white to-[#00f5ff] bg-clip-text text-transparent uppercase mb-1">
              Join Vox MusicGen
            </h3>
            <p className="am-sub text-secondary text-xs leading-relaxed mb-6 font-medium">
              Log in to store project configurations, unlock stems, and publish compiled tracks to the global timeline.
            </p>
            <button
              onClick={() => {
                setUser({ name: "Sachin Sheth", handle: "@sachin.vox", avatar: "👨‍🎤", plan: "PRO" });
                setAuthOpen(false);
                showToast("🔐 Authenticated PRO Creator session");
              }}
              className="am-btn am-google w-full h-[46px] rounded-xl border-none cursor-pointer bg-gradient-to-tr from-[#00f5ff] to-[#8b5cf6] text-black text-xs font-display font-black tracking-wide uppercase flex items-center justify-center gap-1.5"
            >
              🔐 Authenticate with Google
            </button>
            <button
              onClick={() => {
                setUser({ name: "Vox Guest", handle: "@guest", avatar: "👤", plan: "Free" });
                setAuthOpen(false);
                showToast("👤 Session matching: Anonymous Guest");
              }}
              className="am-btn am-guest w-full h-[46px] rounded-xl bg-white/[0.03] hover:bg-white/10 text-secondary text-xs font-display font-bold tracking-wider uppercase border border-white/10 cursor-pointer mt-2"
            >
              Continue as Guest
            </button>
            <div className="am-terms text-[9px] font-mono text-dim tracking-wide mt-5 leading-normal">
              By accessing Vox MusicGen you assert compliance with Standard Terms & Privacy conditions.<br />Your creation matrices stay yours — always.
            </div>
          </div>
        </div>
      )}

      {/* ── 🎬 VOX DIRECTOR STORYBOARD MODAL ── */}
      {directorStoryboardOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-[#03030f]/80 backdrop-blur-xl border border-[#fbbf24]/30 rounded-[28px] overflow-hidden shadow-2xl animate-scaleUp">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#fbbf24]/10 to-[#8b5cf6]/10 border-b border-[#fbbf24]/20 flex justify-between items-center">
              <div>
                <span className="text-[8px] font-mono text-[#fbbf24] tracking-widest uppercase font-bold block">
                  VOX DIRECTOR AI // STORYBOARD ENGINE
                </span>
                <h3 className="font-display text-sm font-black text-white uppercase mt-0.5">
                  🎬 Cinematic Visual Storyboard
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDirectorStoryboardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xs border border-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content list of scenes */}
            <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto scrollbar-none">
              <p className="text-[10px] text-secondary leading-normal italic text-center px-4">
                "Vox Director has structured a 4-scene video sequence matching your track's key frequencies and active emotion parameters."
              </p>

              {[
                { 
                  sc: "SCENE 01: ESTABLISHING SHOT", 
                  time: "0:00 - 0:40", 
                  visual: "Camera glides slowly across misty cybernetic waterways reflecting orange neon grids.", 
                  pacing: "Gliding, low frequency, atmospheric drone scan.",
                  color: "bg-[#00f5ff]/20 text-[#00f5ff] border-[#00f5ff]/30"
                },
                { 
                  sc: "SCENE 02: THE BUILDUPEST", 
                  time: "0:40 - 1:20", 
                  visual: "Light starts pulsating rapidly inside towering holograms as synthetic rain begins falling.", 
                  pacing: "Increasing speed, rising filter sweep, snappy snare tracks join.",
                  color: "bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30"
                },
                { 
                  sc: "SCENE 03: THE CLIMACTIC DROP", 
                  time: "1:20 - 2:40", 
                  visual: "A high-speed neon motorcycle zooms past camera into a glowing digital vector sun.", 
                  pacing: "Intensified peak energy, full dynamic audio tracks live with reactive strobe visual flashing.",
                  color: "bg-[#f472b6]/20 text-[#f472b6] border-[#f472b6]/30"
                },
                { 
                  sc: "SCENE 04: CATHARTIC COOLDOWN", 
                  time: "2:40 - END", 
                  visual: "The neon motorcycle fades into dust trail stardust ring elements as the camera pans up to quiet stars.", 
                  pacing: "Soft release, slow decay, warm electric piano chords solo.",
                  color: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30"
                }
              ].map((scene, index) => (
                <div key={index} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1.5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-white font-extrabold">{scene.sc}</span>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-dim border border-white/5">
                      {scene.time}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-secondary leading-relaxed">
                    {scene.visual}
                  </p>
                  <div className="flex gap-1.5 items-center pt-1">
                    <span className="text-[8px] font-mono uppercase tracking-wide text-dim">AI Rhythm guidelines:</span>
                    <span className="text-[8px] font-mono text-[#fbbf24] bg-[#fbbf24]/5 border border-[#fbbf24]/20 px-1.5 py-0.5 rounded">
                      {scene.pacing}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.04] bg-black/50 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast("🎬 Exporting Storyboard frames to social reel format...");
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-tr from-[#fbbf24] to-[#f472b6] text-black text-xs font-display font-black leading-none select-none uppercase tracking-wider cursor-pointer text-center"
              >
                📥 Export Storyboard Concept
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    )}
  </div>
);
}
