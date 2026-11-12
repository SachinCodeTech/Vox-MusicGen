# Vox MusicGen Studio

> **AI-powered Music & Cinematic Video Concept Studio** with real-time reactive visuals, multitrack stem isolation, harmonic scale engine, and AI Lyric Engine.

Developed by **CodeTech App Store**  
Contact: [codetech.appstore@gmail.com](mailto:codetech.appstore@gmail.com)

---

## ⚡ Features

- **AI Track Director:** Generates production-ready blueprints, song structures, lyric hooks, instrumentations, and cinematic video concepts powered by Google Gemini.
- **Master Precision Console:**
  - **Tap Tempo Engine:** Interactive BPM calculator with audio metronome click feedback and instant session synchronization.
  - **Harmonic Scale Quantizer:** Chromatic key root selection (C through B) and 7 musical modes (Natural Minor, Major, Dorian, Phrygian, Harmonic Minor, Pentatonic, In-Sen) with interactive chord triad audition previews.
  - **Master VU Meter & Soft Limiter:** 12-segment dual-channel LED peak meter with soft clipping protection.
  - **True Multitrack WAV & MIDI Export:** Browser-native rendering via Web Audio `OfflineAudioContext` for Master Mix, individual stem tracks (Drums, Bass/Synth, Melody, Vocal FX), and Standard MIDI (`.mid`) files.
- **AI Lyric Studio Engine:** Rhyme and verse generation across Full, Verse, Chorus, Bridge, and Hook modes.
- **Live Beat Laboratory:** Step sequencer drum grid with real-time audio playback.
- **PWA & App Store Ready:** Compliant with Google Play Store, Microsoft Store, and Apple App Store packaging via PWABuilder (manifest v3, mobile/desktop screenshots, offline background sync, push notification hooks).
- **DAW Keyboard Shortcuts:** Hotkeys for fast studio workflow (`Space`, `T`, `R`, `M`, `S`, `C`, `Esc`, `?`).

---

## 🚀 Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Launch
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set your Gemini API key:
   Create a `.env` file or export the environment variable:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. Build for Production:
   ```bash
   npm run build
   npm start
   ```

---

## 📱 Progressive Web App (PWA) Installation
Vox MusicGen can be installed as a standalone desktop or mobile application:
- **Chrome / Edge / Android:** Tap the **Install App** button in the header or browser navigation bar.
- **iOS Safari:** Tap **Share** → **Add to Home Screen**.

---

## 📄 License & Credits
- **Company:** CodeTech App Store
- **Lead Developer:** Sachin Sheth
- **Contact:** [codetech.appstore@gmail.com](mailto:codetech.appstore@gmail.com)
