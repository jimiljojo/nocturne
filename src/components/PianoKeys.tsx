import { useState, useEffect, useCallback } from "react";
import { setNoteCallback } from "@/lib/pianoEngine";

// 13 white keys spanning C4 to A5
const KEY_COUNT = 13;
const KEY_NAMES = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E", "F", "G", "A"];

// Map a frequency to the closest key index (0-12) on our visual keyboard
// We map the note name (pitch class) to a key position
function freqToKeyIndex(freq: number): number {
  // Convert frequency to MIDI note number
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  // Get pitch class (0=C, 1=C#, 2=D, ... 11=B)
  const pitchClass = midi % 12;
  // Map pitch class to white key index (skip black keys)
  // C=0, D=1, E=2, F=3, G=4, A=5, B=6, then repeat
  const whiteKeyMap: Record<number, number> = {
    0: 0,  // C
    1: 0,  // C# → C
    2: 1,  // D
    3: 1,  // D# → D
    4: 2,  // E
    5: 3,  // F
    6: 3,  // F# → F
    7: 4,  // G
    8: 4,  // G# → G
    9: 5,  // A
    10: 5, // A# → A
    11: 6, // B
  };
  const baseKey = whiteKeyMap[pitchClass] ?? 0;
  // Use octave to offset into our 13-key range (two octaves of white keys)
  const octave = Math.floor(midi / 12) - 4; // relative to octave 4
  return Math.max(0, Math.min(KEY_COUNT - 1, baseKey + octave * 7));
}

const PianoKeys = () => {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  const handleNote = useCallback((freq: number, duration: number) => {
    const key = freqToKeyIndex(freq);
    setActiveKeys(prev => new Set(prev).add(key));
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, Math.min(duration, 500));
  }, []);

  useEffect(() => {
    setNoteCallback(handleNote);
    return () => setNoteCallback(null);
  }, [handleNote]);

  return (
    <div className="flex items-end justify-center gap-[2px] h-16 pointer-events-none select-none">
      {Array.from({ length: KEY_COUNT }, (_, i) => {
        const isActive = activeKeys.has(i);
        return (
          <div
            key={i}
            className="relative flex flex-col items-center"
          >
            <div
              className="w-7 md:w-9 rounded-t-sm transition-all duration-150"
              style={{
                height: isActive ? 52 : 44,
                background: isActive
                  ? 'linear-gradient(180deg, hsl(37 90% 55%), hsl(37 70% 40%))'
                  : 'linear-gradient(180deg, hsl(37 20% 85%), hsl(37 15% 75%))',
                boxShadow: isActive
                  ? '0 0 16px hsla(37, 90%, 55%, 0.6), inset 0 -2px 4px hsla(37, 90%, 40%, 0.3)'
                  : 'inset 0 -2px 4px hsla(222, 40%, 10%, 0.2), 0 1px 3px hsla(222, 40%, 10%, 0.3)',
                borderLeft: '1px solid hsla(222, 20%, 60%, 0.2)',
                borderRight: '1px solid hsla(222, 20%, 60%, 0.2)',
                borderTop: '1px solid hsla(222, 20%, 70%, 0.3)',
                transform: isActive ? 'scaleY(1.08)' : 'scaleY(1)',
                transformOrigin: 'bottom',
              }}
            />
            <span
              className="text-[8px] font-body mt-0.5 transition-colors duration-150"
              style={{
                color: isActive ? 'hsl(37, 90%, 55%)' : 'hsla(37, 20%, 60%, 0.4)',
              }}
            >
              {KEY_NAMES[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PianoKeys;
