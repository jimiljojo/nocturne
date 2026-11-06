import { Music, Play, Headphones, Upload, Youtube, Music2, Link, Shuffle } from "lucide-react";
import { useRef, useState } from "react";
import { parseMidiFile, ParsedMidiSong } from "@/lib/midiParser";
import { REMIX_VIDEOS } from "./ListeningMode";

export interface Song {
  id: string;
  title: string;
  artist: string;
  mood: string;
  bpm: number;
  custom?: ParsedMidiSong;
}

export const SONGS: Song[] = [
  { id: "river", title: "Tender & Flowing", artist: "Piano", mood: "Gentle arpeggios that drift like water", bpm: 66 },
  { id: "stay", title: "Longing & Gentle", artist: "Piano", mood: "Soft yearning with quiet resolve", bpm: 54 },
  { id: "perfect", title: "Warm & Romantic", artist: "Piano", mood: "Heartfelt melody full of warmth", bpm: 63 },
  { id: "tum-hi-ho", title: "Deep & Soulful", artist: "Piano", mood: "Emotional depth with soaring notes", bpm: 58 },
  { id: "kal-ho-na-ho", title: "Bittersweet & Beautiful", artist: "Piano", mood: "Melancholy beauty in every phrase", bpm: 60 },
  { id: "rainy-night", title: "Cozy & Dreamy", artist: "Lo-fi Piano", mood: "Rainy night café vibes", bpm: 70 },
];

interface SongSelectProps {
  onSelect: (song: Song) => void;
  onFreestyle: () => void;
  onListeningMode?: (url: string) => void;
}

const SongSelect = ({ onSelect, onFreestyle, onListeningMode }: SongSelectProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleMidiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsing(true);

    try {
      const parsed = await parseMidiFile(file);
      const customSong: Song = {
        id: "custom-midi",
        title: parsed.name || "Your Song",
        artist: "MIDI Upload",
        mood: "Your own melody",
        bpm: parsed.bpm,
        custom: parsed,
      };
      onSelect(customSong);
    } catch (err) {
      console.error("MIDI parse error:", err);
      setError("Couldn't parse that MIDI file. Try a different one.");
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Headphones className="w-5 h-5 text-primary/70" />
          <span className="text-sm font-body tracking-[0.3em] uppercase text-muted-foreground">
            Choose your moment
          </span>
        </div>
        <h2 className="text-5xl md:text-6xl font-display font-light text-foreground glow-text">
          What do you feel?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-6">
        {SONGS.map((song) => (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            className="group glass-panel rounded-xl p-5 text-left transition-all duration-500 hover:border-primary/30 hover:shadow-[var(--glow-soft)] focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-500">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors duration-500">
                  {song.title}
                </h3>
                <p className="text-xs text-primary/50 font-body mt-1 italic">
                  {song.mood}
                </p>
              </div>
              <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-500 opacity-0 group-hover:opacity-100 mt-1" />
            </div>
          </button>
        ))}
      </div>

      {/* MIDI Upload */}
      <div className="max-w-2xl w-full mb-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={handleMidiUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
          className="w-full glass-panel rounded-xl p-5 text-left transition-all duration-500 hover:border-primary/30 hover:shadow-[var(--glow-soft)] focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground">
                {parsing ? "Reading your song..." : "Upload Your Own Song"}
              </h3>
              <p className="text-xs text-primary/50 font-body mt-1 italic">
                Drop a .mid / .midi file — we'll turn it into your melody
              </p>
            </div>
          </div>
        </button>
        {error && (
          <p className="text-xs text-destructive font-body mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Listening mode link input */}
      <div className="max-w-2xl w-full mb-6">
        {!showLinkInput ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowLinkInput(true)}
              className="glass-panel rounded-full px-6 py-3 font-body text-sm tracking-wider text-muted-foreground hover:text-primary transition-all duration-500 hover:border-primary/20 hover:shadow-[var(--glow-soft)] flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              <Music2 className="w-4 h-4" />
              <span>Listen & Vibe — paste a link</span>
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <Link className="w-4 h-4 text-primary/60" />
              <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Paste a YouTube, Spotify, or Apple Music link
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://youtube.com/... or open.spotify.com/... or music.apple.com/..."
                className="flex-1 bg-background/50 border border-border/30 rounded-lg px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && linkUrl.trim()) onListeningMode?.(linkUrl.trim());
                  if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
                }}
              />
              <button
                onClick={() => linkUrl.trim() && onListeningMode?.(linkUrl.trim())}
                disabled={!linkUrl.trim()}
                className="glass-panel rounded-lg px-5 py-2.5 font-body text-sm text-primary hover:bg-primary/10 transition-all duration-300 disabled:opacity-30"
              >
                Play
              </button>
              <button
                onClick={() => {
                  const pick = REMIX_VIDEOS[Math.floor(Math.random() * REMIX_VIDEOS.length)];
                  onListeningMode?.(`https://www.youtube.com/watch?v=${pick.id}`);
                }}
                className="glass-panel rounded-lg px-4 py-2.5 font-body text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 flex items-center gap-1.5"
                title="Play a random curated video"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Remix
              </button>
            </div>
            <button
              onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
              className="mt-2 font-body text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              cancel
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onFreestyle}
        className="glass-panel rounded-full px-8 py-3 font-body text-sm tracking-wider text-cream-soft hover:text-primary transition-all duration-500 hover:border-primary/20 hover:shadow-[var(--glow-soft)]"
      >
        ✦ Freestyle — just type and feel ✦
      </button>
    </div>
  );
};

export default SongSelect;
