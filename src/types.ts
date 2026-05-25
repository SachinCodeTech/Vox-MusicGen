export interface TrackBlueprint {
  title: string;
  genre: string;
  subgenre: string;
  bpm: number;
  key: string;
  duration: string;
  concept: string;
  hook: string;
  structure: string[];
  keyInstruments: string[];
  productionTips: string;
  videoVibe: string;
  captions: string[];
  viralScore: number;
}

export interface Project {
  id: string;
  blueprint: TrackBlueprint;
  savedAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface LyricSection {
  label: string;
  lyrics: string;
}
