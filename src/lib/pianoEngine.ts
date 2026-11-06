// Web Audio API piano engine with real song melodies
// Each song has its actual melodic sequence so typing follows the real tune
let audioCtx: AudioContext | null = null;

// Note frequencies (Hz)
const N = {
  // Octave 3
  A3: 220.00, Bb3: 233.08, B3: 246.94, C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00, Ab3: 207.65,
  // Octave 4
  C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Gb4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  // Octave 5
  C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Gb5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  // Octave 6
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// ===== ACTUAL SONG MELODIES =====
// Each song's melody is the right-hand notes in order, so typing plays the real tune

const SONG_MELODIES: Record<string, number[]> = {
  // River Flows in You - Yiruma (A major, ♩=70)
  // Transcribed from actual piano tabs/sheet music
  river: [
    // Intro - the iconic rocking pattern (measures 1-4)
    N.A4, N.Db5, N.A4, N.Ab4, N.A4, N.Ab4, N.A4, N.E4, N.A4, N.D4,
    N.A4, N.Db5, N.A4, N.Ab4, N.A4, N.Ab4, N.A4, N.E4, N.A4, N.D4,
    // Intro variation (measures 5-6)
    N.A4, N.Db5, N.A4, N.Ab4, N.A4, N.Ab4, N.A4, N.E4, N.A4, N.D4, N.A4,
    // Melodic phrase (measures 7-8)
    N.Db5, N.D5, N.E5, N.Db5, N.B4,
    // Bridge (measures 9-10)
    N.A4, N.Ab4, N.A4, N.E4, N.A4, N.B4, N.Db5,
    N.Db5, N.D5, N.E5, N.D5, N.Db5, N.B4,
    // Main theme - rocking with embellishments (measures 11-16)
    N.A4, N.B4, N.A4, N.Ab4, N.A4, N.A4, N.E4, N.A4,
    N.A4, N.B4, N.A4, N.Ab4, N.A4, N.A4, N.E4, N.A4,
    N.A4, N.B4, N.A4, N.Ab4, N.A4, N.B4, N.Db5, N.D5,
    N.D5, N.Db5, N.B4, N.A4, N.Ab4,
  ],

  // Stay - Rihanna (C major, piano arrangement)
  // Simplified vocal melody in piano form
  stay: [
    // "Not really sure how to feel about it"
    N.E4, N.E4, N.D4, N.C4, N.E4, N.G4, N.E4, N.D4,
    N.C4, N.C4, N.D4, N.E4, N.D4, N.C4, N.A3, N.G3,
    // "Something in the way you move"
    N.C4, N.D4, N.E4, N.G4, N.A4, N.G4, N.E4, N.D4,
    N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.D4, N.C4,
    // Chorus "Stay" sustained notes
    N.C5, N.B4, N.A4, N.G4, N.E4, N.D4, N.C4, N.E4,
    N.G4, N.A4, N.B4, N.C5, N.B4, N.A4, N.G4, N.E4,
    // Resolution
    N.C4, N.D4, N.E4, N.G4, N.C5, N.B4, N.G4, N.E4,
    N.D4, N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.C4,
  ],

  // Perfect - Ed Sheeran (G major, acoustic piano)
  // Main vocal melody
  perfect: [
    // "I found a love for me"
    N.B4, N.B4, N.A4, N.G4, N.G4, N.A4, N.B4, N.D5,
    // "Darling just dive right in"
    N.B4, N.A4, N.G4, N.E4, N.D4, N.G4, N.A4, N.B4,
    // "Follow my lead"
    N.B4, N.D5, N.E5, N.D5, N.B4, N.A4, N.G4, N.A4,
    // "Baby I'm dancing in the dark"
    N.B4, N.B4, N.D5, N.E5, N.D5, N.B4, N.A4, N.G4,
    N.G4, N.A4, N.B4, N.D5, N.B4, N.A4, N.G4, N.E4,
    // Chorus climax
    N.G4, N.A4, N.B4, N.D5, N.E5, N.D5, N.B4, N.G4,
    N.A4, N.B4, N.D5, N.E5, N.G5, N.E5, N.D5, N.B4,
    N.A4, N.G4, N.E4, N.D4, N.G4, N.A4, N.B4, N.D5,
  ],

  // Tum Hi Ho - Arijit Singh (E minor / D minor piano arrangement)
  // Main melody - soulful and emotional
  "tum-hi-ho": [
    // "Tum Hi Ho" opening phrase
    N.E4, N.G4, N.A4, N.B4, N.A4, N.G4, N.E4, N.D4,
    N.E4, N.G4, N.A4, N.B4, N.D5, N.B4, N.A4, N.G4,
    // "Meri aashiqui" ascending
    N.E4, N.G4, N.B4, N.D5, N.E5, N.D5, N.B4, N.A4,
    N.G4, N.E4, N.D4, N.E4, N.G4, N.A4, N.B4, N.A4,
    // Chorus - soaring melody
    N.B4, N.D5, N.E5, N.G5, N.E5, N.D5, N.B4, N.A4,
    N.G4, N.A4, N.B4, N.D5, N.B4, N.A4, N.G4, N.E4,
    // Resolution
    N.D4, N.E4, N.G4, N.A4, N.B4, N.A4, N.G4, N.E4,
    N.E4, N.G4, N.A4, N.B4, N.D5, N.E5, N.D5, N.B4,
  ],

  // Kal Ho Naa Ho - Sonu Nigam (Eb major / C minor piano)
  // Bittersweet main melody
  "kal-ho-na-ho": [
    // "Kal Ho Naa Ho" opening
    N.G4, N.Ab4, N.Bb4, N.C5, N.Bb4, N.Ab4, N.G4, N.Eb4,
    N.F4, N.G4, N.Ab4, N.Bb4, N.C5, N.Bb4, N.Ab4, N.G4,
    // "Har ghadi badal rahi hai"
    N.Eb4, N.F4, N.G4, N.Bb4, N.C5, N.Eb5, N.C5, N.Bb4,
    N.Ab4, N.G4, N.F4, N.Eb4, N.F4, N.G4, N.Ab4, N.Bb4,
    // Chorus - emotional peak
    N.C5, N.Eb5, N.F5, N.Eb5, N.C5, N.Bb4, N.Ab4, N.G4,
    N.Ab4, N.Bb4, N.C5, N.Eb5, N.C5, N.Bb4, N.Ab4, N.G4,
    // Gentle resolution
    N.Eb4, N.G4, N.Bb4, N.C5, N.Bb4, N.G4, N.F4, N.Eb4,
    N.G4, N.Ab4, N.Bb4, N.C5, N.Bb4, N.Ab4, N.G4, N.Eb4,
  ],

  // Rainy Night Café - Lo-fi original (C major, dreamy)
  "rainy-night": [
    // Gentle lo-fi progression
    N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.D4, N.C4,
    N.E4, N.G4, N.C5, N.B4, N.A4, N.G4, N.E4, N.D4,
    // Dreamy middle section
    N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.B4, N.G4,
    N.A4, N.G4, N.E4, N.D4, N.C4, N.E4, N.G4, N.A4,
    // Climbing phrase
    N.G4, N.A4, N.B4, N.C5, N.D5, N.E5, N.D5, N.C5,
    N.B4, N.A4, N.G4, N.E4, N.D4, N.E4, N.G4, N.C5,
    // Cozy resolution
    N.E5, N.D5, N.C5, N.B4, N.A4, N.G4, N.E4, N.C4,
    N.D4, N.E4, N.G4, N.A4, N.C5, N.B4, N.G4, N.E4,
  ],
};

// Auto-melody phrases - the most recognizable bars from each song
const SONG_AUTO_MELODY: Record<string, number[]> = {
  // River Flows - the famous flowing arpeggio phrase
  river: [
    N.A4, N.Db5, N.A4, N.Ab4, N.A4, N.Ab4, N.A4, N.E4,
    N.A4, N.D4, N.Db5, N.D5, N.E5, N.Db5, N.B4, N.A4,
  ],
  stay: [
    N.C5, N.B4, N.A4, N.G4, N.E4, N.G4, N.A4, N.B4,
    N.C5, N.B4, N.G4, N.E4, N.D4, N.C4, N.E4, N.G4,
  ],
  perfect: [
    N.G4, N.A4, N.B4, N.D5, N.E5, N.D5, N.B4, N.G4,
    N.A4, N.B4, N.D5, N.G5, N.E5, N.D5, N.B4, N.G4,
  ],
  "tum-hi-ho": [
    N.B4, N.D5, N.E5, N.G5, N.E5, N.D5, N.B4, N.A4,
    N.G4, N.A4, N.B4, N.D5, N.E5, N.D5, N.B4, N.G4,
  ],
  "kal-ho-na-ho": [
    N.C5, N.Eb5, N.F5, N.Eb5, N.C5, N.Bb4, N.G4, N.Ab4,
    N.Bb4, N.C5, N.Eb5, N.C5, N.Bb4, N.Ab4, N.G4, N.Eb4,
  ],
  "rainy-night": [
    N.C4, N.E4, N.G4, N.C5, N.B4, N.A4, N.G4, N.E4,
    N.D4, N.E4, N.G4, N.A4, N.C5, N.E5, N.D5, N.C5,
  ],
};

// Bass accompaniment patterns per song
const SONG_BASS: Record<string, number[]> = {
  river: [N.A3, N.E3, N.D3, N.A3, N.E3, N.Gb4, N.D3, N.A3],
  stay: [N.C3, N.G3, N.A3, N.F3, N.C3, N.G3, N.E3, N.F3],
  perfect: [N.G3, N.D3, N.E3, N.B3, N.G3, N.D3, N.A3, N.E3],
  "tum-hi-ho": [N.E3, N.B3, N.A3, N.G3, N.E3, N.D3, N.G3, N.A3],
  "kal-ho-na-ho": [N.Eb3, N.Bb3, N.Ab3, N.G3, N.Eb3, N.F3, N.Bb3, N.Ab3],
  "rainy-night": [N.C3, N.G3, N.A3, N.E3, N.F3, N.C3, N.G3, N.D3],
};

let noteIndex = 0;
let reverbNode: ConvolverNode | null = null;
let currentSongId: string = "rainy-night";
let onNoteCallback: ((freq: number, duration: number) => void) | null = null;

function getMelody(): number[] {
  return SONG_MELODIES[currentSongId] || SONG_MELODIES["rainy-night"];
}

function getAutoMelody(): number[] {
  return SONG_AUTO_MELODY[currentSongId] || SONG_AUTO_MELODY["rainy-night"];
}

function getBass(): number[] {
  return SONG_BASS[currentSongId] || SONG_BASS["rainy-night"];
}

// Pre-warm audio context on first user interaction
let audioReady = false;
let cachedNoiseBuf: AudioBuffer | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

export function warmUpAudio() {
  if (audioReady) return;
  if (!audioCtx) {
    // Use "interactive" latency hint for minimum delay
    audioCtx = new AudioContext({ latencyHint: "interactive", sampleRate: 44100 });
    createReverb();
    // Pre-create a shared compressor to avoid per-note filter overhead
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -24;
    masterCompressor.knee.value = 30;
    masterCompressor.ratio.value = 4;
    masterCompressor.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  // Pre-create noise buffer for hammer transient
  const noiseLen = 0.02;
  cachedNoiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * noiseLen, audioCtx.sampleRate);
  const noiseData = cachedNoiseBuf.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseData.length, 3);
  }
  // Play a silent buffer to unlock audio
  const buf = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx.destination);
  src.start();
  audioReady = true;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext({ latencyHint: "interactive", sampleRate: 44100 });
    createReverb();
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -24;
    masterCompressor.knee.value = 30;
    masterCompressor.ratio.value = 4;
    masterCompressor.connect(audioCtx.destination);
  }
  return audioCtx;
}

