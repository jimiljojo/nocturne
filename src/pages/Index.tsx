import { useState, useCallback } from "react";
import WeatherEffect from "@/components/WeatherEffect";
import ParticleEffect from "@/components/ParticleEffect";
import SongSelect, { Song } from "@/components/SongSelect";
import TypingGame from "@/components/TypingGame";
import SessionEnd from "@/components/SessionEnd";
import ThemePicker from "@/components/ThemePicker";
import ListeningMode from "@/components/ListeningMode";
import { Theme, THEMES, DEFAULT_THEME } from "@/lib/themes";

type Screen = "home" | "select" | "game" | "end" | "listening";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isFreestyle, setIsFreestyle] = useState(false);
  const [stats, setStats] = useState({ combo: 0, total: 0, maxCombo: 0 });
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [listeningUrl, setListeningUrl] = useState("");

  const handleStart = useCallback(() => setScreen("select"), []);
  const handleSelectSong = useCallback((song: Song) => {
    setSelectedSong(song);
    setIsFreestyle(false);
    setScreen("game");
  }, []);
  const handleFreestyle = useCallback(() => {
    setSelectedSong(null);
    setIsFreestyle(true);
    setScreen("game");
  }, []);
  const handleEnd = useCallback((s: typeof stats) => {
    setStats(s);
    setScreen("end");
  }, []);
  const handleRestart = useCallback(() => {
    setScreen("select");
    setStats({ combo: 0, total: 0, maxCombo: 0 });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden animate-sway">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${theme.image})`,
          filter: `brightness(${theme.brightness}) saturate(${theme.saturation})`,
        }}
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 z-0 bg-background/70" />

      {/* Atmospheric layers */}
      <WeatherEffect type={theme.weatherEffect} />
      <ParticleEffect intensity={screen === "game" ? 1.5 : 1} />
      <div
        className="bloom-overlay"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, hsla(${theme.bloomHue}, 90%, 55%, 0.06) 0%, transparent 60%)`,
        }}
      />
      <div className="vinyl-texture" />

      {/* Theme picker - visible on non-game screens */}
      {screen !== "game" && (
        <div className="fixed top-4 right-4 z-30">
          <ThemePicker current={theme} onChange={setTheme} />
        </div>
      )}

      {/* Screens */}
      {screen === "home" && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center animate-fade-in">
            <p className="font-body text-xs tracking-[0.4em] uppercase text-muted-foreground mb-8">
              a rhythm typing experience
            </p>
            <h1 className="font-display text-6xl md:text-8xl font-light text-foreground glow-text mb-3">
              Nocturne
            </h1>
            <p className="font-display text-xl md:text-2xl text-primary/60 italic mb-16">
              type softly. compose beautifully.
            </p>
            <button
              onClick={handleStart}
              className="glass-panel rounded-full px-10 py-4 font-body text-sm tracking-[0.2em] uppercase text-foreground hover:text-primary hover:border-primary/30 hover:shadow-[var(--glow-amber)] transition-all duration-700 focus:outline-none"
            >
              begin
            </button>
          </div>
        </div>
      )}

      {screen === "select" && (
        <SongSelect
          onSelect={handleSelectSong}
          onFreestyle={handleFreestyle}
          onListeningMode={(url) => { setListeningUrl(url); setScreen("listening"); }}
        />
      )}

      {screen === "listening" && (
        <ListeningMode url={listeningUrl} onBack={() => setScreen("select")} />
      )}

      {screen === "game" && (
        <TypingGame
          song={selectedSong}
          isFreestyle={isFreestyle}
          onEnd={handleEnd}
          onBack={() => setScreen("select")}
          themePicker={<ThemePicker current={theme} onChange={setTheme} />}
        />
      )}

      {screen === "end" && (
        <SessionEnd stats={stats} onRestart={handleRestart} onHome={() => setScreen("home")} />
      )}
    </div>
  );
};

export default Index;
