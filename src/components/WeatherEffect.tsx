import { useMemo } from "react";

interface WeatherEffectProps {
  type: "rain" | "snow" | "fireflies" | "none";
}

const WeatherEffect = ({ type }: WeatherEffectProps) => {
  const elements = useMemo(() => {
    if (type === "none") return [];
    const count = type === "rain" ? 80 : type === "snow" ? 60 : 25;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: type === "rain" ? 1.5 + Math.random() * 1.5
        : type === "snow" ? 5 + Math.random() * 7
        : 3 + Math.random() * 5,
      opacity: type === "rain" ? 0.15 + Math.random() * 0.25
        : type === "snow" ? 0.3 + Math.random() * 0.5
        : 0.3 + Math.random() * 0.5,
      size: type === "rain" ? 1 + Math.random() * 1
        : type === "snow" ? 3 + Math.random() * 4
        : 2 + Math.random() * 3,
      height: type === "rain" ? 15 + Math.random() * 20 : 0,
      swayAmount: type === "snow" ? -30 + Math.random() * 60 : 0,
    }));
  }, [type]);

  if (type === "none") return null;

  if (type === "rain") {
    return (
      <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
        {elements.map((drop) => (
          <div
            key={drop.id}
            className="absolute rounded-full"
            style={{
              left: `${drop.left}%`,
              width: `${drop.size}px`,
              height: `${drop.height}px`,
              background: `linear-gradient(to bottom, transparent, hsla(210, 30%, 70%, ${drop.opacity}))`,
              animation: `rain-fall ${drop.duration}s linear ${drop.delay}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "snow") {
    return (
      <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
        {elements.map((flake) => (
          <div
            key={flake.id}
            className="absolute rounded-full"
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              background: `radial-gradient(circle, hsla(210, 50%, 95%, ${flake.opacity}), transparent)`,
              animation: `snow-fall ${flake.duration}s linear ${flake.delay}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  // fireflies
  return (
    <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
      {elements.map((fly) => (
        <div
          key={fly.id}
          className="absolute rounded-full"
          style={{
            left: `${fly.left}%`,
            top: `${20 + Math.random() * 60}%`,
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            background: `radial-gradient(circle, hsla(45, 90%, 65%, ${fly.opacity}), transparent)`,
            boxShadow: `0 0 ${fly.size * 3}px hsla(45, 90%, 60%, ${fly.opacity * 0.5})`,
            animation: `firefly-float ${fly.duration}s ease-in-out ${fly.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default WeatherEffect;
