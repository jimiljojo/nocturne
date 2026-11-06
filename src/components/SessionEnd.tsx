import { useMemo } from "react";
import { Heart, RotateCcw, Home, Quote } from "lucide-react";

const MUSIC_QUOTES = [
  { text: "Music is the shorthand of emotion.", author: "Leo Tolstoy" },
  { text: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
  { text: "Music expresses that which cannot be said.", author: "Victor Hugo" },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
  { text: "Music is the universal language of mankind.", author: "Henry Wadsworth Longfellow" },
  { text: "One good thing about music, when it hits you, you feel no pain.", author: "Bob Marley" },
  { text: "Music gives a soul to the universe, wings to the mind.", author: "Plato" },
  { text: "After silence, that which comes nearest to expressing the inexpressible is music.", author: "Aldous Huxley" },
  { text: "Music is moonlight in the gloomy night of life.", author: "Jean Paul" },
  { text: "Life is like a piano. The white keys represent happiness and the black show sadness. But as you go through life, remember that the black keys also make music.", author: "Ehsaan" },
  { text: "Music is the strongest form of magic.", author: "Marilyn Manson" },
  { text: "The only truth is music.", author: "Jack Kerouac" },
  { text: "Music touches us emotionally, where words alone can't.", author: "Johnny Depp" },
  { text: "To play a wrong note is insignificant; to play without passion is inexcusable.", author: "Beethoven" },
];


interface SessionEndProps {
  stats: { combo: number; total: number; maxCombo: number };
  onRestart: () => void;
  onHome: () => void;
}

const SessionEnd = ({ stats, onRestart, onHome }: SessionEndProps) => {
  const quote = useMemo(() => MUSIC_QUOTES[Math.floor(Math.random() * MUSIC_QUOTES.length)], []);
  const bars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      height: 20 + Math.random() * 60,
      delay: i * 0.08,
      duration: 1 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
      <div className="text-center mb-12">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
          session complete
        </p>
        <h2 className="font-display text-5xl md:text-7xl font-light text-foreground glow-text mb-4">
          You composed
        </h2>
        <h2 className="font-display text-5xl md:text-7xl font-light text-primary glow-text italic">
          this moment.
        </h2>
      </div>

      {/* Waveform visual */}
      <div className="flex items-end gap-1 h-24 mb-12">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className="w-1.5 rounded-full bg-primary/40"
            style={{
              height: `${bar.height}%`,
              animation: `waveform-bar ${bar.duration}s ease-in-out ${bar.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Stats - gentle, not competitive */}
      <div className="glass-panel rounded-2xl p-8 max-w-sm w-full mb-10">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-display text-3xl text-primary">{stats.total}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">notes played</p>
          </div>
          <div>
            <p className="font-display text-3xl text-primary">{stats.maxCombo}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">longest flow</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 mt-6 pt-4 border-t border-border">
          <Quote className="w-3 h-3 text-primary/40" />
          <p className="font-display text-sm text-foreground/70 italic text-center leading-relaxed">
            "{quote.text}"
          </p>
          <p className="font-body text-xs text-muted-foreground">— {quote.author}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-3 glass-panel rounded-full px-8 py-3 font-body text-sm tracking-wider text-cream-soft hover:text-primary transition-all duration-500 hover:border-primary/20 hover:shadow-[var(--glow-soft)]"
        >
          <RotateCcw className="w-4 h-4" />
          play again
        </button>
        <button
          onClick={onHome}
          className="flex items-center gap-3 glass-panel rounded-full px-8 py-3 font-body text-sm tracking-wider text-cream-soft hover:text-primary transition-all duration-500 hover:border-primary/20 hover:shadow-[var(--glow-soft)]"
        >
          <Home className="w-4 h-4" />
          home
        </button>
      </div>
    </div>
  );
};

export default SessionEnd;
