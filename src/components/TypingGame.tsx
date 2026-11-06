import { useState, useEffect, useCallback, useRef } from "react";
import { Song } from "./SongSelect";
import { playPianoNote, playNoteByKey, playMissNote, playAmbientSwell, playAutoMelody, warmUpAudio, resetNoteIndex, setSongId, setCustomMelody } from "@/lib/pianoEngine";
import { ArrowLeft, Sparkles, Play, Pause } from "lucide-react";
import PianoKeys from "./PianoKeys";

const HAIKUS = [
  ["soft rain on the keys", "each note a whispered secret", "silence answers back"],
  ["fingers find their way", "through the falling amber light", "music remembers"],
  ["the night holds its breath", "as melodies drift like smoke", "time forgets to move"],
  ["ink dissolves in rain", "the rhythm of quiet words", "becomes a river"],
  ["between the keystrokes", "a world of stillness expands", "sound cradles the dark"],
  ["embers in the keys", "warmth that lingers after touch", "echoes never fade"],
  ["moonlight on the page", "letters bloom like evening stars", "the song writes itself"],
  ["a breath between notes", "the piano holds the room", "in gentle amber"],
  ["clouds part for the moon", "the melody finds its way", "through the sleeping town"],
  ["petals on still water", "each ripple a fading chord", "the pond remembers"],
  ["snow falls on the roof", "the warmth inside hums softly", "winter dreams in keys"],
  ["dawn breaks without sound", "the last note still hangs in air", "morning holds it close"],
  ["wind through bamboo groves", "nature plays its own refrain", "we are just listening"],
  ["candlelight flickers", "shadows dance on ivory", "the flame keeps the beat"],
  ["old books and warm tea", "the sound of turning pages", "a quiet concerto"],
  ["stars hum lullabies", "the universe keeps rhythm", "we sleep in its arms"],
  ["footsteps in fresh snow", "each crunch a percussive gift", "the path sings along"],
  ["cherry blossoms fall", "a pink cascade of soft notes", "spring exhales its song"],
  ["the ocean at dusk", "waves compose their own ballad", "sand keeps the tempo"],
  ["fireflies at dusk", "each glow a note in the dark", "the meadow plays on"],
  ["morning fog lifts slow", "the world reveals its secrets", "one note at a time"],
  ["rain taps on the glass", "a patient drummer waiting", "for the song to start"],
  ["the cat on the keys", "an accidental sonata", "paws find the right notes"],
  ["cobblestone and mist", "footsteps echo a slow waltz", "the city remembers"],
  ["lanterns on the lake", "their reflections hum in gold", "night cradles the light"],
  ["the teacup trembles", "as thunder rolls its low note", "steam rises in peace"],
  ["autumn leaves descend", "each one a fading measure", "the tree stands in rest"],
  ["horizons stretch wide", "the melody has no end", "just a change in key"],
  ["fingers pause mid-air", "the silence is the sweetest", "note of them all"],
  ["a door left ajar", "music spills into the hall", "the house breathes it in"],
];

let lastHaikuIndex = -1;

const CHAR_POOL = "abcdefghijklmnopqrstuvwxyz";

interface FallingChar {
  id: number;
  char: string;
  x: number;
  startTime: number;
  duration: number;
  matched: boolean;
}

interface BurstEffect {
  id: number;
  x: number;
  y: number;
  char: string;
  combo: number;
}

interface TypingGameProps {
  song: Song | null;
  isFreestyle: boolean;
  onEnd: (stats: { combo: number; total: number; maxCombo: number }) => void;
  onBack: () => void;
  themePicker?: React.ReactNode;
}