function getOutput(): AudioNode {
  return masterCompressor || audioCtx!.destination;
}

function createReverb() {
  if (!audioCtx) return;
  reverbNode = audioCtx.createConvolver();
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * 2.5;
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  reverbNode.buffer = impulse;
  reverbNode.connect(audioCtx.destination);
}

export function setSongId(songId: string) {
  currentSongId = songId;
  noteIndex = 0;
}

// Set custom melody from parsed MIDI
export function setCustomMelody(melody: number[], autoMelody: number[], bass: number[]) {
  SONG_MELODIES["custom-midi"] = melody;
  SONG_AUTO_MELODY["custom-midi"] = autoMelody;
  SONG_BASS["custom-midi"] = bass;
}

export function setNoteCallback(cb: ((freq: number, duration: number) => void) | null) {
  onNoteCallback = cb;
}

// Map keyboard keys to piano notes for freestyle mode
// Letter keys c,d,e,f,g,a,b map to their actual note names
const KEY_TO_FREQ: Record<string, number> = {
  // Note-name keys → their actual notes (octave 4)
  c: N.C4, d: N.D4, e: N.E4, f: N.F4, g: N.G4, a: N.A4, b: N.B4,
  // Left hand: home row plays lower octave
  z: N.C3, x: N.D3, v: N.F3, n: N.G3, m: N.A3,
  // Top row: sharps/flats
  w: N.Db4, r: N.Eb4, t: N.Gb4, y: N.Ab4, u: N.Bb4,
  // Right hand: higher octave
  h: N.C5, j: N.D5, k: N.E5, l: N.F5,
  // Extra mappings
  s: N.E3, q: N.B3, i: N.C5, o: N.Db5, p: N.Eb5,
};

