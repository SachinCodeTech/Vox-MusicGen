// Professional Audio Export Utility & Scale Mathematics for Vox MusicGen

// ── 1. MUSICAL SCALE DATA & FREQUENCY ENGINE ──
export const MUSICAL_KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as const;
export type MusicalKey = typeof MUSICAL_KEYS[number];

export const SCALE_TYPES = [
  { id: "minor", label: "Natural Minor (Aeolian)", intervals: [0, 2, 3, 5, 7, 8, 10], vibe: "Dark & Emotional" },
  { id: "major", label: "Major (Ionian)", intervals: [0, 2, 4, 5, 7, 9, 11], vibe: "Uplifting & Radiant" },
  { id: "dorian", label: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10], vibe: "Deep House & Chillwave" },
  { id: "phrygian", label: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10], vibe: "Trap & Cyberpunk Drill" },
  { id: "harmonic_minor", label: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11], vibe: "Cinematic & Tension" },
  { id: "pentatonic_minor", label: "Minor Pentatonic", intervals: [0, 3, 5, 7, 10], vibe: "Lo-Fi & Soul" },
  { id: "japanese", label: "In-Sen (Japanese)", intervals: [0, 1, 5, 7, 10], vibe: "Anime & Ambient" },
] as const;

export type ScaleTypeId = typeof SCALE_TYPES[number]["id"];

// Semitone offset from C (MIDI note 60 = C4 = 261.63 Hz)
const KEY_OFFSETS: Record<MusicalKey, number> = {
  "C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, 
  "F#": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11
};

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Generates chords and frequencies for any selected Key and Scale
export function getScaleChords(rootKey: MusicalKey, scaleId: ScaleTypeId, octave = 3): number[][] {
  const rootOffset = KEY_OFFSETS[rootKey];
  const scale = SCALE_TYPES.find(s => s.id === scaleId) || SCALE_TYPES[0];
  const intervals = scale.intervals;
  
  const baseMidi = 12 * (octave + 1) + rootOffset; // e.g. C3 = 48
  
  // Build standard 4 diatonic progression chords (i, VI, III, VII or similar)
  const degrees = [0, Math.min(5, intervals.length - 1), Math.min(2, intervals.length - 1), Math.min(6, intervals.length - 1)];
  
  return degrees.map(deg => {
    const rootNote = baseMidi + intervals[deg % intervals.length];
    const thirdNote = baseMidi + intervals[(deg + 2) % intervals.length] + ((deg + 2 >= intervals.length) ? 12 : 0);
    const fifthNote = baseMidi + intervals[(deg + 4) % intervals.length] + ((deg + 4 >= intervals.length) ? 12 : 0);
    return [midiToFreq(rootNote), midiToFreq(thirdNote), midiToFreq(fifthNote)];
  });
}

// ── 2. REAL OFFLINE AUDIO CONTEXT WAV SYNTHESIZER ──
// Renders real audio stems and master tracks into an uncompressed 16-bit 44.1kHz WAV

export interface RenderStemOptions {
  bpm: number;
  durationSeconds: number;
  rootKey: MusicalKey;
  scaleId: ScaleTypeId;
  volumes: {
    drums: number;
    synth: number;
    melody: number;
    vocal: number;
    ambient: number;
  };
  mutes: {
    drums: boolean;
    synth: boolean;
    melody: boolean;
    vocal: boolean;
    ambient: boolean;
  };
  targetStem?: "all" | "drums" | "synth" | "melody" | "vocal" | "ambient";
}