const TypingGame = ({ song, isFreestyle, onEnd, onBack, themePicker }: TypingGameProps) => {
  const [fallingChars, setFallingChars] = useState<FallingChar[]>([]);
  const [bursts, setBursts] = useState<BurstEffect[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [total, setTotal] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [showLetterbox, setShowLetterbox] = useState(false);
  const [freestyleText, setFreestyleText] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [cinematicVisible, setCinematicVisible] = useState(false);
  const [cinematicFading, setCinematicFading] = useState(false);
  const [currentHaiku, setCurrentHaiku] = useState(0);
  const [continuousAutoPlay, setContinuousAutoPlay] = useState(false);
  const autoPlayRef = useRef<number | null>(null);
  const continuousAutoPlayRef = useRef<number | null>(null);
  const lastAutoPlayCombo = useRef(0);
  const comboRef = useRef(0);
  const warmthRef = useRef(0);
  const fallingCharsRef = useRef<FallingChar[]>([]);
  const autoPlayingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fallingAreaRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const charIdRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const gameDuration = 90;

  const bpm = song?.bpm || 65;
  // Spawn characters faster than words — roughly every beat
  const spawnInterval = (60 / bpm) * 1000;

  // Init: set song, focus input, pre-warm audio
  useEffect(() => {
    warmUpAudio();
    if (song?.custom) {
      setCustomMelody(song.custom.melody, song.custom.autoMelody, song.custom.bass);
    }
    setSongId(song?.id || "rainy-night");
    inputRef.current?.focus();
    resetNoteIndex();
    playAmbientSwell();
  }, [song]);

  // Raw DOM keydown listener — bypasses React synthetic event overhead
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (autoPlayingRef.current) return;

      if (isFreestyle) {
        if (e.key === 'Backspace') {
          playMissNote();
        } else if (e.key === ' ') {
          playAmbientSwell();
        } else if (e.key.length === 1) {
          playNoteByKey(e.key, comboRef.current, 0.5);
          setCombo(prev => prev + 1);
          setTotal(prev => prev + 1);
        }
        return;
      }

      if (e.key.length === 1) {
        const pressedChar = e.key.toLowerCase();
        e.preventDefault();

        const chars = fallingCharsRef.current;
        const matchIdx = chars.findIndex(c => !c.matched && c.char === pressedChar);

        if (matchIdx !== -1) {
          playPianoNote(comboRef.current, 0.3 + warmthRef.current * 0.3);
          setCombo(prev => prev + 1);
          setTotal(prev => prev + 1);
          const matched = chars[matchIdx];
          const matchedId = matched.id;
          // Get actual DOM position of the falling char
          const charEl = fallingAreaRef.current?.querySelector(`[data-char-id="${matchedId}"]`);
          const areaRect = fallingAreaRef.current?.getBoundingClientRect();
          if (charEl && areaRect) {
            const charRect = charEl.getBoundingClientRect();
            const burstId = Date.now() + Math.random();
            const bx = charRect.left - areaRect.left + charRect.width / 2;
            const by = charRect.top - areaRect.top + charRect.height / 2;
            setBursts(prev => [...prev, { id: burstId, x: bx, y: by, char: matched.char, combo: comboRef.current }]);
            setTimeout(() => setBursts(prev => prev.filter(b => b.id !== burstId)), 600);
          }
          setFallingChars(prev =>
            prev.map(c => c.id === matchedId ? { ...c, matched: true } : c)
          );
          setTimeout(() => {
            setFallingChars(prev => prev.filter(c => c.id !== matchedId));
          }, 200);
        } else {
          playMissNote();
          setCombo(0);
        }
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [isFreestyle]);

  // Timer (only for rhythm mode)
  useEffect(() => {
    if (isFreestyle) return;
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= gameDuration) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isFreestyle]);

  // Check end (rhythm mode only)
  useEffect(() => {
    if (isFreestyle) return;
    if (elapsedTime >= gameDuration) {
      setTimeout(() => onEnd({ combo, total, maxCombo }), 1500);
    }
  }, [elapsedTime, combo, total, maxCombo, onEnd, isFreestyle]);

  // Spawn falling characters (pause during auto-play)
  useEffect(() => {
    if (isFreestyle || autoPlaying) return;
    intervalRef.current = window.setInterval(() => {
      const char = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
      const id = charIdRef.current++;
      setFallingChars(prev => [...prev, {
        id, char,
        x: 5 + Math.random() * 85,
        startTime: Date.now(),
        duration: 4000 + Math.random() * 2000,
        matched: false,
      }]);
    }, spawnInterval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isFreestyle, spawnInterval, autoPlaying]);

  // Clean up old chars (pause during auto-play)
  useEffect(() => {
    if (autoPlaying) return;
    const cleanup = setInterval(() => {
      setFallingChars(prev => prev.filter(c => Date.now() - c.startTime < c.duration));
    }, 500);
    return () => clearInterval(cleanup);
  }, [autoPlaying]);

  // Sync refs with state
  useEffect(() => {
    comboRef.current = combo;
    warmthRef.current = warmth;
  }, [combo, warmth]);

  useEffect(() => {
    fallingCharsRef.current = fallingChars;
  }, [fallingChars]);

  useEffect(() => {
    autoPlayingRef.current = autoPlaying;
  }, [autoPlaying]);

  // Update warmth
  useEffect(() => {
    setWarmth(Math.min(combo / 15, 1));
    setMaxCombo(prev => Math.max(prev, combo));

    // Cinematic auto-play at every 30-streak milestone (only in rhythm mode)
    if (!isFreestyle && combo > 0 && combo % 30 === 0 && combo !== lastAutoPlayCombo.current && !autoPlaying) {
      lastAutoPlayCombo.current = combo;
      setAutoPlaying(true);
      setCinematicVisible(true);
      setCinematicFading(false);
      // Pick a random non-repeating haiku
      let idx = Math.floor(Math.random() * HAIKUS.length);
      while (idx === lastHaikuIndex && HAIKUS.length > 1) idx = Math.floor(Math.random() * HAIKUS.length);
      lastHaikuIndex = idx;
      setCurrentHaiku(idx);
      setShowLetterbox(true);
      playAutoMelody(combo);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Start fade-out 2s before end
      setTimeout(() => {
        setCinematicFading(true);
      }, 13000);

      setTimeout(() => {
        setAutoPlaying(false);
        setShowLetterbox(false);
        setCinematicVisible(false);
        setCinematicFading(false);
      }, 15000);
    }
  }, [combo, autoPlaying, isFreestyle]);

  // Continuous autoplay — auto-matches falling chars at BPM tempo
  useEffect(() => {
    if (!continuousAutoPlay || isFreestyle) {
      if (continuousAutoPlayRef.current) {
        clearInterval(continuousAutoPlayRef.current);
        continuousAutoPlayRef.current = null;
      }
      return;
    }

    const interval = spawnInterval * 0.9; // slightly faster than spawn
    continuousAutoPlayRef.current = window.setInterval(() => {
      const chars = fallingCharsRef.current;
      const unmatched = chars.find(c => !c.matched);
      if (unmatched) {
        playPianoNote(comboRef.current, 0.3 + warmthRef.current * 0.3);
        setCombo(prev => prev + 1);
        setTotal(prev => prev + 1);

        // Spawn burst at char position
        const charEl = fallingAreaRef.current?.querySelector(`[data-char-id="${unmatched.id}"]`);
        const areaRect = fallingAreaRef.current?.getBoundingClientRect();
        if (charEl && areaRect) {
          const charRect = charEl.getBoundingClientRect();
          const burstId = Date.now() + Math.random();
          const bx = charRect.left - areaRect.left + charRect.width / 2;
          const by = charRect.top - areaRect.top + charRect.height / 2;
          setBursts(prev => [...prev, { id: burstId, x: bx, y: by, char: unmatched.char, combo: comboRef.current }]);
          setTimeout(() => setBursts(prev => prev.filter(b => b.id !== burstId)), 600);
        }

        setFallingChars(prev =>
          prev.map(c => c.id === unmatched.id ? { ...c, matched: true } : c)
        );
        setTimeout(() => {
          setFallingChars(prev => prev.filter(c => c.id !== unmatched.id));
        }, 200);
      }
    }, interval);

    return () => {
      if (continuousAutoPlayRef.current) {
        clearInterval(continuousAutoPlayRef.current);
        continuousAutoPlayRef.current = null;
      }
    };
  }, [continuousAutoPlay, isFreestyle, spawnInterval]);

  const timeLeft = Math.max(0, gameDuration - elapsedTime);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      ref={gameRef}
      className={`relative z-10 flex flex-col min-h-screen transition-all duration-[2000ms] ${showLetterbox ? 'letterbox-active' : ''}`}
      onClick={() => inputRef.current?.focus()}
      style={{ filter: `brightness(${1 + warmth * 0.15})` }}
    >
      <div className="letterbox letterbox-top" />
      <div className="letterbox letterbox-bottom" />

      <div
        className="fixed inset-0 pointer-events-none z-[6] transition-opacity duration-[2000ms]"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, hsla(37, 90%, 45%, ${warmth * 0.12}), transparent 70%)`,
          opacity: warmth,
        }}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between p-6 relative z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          back
        </button>
        <div className="flex items-center gap-4">
          {!isFreestyle && (
            <button
              onClick={() => setContinuousAutoPlay(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs tracking-wider transition-all duration-300 ${
                continuousAutoPlay
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground border border-border hover:border-primary/20'
              }`}
            >
              {continuousAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              autoplay
            </button>
          )}
          {combo > 0 && (
            <div className="text-primary/70 font-display text-lg animate-fade-in">
              {combo} ✦
            </div>
          )}
          {!isFreestyle && (
            <div className="text-muted-foreground font-body text-sm tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          )}
          {themePicker && <div>{themePicker}</div>}
        </div>
      </div>

      {/* Song title */}
      <div className="text-center mt-2">
        <p className="font-display text-lg text-foreground/50 italic">
          {song ? `${song.title}` : "Freestyle"}
        </p>
        {song && (
          <p className="font-body text-xs text-muted-foreground mt-1">{song.mood}</p>
        )}
      </div>

      {/* Cinematic haiku overlay */}
      {cinematicVisible && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          style={{
            transition: 'opacity 2s ease-in-out',
            opacity: cinematicFading ? 0 : 1,
          }}
        >
          {/* Dark cinematic backdrop */}
          <div
            className="absolute inset-0 bg-background/60"
            style={{
              transition: 'opacity 2s ease-in-out',
              opacity: cinematicFading ? 0 : 1,
            }}
          />
          <div className="relative text-center space-y-4">
            <Sparkles className="w-5 h-5 text-primary/60 animate-pulse mx-auto mb-6" />
            {HAIKUS[currentHaiku].map((line, i) => (
              <p
                key={i}
                className="font-display text-xl md:text-2xl text-foreground/70 italic tracking-wide"
                style={{
                  animation: `fade-in 1.5s ease-out ${1 + i * 1.5}s both`,
                }}
              >
                {line}
              </p>
            ))}
            <Sparkles className="w-5 h-5 text-primary/60 animate-pulse mx-auto mt-6" />
          </div>
        </div>
      )}

      {/* Falling characters area */}
      <div ref={fallingAreaRef} className="flex-1 relative overflow-hidden">
        {!isFreestyle && fallingChars.map((c) => (
          <div
            key={c.id}
            data-char-id={c.id}
            className="absolute font-display text-3xl md:text-4xl font-light select-none"
            style={{
              left: `${c.x}%`,
              top: 0,
              color: c.matched
                ? 'hsl(var(--primary))'
                : 'hsl(var(--foreground) / 0.6)',
              textShadow: c.matched
                ? '0 0 24px hsla(37, 90%, 55%, 0.8)'
                : '0 0 8px hsla(37, 50%, 50%, 0.15)',
              animation: autoPlaying ? 'none' : `letter-fall ${c.duration}ms linear forwards`,
              animationPlayState: autoPlaying ? 'paused' : 'running',
              willChange: 'transform, opacity',
              pointerEvents: 'none',
              opacity: c.matched ? 0 : 1,
              visibility: c.matched ? 'hidden' as const : 'visible' as const,
            }}
          >
            {c.char}
          </div>
        ))}

        {/* Burst effects on matched chars — scales with combo */}
        {bursts.map((b) => {
          const intensity = Math.min(b.combo / 30, 1); // 0 to 1 over 30 combo
          const ringSize = 50 + intensity * 60; // 50px to 110px
          const particleCount = 4 + Math.floor(intensity * 8); // 4 to 12
          const particleDist = 25 + intensity * 40; // 25px to 65px
          const particleSize = 1.5 + intensity * 2; // 1.5 to 3.5
          const charScale = 1 + intensity * 0.6; // 1x to 1.6x
          const glowStrength = 20 + intensity * 30;
          const duration = 0.5 + intensity * 0.3;

          return (
            <div key={b.id} className="absolute pointer-events-none" style={{ left: b.x, top: b.y, width: 0, height: 0 }}>
              <div
                className="absolute rounded-full border-primary/50"
                style={{
                  width: ringSize, height: ringSize,
                  left: -ringSize / 2, top: -ringSize / 2,
                  borderWidth: 2 + intensity * 2,
                  borderStyle: 'solid',
                  animation: `burst-ring ${duration}s ease-out forwards`,
                }}
              />
              {b.combo >= 15 && (
                <div
                  className="absolute rounded-full border border-primary/30"
                  style={{
                    width: ringSize * 1.4, height: ringSize * 1.4,
                    left: -(ringSize * 1.4) / 2, top: -(ringSize * 1.4) / 2,
                    animation: `burst-ring ${duration + 0.15}s ease-out 0.05s forwards`,
                  }}
                />
              )}
              <div
                className="absolute font-display text-primary"
                style={{
                  left: 0, top: 0,
                  fontSize: `${1.8 * charScale}rem`,
                  transform: 'translate(-50%, -50%)',
                  animation: `burst-char ${duration}s ease-out forwards`,
                  textShadow: `0 0 ${glowStrength}px hsla(37, 90%, 55%, 0.9)`,
                }}
              >
                {b.char}
              </div>
              {Array.from({ length: particleCount }).map((_, i) => {
                const angle = (i / particleCount) * Math.PI * 2;
                const dist = particleDist + Math.random() * 15;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full bg-primary"
                    style={{
                      width: particleSize, height: particleSize,
                      left: -particleSize / 2, top: -particleSize / 2,
                      '--bx': `${Math.cos(angle) * dist}px`,
                      '--by': `${Math.sin(angle) * dist}px`,
                      animation: `burst-particle ${duration}s ease-out ${i * 0.02}s forwards`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
          );
        })}

        {isFreestyle && (
          <div className="flex items-center justify-center h-full px-12">
            <p className="font-display text-3xl md:text-4xl text-foreground/70 text-center leading-relaxed glow-text max-w-3xl whitespace-pre-wrap">
              {freestyleText || (
                <span className="text-muted-foreground/40 italic">
                  start typing... let the music follow you
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Piano keys visualization */}
      <div className="relative z-20 px-6 mb-2">
        <PianoKeys />
      </div>

      {/* Hidden input to capture keypresses */}
      <div className="relative z-20 pb-8 px-6 flex justify-center">
        <input
          ref={inputRef}
          type="text"
          aria-label={isFreestyle ? "Type freely to play piano" : "Type the falling letters to play"}
          value={isFreestyle ? freestyleText : ""}
          onChange={(e) => isFreestyle && setFreestyleText(e.target.value)}
          
          className="w-full max-w-md bg-transparent border-b border-primary/20 focus:border-primary/50 outline-none text-center font-display text-2xl text-foreground py-3 placeholder:text-muted-foreground/30 transition-colors duration-500"
          placeholder={isFreestyle ? "type anything..." : "press the falling letters..."}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default TypingGame;
