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

  const navigate = (screen: "home" | "create" | "lyrics" | "share" | "profile" | "about" | "app-info" | "privacy") => {
    setCurrentScreen(screen);
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
      { prg: 32, text: "Aligning deep signal filters with CodeTech servers..." },
      { prg: 50, text: "Confirming Lead Developer: Sachin Sheth node auth..." },
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

  // Toast dispatch helper
  const showToast = (msg: string) => {
    setToastText(msg);
    setToastOpen(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastOpen(false);
    }, 2800);
  };

  // Playback timer ticker
  useEffect(() => {
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
  }, [isPlaying]);

  const togglePlayback = () => {
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
          className="relative z-10 w-full max-w-[480px] min-h-screen md:min-h-[860px] md:max-h-[900px] md:rounded-[36px] md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.92)] flex flex-col justify-between p-8 bg-[#00000a] text-[#eef2ff] overflow-hidden"
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
          className={`relative z-10 w-full max-w-[480px] min-h-screen md:min-h-[860px] md:max-h-[900px] md:rounded-[36px] md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.92)] flex flex-col text-[#eef2ff] transition-all duration-700 overflow-hidden ${
            aiDimensionMode 
              ? "bg-[#010115] shadow-[0_0_80px_rgba(0,245,255,0.22)] border-x border-[#00f5ff]/15 md:border-[#00f5ff]/30" 
              : "bg-[#00000a]"
          }`}
        >
      
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
      <header id="topbar" className="relative sticky top-0 z-50 h-[58px] flex items-center justify-between px-[18px] bg-[#03030e]/95 backdrop-blur-md border-b border-white/[0.04]">
        <div className="logo flex items-center gap-[9px]">
          <div className="logo-mark animated-logo w-[32px] h-[32px] rounded-xl bg-gradient-to-br from-[#0c0d21] to-[#04050e] border border-[#00f5ff]/25 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00f5ff]/10 to-[#8b5cf6]/10 opacity-30" />
            <svg className="w-5 h-5 text-[#00f5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v20M17 5v14M7 5v14M22 9v6M2 9v6" />
            </svg>
          </div>
          <div className="logo-name font-display text-[13px] font-black tracking-[0.16em] bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6] bg-clip-text text-transparent select-none uppercase">
            Vox MusicGen
          </div>
        </div>

        <div className="topbar-right flex items-center gap-[6px]">
          {/* AI Dimension mode activate trigger inside header */}
          <button
            type="button"
            onClick={() => {
              setAiDimensionMode(!aiDimensionMode);
              showToast(aiDimensionMode ? "🌌 Dimension de-activated" : "🌌 AI DIMENSION ACTIVE - Dynamic Interface Shifted!");
            }}
            className={`flex items-center gap-1 p-[4px_10px] rounded-xl border text-[9px] font-display uppercase font-black transition-all cursor-pointer ${
              aiDimensionMode
                ? "bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,0.45)]"
                : "bg-white/[0.02] border-white/10 text-dim hover:text-[#eef2ff]"
            }`}
            title="🌌 AI DIMENSION MODE - Interface reacts"
          >
            🌌 <span className="hidden xs:inline">DIMENSION</span>
          </button>

          <div 
            onClick={() => showToast("💫 AI Credits represent standard creation quota.")}
            className="credits-badge flex items-center gap-1.5 p-[5px_10px] rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[11px] font-mono font-medium text-[#fbbf24] cursor-pointer"
          >
            ✦ <span>{credits}</span>
          </div>

          <button 
            type="button"
            onClick={() => navigate("app-info")}
            className={`tb-btn w-9 h-9 rounded-xl flex items-center justify-center text-xs border transition-all cursor-pointer ${
              currentScreen === "app-info" || currentScreen === "about" || currentScreen === "privacy"
                ? "border-[#00f5ff]/40 bg-[#00f5ff]/15 text-[#00f5ff] shadow-[0_0_10px_rgba(0,245,255,0.25)] font-bold" 
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-dim"
            }`}
            title="About & Privacy Statement"
          >
            ℹ️
          </button>

          <button 
            type="button"
            onClick={() => (user ? navigate("profile") : setAuthOpen(true))}
            className={`tb-btn w-9 h-9 rounded-xl flex items-center justify-center text-[15px] border cursor-pointer border-[#8b5cf6]/40 bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 transition-all text-[#eef2ff] max-h-9 ${
              user ? "bg-gradient-to-tr from-[#00f5ff]/20 to-[#8b5cf6]/15 border-[#00f5ff]/40" : ""
            }`}
          >
            {user ? user.avatar : "👤"}
          </button>
        </div>
      </header>

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
                  3 layers · 48 bands
                </span>
              </div>
              <HeroWaveform />
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

                {/* Multitrack Mixer Lanes Component */}
                <div className="space-y-2">
                  <div className="section-hd flex justify-between items-center px-[18px]">
                    <span className="section-label">Stem isolator channels</span>
                    <span 
                      onClick={() => showToast("➕ Adding track stem — Phase 2")} 
                      className="section-action text-[9px] font-mono text-[#00f5ff] font-bold cursor-pointer"
                    >
                      + ADD STEM
                    </span>
                  </div>
                  <LaneWaveforms playProgress={playProgress} />
                </div>

                {/* Spatial plugin options */}
                <div className="space-y-2">
                  <div className="section-hd px-[18px]">
                    <span className="section-label">Spatial & mixing Plugins</span>
                  </div>
                  <div className="fx-row flex gap-2 overflow-x-auto px-[18px] pb-1 scrollbar-none pr-[18px]">
                    {["🎚 Reverb", "🎛 Pro-EQ", "🗜 Compressor", "✨ AI Mastering", "🎵 Harmony +2", "🔊 Spatial 3D", "🌀 Chorus FX"].map((fx) => (
                      <div
                        key={fx}
                        onClick={() => showToast(`⚡ Applied plugin: ${fx}`)}
                        className="fx-btn flex-shrink-0 p-2 px-3.5 bg-white/[0.03] hover:bg-[#00f5ff]/10 border border-white/5 text-[9.5px] font-display uppercase font-bold tracking-wider rounded-lg border-white/5 cursor-pointer whitespace-nowrap active:scale-95 transition-all text-dim hover:text-[#eef2ff]"
                      >
                        {fx}
                      </div>
                    ))}
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
                        onClick={() => showToast("🎵 Compiling high-bitrate MP3...")} 
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
                        onClick={() => showToast("🎼 Processing Waveform rendering...")} 
                        className="ep-item p-[11px_14px] bg-white/[0.02] hover:bg-[#00f5ff]/5 border border-white/[0.04] hover:border-[#00f5ff]/20 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="ep-item-left flex items-center gap-3">
                          <span className="text-[20px] select-none">🎼</span>
                          <div>
                            <div className="ep-format text-xs text-primary font-display font-medium font-bold leading-normal">WAV UNCOMPRESSED</div>
                            <div className="ep-desc text-[9.5px] font-mono text-dim tracking-wide mt-0.5">PCM Lossless raw audio · 44.1kHz</div>
                          </div>
                        </div>
                        <div className="ep-size text-[10px] font-mono text-dim font-semibold">~41.5 MB</div>
                      </div>
                      <div 
                        onClick={() => {
                          showToast("🎬 Launching Video compiling module...");
                          setCurrentScreen("share");
                        }} 
                        className="ep-item p-[11px_14px] bg-white/[0.02] hover:bg-[#00f5ff]/5 border border-white/[0.04] hover:border-[#00f5ff]/20 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="ep-item-left flex items-center gap-3">
                          <span className="text-[20px] select-none">🎬</span>
                          <div>
                            <div className="ep-format text-xs text-primary font-display font-medium font-bold leading-normal">🎬 SOCIAL VERTICAL REEL</div>
                            <div className="ep-desc text-[9.5px] font-mono text-dim tracking-wide mt-0.5">Aspect ratio 9:16 Video · TikTok ready</div>
                          </div>
                        </div>
                        <div className="ep-size text-[10px] font-mono text-dim font-semibold">~24.8 MB</div>
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
                      <div className="ls-body p-4 text-xs font-mono text-secondary leading-[1.85] whitespace-pre-line select-text">
                        {sect.lyrics}
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

        {/* ================== APP INFO SCREEN (v1.0.0) ================== */}
        {currentScreen === "app-info" && (
          <div className="screen-animation space-y-3.5 px-[18px] pt-[20px]">
            <div className="about-hero text-center space-y-1 mb-4 animate-scaleUp">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f5ff] to-[#8b5cf6] flex items-center justify-center text-lg select-none font-bold shadow-lg shadow-[#00f5ff]/10">
                📱
              </div>
              <h2 className="font-display text-lg font-black bg-gradient-to-r from-white via-secondary to-[#00f5ff] bg-clip-text text-transparent uppercase tracking-wider">
                System Diagnostics
              </h2>
              <p className="text-[9px] font-mono text-[#00f5ff] tracking-widest uppercase font-bold">
                VOX MUSICGEN OS v1.0.0
              </p>
            </div>

            {/* Shared Subsection Sub-Navigation */}
            <div className="flex bg-black/[0.6] border border-white/5 p-1 rounded-xl gap-1 mb-2.5 select-none shrink-0">
              <button
                type="button"
                onClick={() => navigate("app-info")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer bg-[#00f5ff]/15 border border-[#00f5ff]/35 text-[#00f5ff] shadow-[0_0_8px_rgba(0,245,255,0.25)]"
              >
                Specs
              </button>
              <button
                type="button"
                onClick={() => navigate("about")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer border border-transparent text-dim hover:text-white"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => navigate("privacy")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer border border-transparent text-dim hover:text-white"
              >
                Privacy
              </button>
            </div>

            {/* Core Application Details Block */}
            <div className="p-4 bg-[#050514]/90 border border-white/[0.04] rounded-[20px] space-y-3.5 shadow-xl relative overflow-hidden">
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
                <span className="text-[10px] font-mono text-[#fbbf24] font-semibold">WebAudio v2 + Matrix EQ</span>
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

            {/* Inline Action Buttons - Compact Futuristic Designs */}
            <div className="pt-2 text-center space-y-2.5">
              <button
                type="button"
                onClick={() => navigate("home")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00f5ff]/20 to-[#8b5cf6]/20 border border-[#00f5ff]/35 text-[#00f5ff] hover:text-white hover:bg-gradient-to-r hover:from-[#00f5ff]/30 hover:to-[#8b5cf6]/30 text-xs font-display uppercase tracking-wider transition-all cursor-pointer font-bold leading-none shadow-[0_0_12px_rgba(0,245,255,0.15)]"
              >
                ← RETURN TO HOMEPAGE
              </button>
              <div className="text-[7.5px] font-mono text-dim tracking-wider uppercase">
                System License: Registered to CodeTech Studio
              </div>
            </div>
          </div>
        )}

        {/* ================== ABOUT VOX MUSICGEN SCREEN ================== */}
        {currentScreen === "about" && (
          <div className="screen-animation space-y-3.5 px-[18px] pt-[20px]">
            <div className="about-hero text-center space-y-1 mb-4 animate-scaleUp">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#00f5ff] flex items-center justify-center text-lg select-none font-bold shadow-lg shadow-[#8b5cf6]/10">
                🏢
              </div>
              <h2 className="font-display text-lg font-black bg-gradient-to-r from-white via-secondary to-[#8b5cf6] bg-clip-text text-transparent uppercase tracking-wider">
                Enterprise Info
              </h2>
              <p className="text-[9px] font-mono text-[#8b5cf6] tracking-widest uppercase font-bold">
                BUILD CREDENTIALS · CREATIVE SUITE
              </p>
            </div>

            {/* Shared Subsection Sub-Navigation */}
            <div className="flex bg-black/[0.6] border border-white/5 p-1 rounded-xl gap-1 mb-2.5 select-none shrink-0">
              <button
                type="button"
                onClick={() => navigate("app-info")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer border border-transparent text-dim hover:text-white"
              >
                Specs
              </button>
              <button
                type="button"
                onClick={() => navigate("about")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer bg-[#8b5cf6]/15 border border-[#8b5cf6]/35 text-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.25)]"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => navigate("privacy")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer border border-transparent text-dim hover:text-white"
              >
                Privacy
              </button>
            </div>

            {/* Core Development Leadership Details */}
            <div className="p-4 bg-[#050514]/90 border border-white/[0.04] rounded-[20px] space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8b5cf6]/25 to-transparent" />
              
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Publisher Group:</span>
                <span className="text-xs font-bold text-[#10ffb0] uppercase tracking-wider font-display">CodeTech</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Lead Developer:</span>
                <span className="text-xs font-extrabold text-[#fbbf24] font-display uppercase tracking-widest font-black">Sachin Sheth</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-mono text-dim tracking-wider uppercase">Tech Architecture:</span>
                <span className="text-[10px] text-[#eef2ff] font-mono">React 18 + Pure TypeScript</span>
              </div>
            </div>

            {/* Vox MusicGen Narrative and Mission Statement */}
            <div className="p-4.5 bg-[#03030e]/50 border border-[#8b5cf6]/15 rounded-[20px] space-y-2.5 shadow-sm">
              <h3 className="text-[10.5px] font-display text-[#8b5cf6] font-black tracking-wider uppercase flex items-center gap-1.5">
                ✦ The Narrative of Vox MusicGen
              </h3>
              <p className="text-[10.5px] text-[#b4c3ff]/80 leading-relaxed">
                <strong>Vox MusicGen</strong> is a next-generation sandbox workspace designed strictly to liberate songwriter ideas and film soundtrack directors. By turning natural, simple emotional prompts into responsive pitch, chord, and wave structures, creators can construct perfect demo mixes.
              </p>
              <p className="text-[10px] text-[#b4c3ff]/60 leading-relaxed">
                Under <strong>Sachin Sheth's</strong> leadership at <strong>CodeTech</strong>, we avoid low-quality pre-rendered stems in favor of active, client-side synth oscillators. This permits offline, high-speed synthesis without backend latency or privacy hazards.
              </p>
            </div>

            {/* Compact Back Button */}
            <div className="pt-2 text-center space-y-2.5">
              <button
                type="button"
                onClick={() => navigate("home")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6]/20 to-[#00f5ff]/20 border border-[#8b5cf6]/35 text-[#8b5cf6] hover:text-white hover:bg-gradient-to-r hover:from-[#8b5cf6]/30 hover:to-[#00f5ff]/30 text-xs font-display uppercase tracking-wider transition-all cursor-pointer font-bold leading-none shadow-[0_0_12px_rgba(139,92,246,0.15)]"
              >
                ← RETURN TO HOMEPAGE
              </button>
            </div>
          </div>
        )}

        {/* ================== PRIVACY POLICY SCREEN ================== */}
        {currentScreen === "privacy" && (
          <div className="screen-animation space-y-3.5 px-[18px] pt-[20px]">
            <div className="about-hero text-center space-y-1 mb-4 animate-scaleUp">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10ffb0] to-[#00f5ff] flex items-center justify-center text-lg select-none font-bold shadow-lg shadow-[#10ffb0]/10">
                🛡️
              </div>
              <h2 className="font-display text-lg font-black bg-gradient-to-r from-white via-secondary to-[#10ffb0] bg-clip-text text-transparent uppercase tracking-wider">
                Privacy Policy
              </h2>
              <p className="text-[9px] font-mono text-[#10ffb0] tracking-widest uppercase font-bold">
                CREATOR ISOLATION PROTOCOLS
              </p>
            </div>

            {/* Shared Subsection Sub-Navigation */}
            <div className="flex bg-black/[0.6] border border-white/5 p-1 rounded-xl gap-1 mb-2.5 select-none shrink-0">
              <button
                type="button"
                onClick={() => navigate("app-info")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer border border-transparent text-dim hover:text-white"
              >
                Specs
              </button>
              <button
                type="button"
                onClick={() => navigate("about")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer border border-transparent text-dim hover:text-white"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => navigate("privacy")}
                className="flex-1 py-1.5 text-center text-[10px] font-display font-black tracking-wider rounded-lg transition-all uppercase cursor-pointer bg-[#10ffb0]/15 border border-[#10ffb0]/35 text-[#10ffb0] shadow-[0_0_8px_rgba(16,255,176,0.25)]"
              >
                Privacy
              </button>
            </div>

            {/* Privacy Commitments Narrative Card */}
            <div className="p-4.5 bg-[#050514]/90 border border-white/[0.04] rounded-[20px] space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#10ffb0]/25 to-transparent" />
              
              <div className="flex items-center gap-2 text-white border-b border-white/[0.03] pb-2">
                <span className="text-xs">🛡️</span>
                <h3 className="font-display text-[10px] font-black tracking-widest uppercase text-white">
                  CODETECH DATA SECURITY STATUTES
                </h3>
              </div>

              <div className="space-y-3 pr-1 text-[10px] text-secondary leading-relaxed">
                <p>
                  At <strong>CodeTech</strong>, user privacy and property protection represent our core engineering tenets.
                </p>
                
                <div className="space-y-2.5 font-mono text-[9px] text-[#b4c3ff]/90">
                  <div className="flex gap-2 items-start bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                    <span className="text-[#10ffb0] font-bold">✔</span>
                    <p>
                      <strong>Zero Audio Tracking:</strong> Core user hums and physical microphone input notes are computed locally. Absolutely no recording metadata files are uploaded or cataloged.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 items-start bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                    <span className="text-[#10ffb0] font-bold">✔</span>
                    <p>
                      <strong>Perfect IP Protection:</strong> Everything you construct or compile remains entirely your property. You maintain 100% royalty-free ownership.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                    <span className="text-[#10ffb0] font-bold">✔</span>
                    <p>
                      <strong>Offline Isolation Storage:</strong> Lightweight indices are maintained strictly via your browser's persistent key-value local state variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Back Button */}
            <div className="pt-2 text-center space-y-2.5">
              <button
                type="button"
                onClick={() => navigate("home")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10ffb0]/20 to-[#00f5ff]/20 border border-[#10ffb0]/35 text-[#10ffb0] hover:text-white hover:bg-gradient-to-r hover:from-[#10ffb0]/30 hover:to-[#00f5ff]/30 text-xs font-display uppercase tracking-wider transition-all cursor-pointer font-bold leading-none shadow-[0_0_12px_rgba(16,255,176,0.15)]"
              >
                ← RETURN TO HOMEPAGE
              </button>
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
      <nav id="bottom-nav" className="absolute bottom-0 left-0 w-full h-[calc(64px+env(safe-area-inset-bottom,12px))] pb-[env(safe-area-inset-bottom,12px)] pt-1.5 bg-[#03030e]/94 backdrop-blur-lg border-t border-white/[0.04] z-40 flex">
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

      {/* ── AUTHENTICATION SIGN IN MODAL ── */}
      {authOpen && (
        <div className="auth-modal-overlay fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-5">
          <div className="auth-modal w-full max-w-[360px] bg-[#03030e] border border-white/5 rounded-[24px] p-7 text-center shadow-2xl animate-scaleUp">
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
          <div className="w-full max-w-[420px] bg-[#03030f] border border-[#fbbf24]/30 rounded-[28px] overflow-hidden shadow-2xl animate-scaleUp">
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
