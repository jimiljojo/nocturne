import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Youtube, Music2, Shuffle } from "lucide-react";

// Curated videos from featured piano/guitar channels
export const REMIX_VIDEOS = [
  // Rousseau
  { id: "XkgyOZxIw0k", label: "Debussy — Clair de Lune", channel: "Rousseau" },
  { id: "WNcsUNKlAKw", label: "Debussy — Clair de Lune (2)", channel: "Rousseau" },
  { id: "NPBCbTZWnq0", label: "Yiruma — River Flows in You", channel: "Rousseau" },
  { id: "WJ3-F02-F_Y", label: "Most Beautiful Piano Pieces", channel: "Rousseau" },
  // Ludovico Einaudi
  { id: "hN_q-_nGv4U", label: "Experience", channel: "Ludovico Einaudi" },
  { id: "O9wjmEhMKFw", label: "Experience (Solo Piano)", channel: "Ludovico Einaudi" },
  { id: "vtKsBCA4H8Q", label: "I Giorni", channel: "Ludovico Einaudi" },
  { id: "mH4yaHFaGU4", label: "Nuvole Bianche", channel: "Ludovico Einaudi" },
  // Yiruma
  { id: "7maJOI3QMu0", label: "River Flows in You", channel: "Yiruma" },
  { id: "imGaOIm5HOk", label: "Kiss the Rain", channel: "Yiruma" },
  { id: "iMPHFWRrzv0", label: "May Be / Love (Live)", channel: "Yiruma" },
  { id: "vgCOWzf5k6Y", label: "Kiss The Rain (Visualizer)", channel: "Yiruma" },
  { id: "wDk59eIT6zI", label: "May Be + Kiss The Rain + River Flows", channel: "Yiruma" },
  // Sungha Jung
  { id: "aURTF6cw8iQ", label: "Stairway to Heaven", channel: "Sungha Jung" },
  { id: "hCsxrEYR7yI", label: "Bohemian Rhapsody", channel: "Sungha Jung" },
  { id: "4nhlItCsZtc", label: "Just The Two Of Us", channel: "Sungha Jung" },
  { id: "iyMQRVA2pnc", label: "I'm Yours", channel: "Sungha Jung" },
];

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
  ["temple bells at dawn", "vibrations cross the still lake", "fish dream of music"],
  ["a vinyl crackles", "the needle finds the groove", "memories spin round"],
  ["lanterns line the path", "each flame a measure of warmth", "the night walks with us"],
  ["thunder rolls above", "the bass line of the heavens", "earth hums in reply"],
  ["leaves turn gold and red", "autumn's slow diminuendo", "winter waits in wings"],
  ["the clock strikes midnight", "each chime a falling petal", "dawn is just a dream"],
  ["two hands on the keys", "four voices in the silence", "love needs no lyrics"],
];

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function extractAppleMusicEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "music.apple.com" || parsed.username || parsed.password || parsed.port) return null;
    if (!/^\/[\w-]+\/(album|playlist|song)\/[\w-]+\/\d+\/?$/.test(parsed.pathname)) return null;
    return `https://embed.music.apple.com${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function extractSpotifyEmbed(url: string): string | null {
  // open.spotify.com/track/ID, /album/ID, /playlist/ID
  const match = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  return null;
}

type EmbedType = "youtube" | "apple-music" | "spotify";
type HaikuPhase = "writing" | "visible" | "wiping" | "hidden";

// Sand character component - each letter "draws" in with grain
const SandChar = ({ char, delay, wiping }: { char: string; delay: number; wiping: boolean }) => (
  <span
    className="inline-block"
    style={{
      animation: wiping
        ? `sand-wipe 0.6s ease-in ${delay * 0.02}s both`
        : `sand-write 0.3s ease-out ${delay * 0.04}s both`,
    }}
  >
    {char === " " ? "\u00A0" : char}
  </span>
);

// Renders a haiku line as individual sand-drawn characters
const SandLine = ({ text, lineDelay, wiping }: { text: string; lineDelay: number; wiping: boolean }) => (
  <p className="font-display text-xl md:text-2xl text-foreground/80 italic leading-relaxed mb-2">
    {text.split("").map((char, i) => (
      <SandChar key={i} char={char} delay={lineDelay + i} wiping={wiping} />
    ))}
  </p>
);

// Sand particles that burst out during the wipe phase
const PARTICLE_COUNT = 24;
const SandParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,        // % across the area
      y: 15 + Math.random() * 70,     // % vertical, clustered around text
      dx: 30 + Math.random() * 60,    // drift right px
      dy: -20 + Math.random() * 40,   // drift up/down px
      size: 2 + Math.random() * 3,    // px
      delay: Math.random() * 0.8,     // stagger
      duration: 0.8 + Math.random() * 0.7,
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsl(35 60% ${55 + Math.random() * 20}% / 0.7)`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            animation: `sand-particle-drift ${p.duration}s ease-out ${p.delay}s both`,
          }}
        />
      ))}
    </div>
  );
};

interface ListeningModeProps {
  url: string;
  onBack: () => void;
}