export async function renderWavAudio(options: RenderStemOptions, onProgress?: (pct: number) => void): Promise<Blob> {
  const sampleRate = 44100;
  const duration = Math.max(8, options.durationSeconds || 16);
  const totalFrames = Math.floor(sampleRate * duration);

  const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  if (!OfflineCtxClass) {
    throw new Error("OfflineAudioContext is not supported on this browser.");
  }

  const actx = new OfflineCtxClass(2, totalFrames, sampleRate);
  const bpm = options.bpm || 120;
  const stepTime = 60 / bpm / 2; // 8th note steps
  const totalSteps = Math.floor(duration / stepTime);

  const chords = getScaleChords(options.rootKey, options.scaleId);

  // Master bus with soft limiter
  const masterGain = actx.createGain();
  masterGain.gain.setValueAtTime(0.85, 0);

  const compressor = actx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-1.0, 0);
  compressor.knee.setValueAtTime(0, 0);
  compressor.ratio.setValueAtTime(20, 0);
  compressor.attack.setValueAtTime(0.003, 0);
  compressor.release.setValueAtTime(0.1, 0);

  masterGain.connect(compressor);
  compressor.connect(actx.destination);

  // Determine which channels are active
  const target = options.targetStem || "all";
  const playDrums = (target === "all" || target === "drums") && !options.mutes.drums;
  const playSynth = (target === "all" || target === "synth") && !options.mutes.synth;
  const playMelody = (target === "all" || target === "melody") && !options.mutes.melody;
  const playVocal = (target === "all" || target === "vocal") && !options.mutes.vocal;
  const playAmbient = (target === "all" || target === "ambient") && !options.mutes.ambient;

  const drumsVol = (options.volumes.drums / 100) * 0.9;
  const synthVol = (options.volumes.synth / 100) * 0.8;
  const melodyVol = (options.volumes.melody / 100) * 0.85;
  const vocalVol = (options.volumes.vocal / 100) * 0.8;
  const ambientVol = (options.volumes.ambient / 100) * 0.7;

  // Synthesize events across timeline
  for (let step = 0; step < totalSteps; step++) {
    const t = step * stepTime;
    if (t >= duration - 0.2) break;

    // 1. DRUMS
    if (playDrums) {
      if (step % 8 === 0) {
        // Kick
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
        gain.gain.setValueAtTime(drumsVol * 0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.3);
      }
      if (step % 8 === 4) {
        // Snare
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(masterGain);
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(drumsVol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.16);
      }
      if (step % 2 === 0) {
        // Hihat
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "highpass" as any;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.frequency.setValueAtTime(8000, t);
        gain.gain.setValueAtTime(drumsVol * 0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.05);
      }
    }

    // 2. SYNTH BASS CHORDS
    if (playSynth && step % 8 === 0) {
      const chordIndex = Math.floor(step / 8) % chords.length;
      const currentChord = chords[chordIndex];
      currentChord.forEach(freq => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sawtooth";
        osc.connect(gain);
        gain.connect(masterGain);
        osc.frequency.setValueAtTime(freq / 2, t);
        gain.gain.setValueAtTime(synthVol * 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (stepTime * 7));
        osc.start(t);
        osc.stop(t + (stepTime * 7.5));
      });
    }

    // 3. MELODY PLUCKS
    if (playMelody && (step % 4 === 1 || step % 4 === 3)) {
      const chordIndex = Math.floor(step / 8) % chords.length;
      const chord = chords[chordIndex];
      const freq = chord[step % chord.length];

      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(melodyVol * 0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.4);
    }

    // 4. VOCAL FORMANT HUM
    if (playVocal && step % 8 === 2) {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(masterGain);
      const chordIndex = Math.floor(step / 8) % chords.length;
      osc.frequency.setValueAtTime(chords[chordIndex][0] * 1.5, t);
      gain.gain.setValueAtTime(vocalVol * 0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.55);
    }

    // 5. AMBIENT SWELL
    if (playAmbient && step % 16 === 0) {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.setValueAtTime(110, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(ambientVol * 0.15, t + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (stepTime * 15));
      osc.start(t);
      osc.stop(t + (stepTime * 15.5));
    }
  }

  if (onProgress) onProgress(30);

  // Render buffer
  const renderedBuffer = await actx.startRendering();
  if (onProgress) onProgress(80);

  // Encode to 16-bit PCM WAV
  const wavBlob = audioBufferToWav(renderedBuffer);
  if (onProgress) onProgress(100);

  return wavBlob;
}

// ── 3. WAV ENCODER HELPER ──
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;
  const numSamples = buffer.length;

  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Write RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // Write fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true); // AudioFormat PCM = 1
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // Write data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave and scale 16-bit samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    let sL = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;

    // Right channel
    if (numChannels > 1) {
      let sR = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// ── 4. STANDARD MIDI EXPORT ENGINE ──
export function generateMidiFile(bpm: number, chords: number[][]): Blob {
  // Minimal valid Standard MIDI File Type 0
  const header = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // Chunk length 6
    0x00, 0x00,             // Format 0 (single track)
    0x00, 0x01,             // 1 track
    0x01, 0xe0              // 480 ticks per quarter note
  ];

  const trackEvents: number[] = [];

  // Tempo event (Meta event 0x51 0x03)
  const microsecondsPerBeat = Math.round(60000000 / (bpm || 120));
  trackEvents.push(
    0x00, 0xff, 0x51, 0x03,
    (microsecondsPerBeat >> 16) & 0xff,
    (microsecondsPerBeat >> 8) & 0xff,
    microsecondsPerBeat & 0xff
  );

  // Write chords as MIDI Note On / Note Off events
  const ticksPerChord = 480 * 2; // Half note per chord
  chords.forEach((chord) => {
    // Note On events
    chord.forEach((freq, idx) => {
      // freq to nearest midi note
      const midiNote = Math.round(69 + 12 * Math.log2(freq / 440));
      trackEvents.push(idx === 0 ? 0x00 : 0x00, 0x90, midiNote, 0x5a);
    });

    // Note Off after ticksPerChord
    chord.forEach((freq, idx) => {
      const midiNote = Math.round(69 + 12 * Math.log2(freq / 440));
      if (idx === 0) {
        // Variable-length delta time for 960 ticks: 0x87, 0x40
        trackEvents.push(0x87, 0x40, 0x80, midiNote, 0x00);
      } else {
        trackEvents.push(0x00, 0x80, midiNote, 0x00);
      }
    });
  });

  // End of Track event (0x00 0xff 0x2f 0x00)
  trackEvents.push(0x00, 0xff, 0x2f, 0x00);

  // Track chunk header
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackEvents.length >> 24) & 0xff,
    (trackEvents.length >> 16) & 0xff,
    (trackEvents.length >> 8) & 0xff,
    trackEvents.length & 0xff
  ];

  const totalBytes = new Uint8Array([...header, ...trackHeader, ...trackEvents]);
  return new Blob([totalBytes], { type: "audio/midi" });
}

// ── 5. BROWSER DOWNLOAD TRIGGER ──
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}
