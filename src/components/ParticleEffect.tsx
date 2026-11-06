import { useMemo } from "react";

const ParticleEffect = ({ intensity = 1 }: { intensity?: number }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: Math.random() * 30,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[4] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, hsla(37, 80%, 60%, ${0.4 * intensity}), transparent)`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