export function playNoteByKey(key: string, combo: number = 0, intensity: number = 0.5) {
  const freq = KEY_TO_FREQ[key.toLowerCase()];
  if (!freq) return;
  playNoteAtFreq(freq, combo, intensity);
}

function playNoteAtFreq(freq: number, combo: number, intensity: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const output = getOutput();

  if (onNoteCallback) onNoteCallback(freq, 1500);

  const vol = Math.min(0.12 + intensity * 0.08, 0.25);

  // 4 harmonics — sweet spot of quality vs performance
  const harmonics = [
    { ratio: 1, amp: 1.0,  decay: 2.0 },
    { ratio: 2, amp: 0.45, decay: 1.4 },
    { ratio: 3, amp: 0.2,  decay: 0.9 },
    { ratio: 4, amp: 0.08, decay: 0.6 },
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.value = vol;
  masterGain.connect(output);

  if (reverbNode) {
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.2 + Math.min(combo * 0.015, 0.2);
    masterGain.connect(reverbGain);
    reverbGain.connect(reverbNode);
  }

  harmonics.forEach(h => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * h.ratio;
    if (h.ratio > 1) osc.detune.value = (Math.random() - 0.5) * 4;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(h.amp, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(h.amp * 0.4, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + h.decay);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + h.decay + 0.1);
    osc.onended = () => { gain.disconnect(); osc.disconnect(); };
  });

  if (cachedNoiseBuf) {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = cachedNoiseBuf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = vol * 0.25;
    noiseSrc.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start(now);
    noiseSrc.onended = () => { noiseGain.disconnect(); noiseSrc.disconnect(); };
  }

  setTimeout(() => masterGain.disconnect(), 2500);
}

