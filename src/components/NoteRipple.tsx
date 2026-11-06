import { useState, useCallback } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const NoteRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 800);
  }, []);

  return { ripples, addRipple, RippleLayer: () => (
    <div className="fixed inset-0 pointer-events-none z-[5]">
      {ripples.map(r => (
        <div
          key={r.id}
          className="absolute rounded-full border border-primary/30"
          style={{
            left: r.x,
            top: r.y,
            width: 30,
            height: 30,
            transform: 'translate(-50%, -50%)',
            animation: 'ripple-out 0.8s ease-out forwards',
          }}
        />
      ))}
    </div>
  )};
};

export default NoteRipple;
