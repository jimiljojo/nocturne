import { Theme, THEMES } from "@/lib/themes";

interface ThemePickerProps {
  current: Theme;
  onChange: (theme: Theme) => void;
}

// Abstract SVG icons for each theme — minimal, artistic
const ThemeIcon = ({ theme, isActive }: { theme: Theme; isActive: boolean }) => {
  const opacity = isActive ? 1 : 0.5;
  const accent = `hsl(${theme.accent})`;
  const accentFaded = `hsla(${theme.accent}, 0.3)`;

  switch (theme.id) {
    case "rainy-desk":
      // Falling lines — rain
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ opacity }}>
          <line x1="6" y1="3" x2="6" y2="10" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="1" x2="12" y2="8" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="5" x2="18" y2="12" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="10" x2="9" y2="17" stroke={accentFaded} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="12" x2="15" y2="19" stroke={accentFaded} strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="12" cy="22" rx="8" ry="1.5" fill={accentFaded} />
        </svg>
      );
    case "snow-cottage":
      // Scattered dots — snowfall
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ opacity }}>
          <circle cx="6" cy="4" r="1.5" fill={accent} />
          <circle cx="14" cy="7" r="1" fill={accentFaded} />
          <circle cx="19" cy="3" r="1.5" fill={accent} />
          <circle cx="10" cy="12" r="1.5" fill={accent} />
          <circle cx="4" cy="15" r="1" fill={accentFaded} />
          <circle cx="17" cy="14" r="1" fill={accentFaded} />
          <circle cx="8" cy="20" r="1.5" fill={accent} />
          <circle cx="16" cy="19" r="1" fill={accent} />
          <path d="M2 22 Q12 18 22 22" stroke={accentFaded} strokeWidth="1" fill="none" />
        </svg>
      );
    case "fireplace":
      // Organic flame shape
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ opacity }}>
          <path
            d="M12 2 C12 2, 6 10, 8 16 C9 19, 11 20, 12 21 C13 20, 15 19, 16 16 C18 10, 12 2, 12 2Z"
            fill="none" stroke={accent} strokeWidth="1.5" strokeLinejoin="round"
          />
          <path
            d="M12 10 C12 10, 10 14, 11 17 C11.5 18.5, 12.5 18.5, 13 17 C14 14, 12 10, 12 10Z"
            fill={accentFaded} stroke="none"
          />
        </svg>
      );
    case "beach-balcony":
      // Horizon with sun arc
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ opacity }}>
          <path d="M2 16 Q12 10 22 16" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="10" r="3" fill="none" stroke={accent} strokeWidth="1.5" />
          <line x1="12" y1="5" x2="12" y2="6" stroke={accentFaded} strokeWidth="1" strokeLinecap="round" />
          <line x1="7" y1="7" x2="8" y2="8" stroke={accentFaded} strokeWidth="1" strokeLinecap="round" />
          <line x1="17" y1="7" x2="16" y2="8" stroke={accentFaded} strokeWidth="1" strokeLinecap="round" />
          <path d="M2 18 Q7 17 12 18 Q17 19 22 18" stroke={accentFaded} strokeWidth="1" fill="none" />
          <path d="M2 20 Q7 19 12 20 Q17 21 22 20" stroke={accentFaded} strokeWidth="0.8" fill="none" />
        </svg>
      );
    case "rainy-cafe":
      // Steam curls — café warmth
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ opacity }}>
          <path d="M8 14 C8 14, 7 10, 9 8 C11 6, 8 3, 8 1" stroke={accentFaded} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M12 14 C12 14, 11 11, 13 9 C15 7, 12 4, 12 2" stroke={accent} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M16 14 C16 14, 15 10, 17 8 C19 6, 16 3, 16 1" stroke={accentFaded} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <rect x="5" y="16" width="14" height="6" rx="2" fill="none" stroke={accent} strokeWidth="1.5" />
          <path d="M19 18 C21 18, 22 19, 21 20 C20 21, 19 20, 19 20" stroke={accentFaded} strokeWidth="1" fill="none" />
        </svg>
      );
    default:
      return <div className="w-3 h-3 rounded-full" style={{ background: accent }} />;
  }
};

const ThemePicker = ({ current, onChange }: ThemePickerProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((theme) => {
        const isActive = current.id === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => onChange(theme)}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 focus:outline-none"
            style={{
              background: isActive
                ? `hsla(${theme.accent}, 0.15)`
                : 'hsla(222, 40%, 12%, 0.4)',
              border: isActive
                ? `1px solid hsla(${theme.accent}, 0.4)`
                : '1px solid hsla(37, 60%, 50%, 0.06)',
              boxShadow: isActive
                ? `0 0 16px hsla(${theme.accent}, 0.25)`
                : 'none',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
            }}
            title={theme.name}
          >
            <ThemeIcon theme={theme} isActive={isActive} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemePicker;