export function playPianoNote(combo: number = 0, intensity: number = 0.5) {
  const melody = getMelody();
  const idx = noteIndex % melody.length;
  const freq = melody[idx];
  noteIndex++;

  playNoteAtFreq(freq, combo, intensity);

  // Simultaneous bass note at higher combos
  if (combo > 5) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const output = getOutput();
    const bassNotes = getBass();
    const bassFreq = bassNotes[noteIndex % bassNotes.length];
    const bOsc = ctx.createOscillator();
    const bGain = ctx.createGain();
    bOsc.type = 'sine';
    bOsc.frequency.value = bassFreq;
    bGain.gain.setValueAtTime(0, now);
    bGain.gain.linearRampToValueAtTime(0.05, now + 0.01);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    bOsc.connect(bGain);
    bGain.connect(output);
    bOsc.start(now);
    bOsc.stop(now + 2.7);
    bOsc.onended = () => { bGain.disconnect(); bOsc.disconnect(); };
  }
}

// Play the song's signature melody phrase over ~5 seconds on word match
let autoMelodyTimeout: number | null = null;

export function playAutoMelody(combo: number = 0) {
  if (autoMelodyTimeout) clearTimeout(autoMelodyTimeout);

  const melody = getAutoMelody();
  const noteCount = melody.length;
  const interval = Math.floor(5000 / noteCount); // original tempo
  const totalDuration = 15000;
  let i = 0;
  const startTime = Date.now();

  function playNext() {
    if (Date.now() - startTime >= totalDuration) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freq = melody[i % noteCount];

    if (onNoteCallback) onNoteCallback(freq, 400);

    const vol = 0.07 + Math.min(combo * 0.008, 0.06);
    const masterGain = ctx.createGain();
    masterGain.gain.value = vol;
    masterGain.connect(getOutput());

    if (reverbNode) {
      const rGain = ctx.createGain();
      rGain.gain.value = 0.55;
      masterGain.connect(rGain);
      rGain.connect(reverbNode);
    }

    // Softer, longer decay for calming feel
    [
      { ratio: 1, amp: 1.0, decay: 2.0 },
      { ratio: 2, amp: 0.3, decay: 1.4 },
      { ratio: 3, amp: 0.1, decay: 0.8 },
    ].forEach(h => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * h.ratio;
      if (h.ratio > 1) osc.detune.value = (Math.random() - 0.5) * 3;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(h.amp, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(h.amp * 0.3, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + h.decay);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + h.decay + 0.1);
      osc.onended = () => { gain.disconnect(); osc.disconnect(); };
    });

    setTimeout(() => masterGain.disconnect(), 2000);

    i++;
    autoMelodyTimeout = window.setTimeout(playNext, interval);
  }

  playNext();
}

export function playMissNote() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 220;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(gain);
  gain.connect(getOutput());
  osc.start(now);
  osc.stop(now + 0.6);
}

export function playAmbientSwell() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const melody = getMelody();
  // Use 3 harmonious notes from current melody position for the swell chord
  const base = melody[noteIndex % melody.length];
  const third = base * 1.25; // major third
  const fifth = base * 1.5;  // perfect fifth
  [base, third, fifth].forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq / 2;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4);
    osc.connect(gain);
    gain.connect(getOutput());
    osc.start(now);
    osc.stop(now + 4.2);
  });
}

export function resetNoteIndex() {
  noteIndex = 0;
}
