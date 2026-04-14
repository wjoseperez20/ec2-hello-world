export interface Memory {
  date: string;
  emoji: string;
  title: string;
  description: string;
}

export interface Heart {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
}

export const PHOTOS: string[] = [
  "photo1.jpg",
  "photo2.jpg",
  "photo3.jpg",
  "photo4.jpg",
  "photo5.jpg",
  "photo6.jpg",
];

export const MEMORIES: Memory[] = [
  {
    date: "November 21, 2024",
    emoji: "💌",
    title: "The Beginning",
    description:
      "The day everything changed. The day I realised you were the person I had been looking for.",
  },
  {
    date: "December 2024",
    emoji: "🎄",
    title: "First Holiday Season Together",
    description:
      "Warm lights, warm hands, and the warmest heart. Our first Christmas felt like magic.",
  },
  {
    date: "February 14, 2025",
    emoji: "🌹",
    title: "First Valentine's Day",
    description:
      "You make every day feel like Valentine's, but this one was extra special.",
  },
  {
    date: "A random Tuesday",
    emoji: "☕",
    title: "The Everyday Moments",
    description:
      "Morning coffee, lazy afternoons, little laughs — the ordinary days that become the best memories.",
  },
  {
    date: "Coming soon…",
    emoji: "✈️",
    title: "Adventures Ahead",
    description:
      "So many places to explore together. Every destination is perfect when you are beside me.",
  },
];

// Deterministic seeds so SSR and client render identical markup
export const HEARTS: Heart[] = [
  { id: 1,  left: "5%",  size: "1.4rem", delay: "0s",   duration: "12s" },
  { id: 2,  left: "12%", size: "1rem",   delay: "2s",   duration: "15s" },
  { id: 3,  left: "22%", size: "1.8rem", delay: "5s",   duration: "10s" },
  { id: 4,  left: "30%", size: "1.1rem", delay: "1s",   duration: "14s" },
  { id: 5,  left: "40%", size: "2rem",   delay: "7s",   duration: "11s" },
  { id: 6,  left: "50%", size: "1.3rem", delay: "3s",   duration: "16s" },
  { id: 7,  left: "60%", size: "1.6rem", delay: "9s",   duration: "13s" },
  { id: 8,  left: "70%", size: "1rem",   delay: "4s",   duration: "18s" },
  { id: 9,  left: "78%", size: "1.9rem", delay: "6s",   duration: "9s"  },
  { id: 10, left: "88%", size: "1.2rem", delay: "11s",  duration: "14s" },
  { id: 11, left: "94%", size: "1.5rem", delay: "0.5s", duration: "17s" },
  { id: 12, left: "18%", size: "0.9rem", delay: "13s",  duration: "12s" },
];
