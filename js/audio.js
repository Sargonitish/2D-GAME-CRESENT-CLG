/**
 * OPERATION: STEAL THE ACORN - Audio Engine
 * Pure Web Audio API Synthesizer (Zero external dependencies).
 * Generates dynamic multi-track OST and punchy combat/adventure sound effects.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    const saved = window.storageManager ? window.storageManager.getSettings() : { musicVolume: 0.6, sfxVolume: 0.8, muted: false };
    this.musicVolume = saved.musicVolume ?? 0.6;
    this.sfxVolume = saved.sfxVolume ?? 0.8;
    this.muted = saved.muted ?? false;

    this.currentTrack = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateVolumes();
      this.initialized = true;

      // Unlock autoplay restriction on first user touch/key/click
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
    } catch (e) {
      console.warn("Web Audio initialization skipped:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  updateVolumes() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, now);
    this.musicGain.gain.setValueAtTime(this.musicVolume, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
    if (window.storageManager) window.storageManager.saveSettings({ musicVolume: this.musicVolume });
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
    if (window.storageManager) window.storageManager.saveSettings({ sfxVolume: this.sfxVolume });
  }

  toggleMute() {
    this.muted = !this.muted;
    this.updateVolumes();
    if (window.storageManager) window.storageManager.saveSettings({ muted: this.muted });
    return this.muted;
  }

  // ==========================================
  // PROCEDURAL SOUND EFFECTS (SFX)
  // ==========================================

  playButtonHover() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.04);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playButtonClick() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.07);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playCharacterSelect() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const start = t + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  playFootstep(surface = 'snow') {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;

    if (surface === 'ice') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.09);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
    } else {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  playJump() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.16);
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  playLand() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  playAttackSlash() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // Fast blade whoosh with crisp metal hiss
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playAcornDash() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // Jet dash whoosh with sparkle resonance
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  playGroundSlam() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // Massive low-frequency earthquake slam
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  playIceFury() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // Rapid triple claw strike
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200 - i * 150, t + delay);
      osc.frequency.exponentialRampToValueAtTime(350, t + delay + 0.06);
      gain.gain.setValueAtTime(0.28, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.07);
    }
  }

  playEnemyHit() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.1);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  playEnemyDefeat() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // Cartoon defeat pop / puff
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.14);
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playBossRoar() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.4);
    osc.frequency.linearRampToValueAtTime(60, t + 0.9);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(650, t + 0.4);
    filter.frequency.linearRampToValueAtTime(200, t + 0.9);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  playAcornCollect() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [659.25, 880, 1046.5].forEach((freq, idx) => {
      const start = t + idx * 0.035;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.24, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.19);
    });
  }

  playVictory() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, d: 0.12, w: 0 },
      { f: 659.25, d: 0.12, w: 0.14 },
      { f: 783.99, d: 0.12, w: 0.28 },
      { f: 1046.50, d: 0.7, w: 0.42 }
    ];
    fanfare.forEach(n => {
      const start = t + n.w;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);
      gain.gain.setValueAtTime(0.38, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + n.d + 0.05);
    });
  }

  playDefeat() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(210, t + 0.35);
    osc.frequency.linearRampToValueAtTime(105, t + 0.75);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.82);
  }

  // ==========================================
  // PROCEDURAL DYNAMIC MUSIC TRACKS
  // ==========================================

  playMusic(trackName) {
    if (this.currentTrack === trackName) return;
    this.stopMusic();
    this.currentTrack = trackName;
    this.musicStep = 0;

    if (!trackName) return;
    this.ensureContext();
    if (!this.ctx) return;

    const tempoMap = {
      intro: 100,
      home: 126,
      combat: 138,
      boss: 148
    };
    const bpm = tempoMap[trackName] || 120;
    const interval = (60 / bpm / 2) * 1000;

    this.musicTimer = setInterval(() => {
      if (this.ctx && !this.muted && this.musicVolume > 0) {
        this.stepMusic(trackName);
      }
      this.musicStep++;
    }, interval);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.currentTrack = null;
  }

  stepMusic(track) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const step = this.musicStep % 32;

    if (track === 'intro') {
      // Cinematic crescendo chords for "TEAM MARVELZ PRESENTS"
      if (step === 0 || step === 16) {
        [220, 277.18, 329.63, 440].forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(t);
          osc.stop(t + 1.25);
        });
      }
    } else if (track === 'home') {
      // Bouncy Arctic adventure melody
      const bassNotes = [130.81, 0, 130.81, 0, 174.61, 0, 196.00, 0];
      const b = bassNotes[step % 8];
      if (b > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(b, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.18);
      }

      const melody = [
        523.25, 0, 659.25, 783.99, 0, 659.25, 523.25, 0,
        880.00, 0, 783.99, 0, 659.25, 0, 587.33, 0,
        523.25, 659.25, 783.99, 1046.50, 0, 880.00, 783.99, 0,
        659.25, 0, 587.33, 0, 523.25, 0, 0, 0
      ];
      const m = melody[step];
      if (m > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(m, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.24);
      }
    } else if (track === 'combat') {
      // Driving battle rhythm & bass
      const battleBass = [110, 110, 130.81, 110, 146.83, 110, 130.81, 123.47];
      const f = battleBass[step % 8];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.14);
    } else if (track === 'boss') {
      // Heavy apocalyptic boss battle theme
      const bossBass = [55, 0, 55, 65.41, 0, 55, 73.42, 65.41];
      const bf = bossBass[step % 8];
      if (bf > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bf, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.16);
      }
    }
  }
}

window.soundEngine = new SoundEngine();