const ListeningMode = ({ url: initialUrl, onBack }: ListeningModeProps) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [currentHaiku, setCurrentHaiku] = useState(0);
  const [phase, setPhase] = useState<HaikuPhase>("writing");
  const [cycleKey, setCycleKey] = useState(0);
  const [remixLabel, setRemixLabel] = useState<string | null>(null);

  const youtubeId = extractYouTubeId(currentUrl);
  const appleMusicUrl = extractAppleMusicEmbed(currentUrl);
  const spotifyUrl = extractSpotifyEmbed(currentUrl);
  const embedType: EmbedType | null = youtubeId ? "youtube" : appleMusicUrl ? "apple-music" : spotifyUrl ? "spotify" : null;

  const handleRemix = () => {
    const pick = REMIX_VIDEOS[Math.floor(Math.random() * REMIX_VIDEOS.length)];
    setCurrentUrl(`https://www.youtube.com/watch?v=${pick.id}`);
    setRemixLabel(`${pick.label} — ${pick.channel}`);
    // Reset haiku cycle
    setCycleKey((k) => k + 1);
    setPhase("writing");
  };

  const haiku = HAIKUS[currentHaiku];

  // Character counts for staggering line delays
  const lineDelays = useMemo(() => {
    let total = 0;
    return haiku.map((line) => {
      const d = total;
      total += line.length + 4; // small gap between lines
      return d;
    });
  }, [currentHaiku]);

  // Phase state machine: writing → visible → wiping → hidden → next
  useEffect(() => {
    let t1: number, t2: number, t3: number;

    if (phase === "writing") {
      // Wait for writing animation to finish (~2s), then hold visible
      t1 = window.setTimeout(() => setPhase("visible"), 2500);
    } else if (phase === "visible") {
      // Hold for 12 seconds
      t2 = window.setTimeout(() => setPhase("wiping"), 12000);
    } else if (phase === "wiping") {
      // Wipe takes ~1.5s, then switch haiku
      t3 = window.setTimeout(() => {
        setPhase("hidden");
      }, 1500);
    } else if (phase === "hidden") {
      // Pick next haiku and restart
      let next = Math.floor(Math.random() * HAIKUS.length);
      while (next === currentHaiku && HAIKUS.length > 1) {
        next = Math.floor(Math.random() * HAIKUS.length);
      }
      setCurrentHaiku(next);
      setCycleKey((k) => k + 1);
      setPhase("writing");
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [phase, currentHaiku]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
      {/* Sand animation styles */}
      <style>{`
        @keyframes sand-write {
          0% {
            opacity: 0;
            transform: translateY(4px) scale(0.8);
            filter: blur(2px);
          }
          60% {
            opacity: 0.7;
            transform: translateY(1px) scale(1.02);
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes sand-wipe {
          0% {
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0);
          }
          40% {
            opacity: 0.6;
            transform: translateX(6px) translateY(2px);
            filter: blur(1px);
          }
          100% {
            opacity: 0;
            transform: translateX(20px) translateY(6px);
            filter: blur(4px);
          }
        }
        @keyframes sand-grain {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        @keyframes sand-particle-drift {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.5);
          }
          15% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(0);
          }
        }
      `}</style>

      {/* Back button + Remix button */}
      <div className="fixed top-6 left-6 z-30 flex items-center gap-2">
        <button
          onClick={onBack}
          className="glass-panel rounded-full p-3 text-muted-foreground hover:text-foreground transition-colors duration-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleRemix}
          className="glass-panel rounded-full px-4 py-3 font-body text-xs tracking-wider text-muted-foreground hover:text-primary transition-all duration-500 hover:border-primary/20 flex items-center gap-2"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Remix</span>
        </button>
      </div>

      {/* Now playing label */}
      {remixLabel && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass-panel rounded-full px-5 py-2 animate-fade-in">
          <p className="font-body text-[11px] tracking-wider text-muted-foreground text-center">
            ♫ {remixLabel}
          </p>
        </div>
      )}

      {/* Embedded player */}
      <div className="w-full max-w-xl mb-12">
        {embedType === "youtube" && youtubeId && (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title="YouTube player"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
        {embedType === "apple-music" && appleMusicUrl && (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={appleMusicUrl}
              title="Apple Music player"
              allow="autoplay *; encrypted-media *;"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
              className="w-full"
              style={{ height: "175px" }}
            />
          </div>
        )}
        {embedType === "spotify" && spotifyUrl && (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={spotifyUrl}
              title="Spotify player"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="w-full rounded-2xl"
              style={{ height: "152px" }}
            />
          </div>
        )}
        {!embedType && (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-muted-foreground font-body text-sm">
              Couldn't recognize that link. Try a YouTube, Spotify, or Apple Music URL.
            </p>
          </div>
        )}
      </div>

      {/* Haiku sand writing area */}
      <div className="text-center max-w-lg relative" key={cycleKey}>
        {/* Subtle sand texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: "repeating-conic-gradient(hsl(var(--foreground) / 0.02) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px",
            animation: "sand-grain 3s ease-in-out infinite",
          }}
        />

        {(phase === "writing" || phase === "visible" || phase === "wiping") && (
          <div className="py-4">
            {haiku.map((line, i) => (
              <SandLine
                key={`${cycleKey}-${i}`}
                text={line}
                lineDelay={lineDelays[i]}
                wiping={phase === "wiping"}
              />
            ))}
          </div>
        )}

        {/* Sand particles during wipe */}
        {phase === "wiping" && (
          <SandParticles key={`particles-${cycleKey}`} />
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground/40">
          {embedType === "youtube" ? (
            <Youtube className="w-3.5 h-3.5" />
          ) : (
            <Music2 className="w-3.5 h-3.5" />
          )}
          <span className="font-body text-[10px] tracking-[0.3em] uppercase">
            listening mode
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListeningMode;
