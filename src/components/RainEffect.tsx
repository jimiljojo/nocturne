import { useMemo } from "react";

const RainEffect = () => {
  const drops = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1.5 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.25,
      width: 1 + Math.random() * 1,
      height: 15 + Math.random() * 20,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute rounded-full"
          style={{
            left: `${drop.left}%`,
            width: `${drop.width}px`,
            height: `${drop.height}px`,
            background: `linear-gradient(to bottom, transparent, hsla(210, 30%, 70%, ${drop.opacity}))`,
            animation: `rain-fall ${drop.duration}s linear ${drop.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default RainEffect;
