import cozyDesk from "@/assets/cozy-desk.jpg";
import snowCottage from "@/assets/theme-snow-cottage.jpg";
import fireplace from "@/assets/theme-fireplace.jpg";
import beachBalcony from "@/assets/theme-beach-balcony.jpg";
import rainyCafe from "@/assets/theme-rainy-cafe.jpg";

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  accent: string; // HSL color for theme swatch
  image: string;
  weatherEffect: "rain" | "snow" | "fireflies" | "none";
  particleColor: string;
  bloomHue: number;
  brightness: number;
  saturation: number;
}

export const THEMES: Theme[] = [
  {
    id: "rainy-desk",
    name: "Rainy Night Desk",
    emoji: "🌧️",
    accent: "220, 60%, 50%",
    image: cozyDesk,
    weatherEffect: "rain",
    particleColor: "37, 80%, 60%",
    bloomHue: 37,
    brightness: 0.3,
    saturation: 0.8,
  },
  {
    id: "snow-cottage",
    name: "Snow Cottage",
    emoji: "❄️",
    accent: "200, 30%, 75%",
    image: snowCottage,
    weatherEffect: "snow",
    particleColor: "210, 40%, 80%",
    bloomHue: 210,
    brightness: 0.3,
    saturation: 0.7,
  },
  {
    id: "fireplace",
    name: "Fireplace Vibes",
    emoji: "🔥",
    accent: "15, 85%, 50%",
    image: fireplace,
    weatherEffect: "fireflies",
    particleColor: "25, 90%, 55%",
    bloomHue: 25,
    brightness: 0.25,
    saturation: 0.9,
  },
  {
    id: "beach-balcony",
    name: "Beach Balcony",
    emoji: "🌅",
    accent: "35, 75%, 55%",
    image: beachBalcony,
    weatherEffect: "fireflies",
    particleColor: "35, 70%, 60%",
    bloomHue: 35,
    brightness: 0.35,
    saturation: 0.85,
  },
  {
    id: "rainy-cafe",
    name: "Rainy Café",
    emoji: "☕",
    accent: "340, 45%, 45%",
    image: rainyCafe,
    weatherEffect: "rain",
    particleColor: "340, 60%, 60%",
    bloomHue: 340,
    brightness: 0.3,
    saturation: 0.8,
  },
];

export const DEFAULT_THEME = THEMES[0];
