"use client";

import { useState, useEffect } from "react";
import { calcDays } from "@/lib/date-utils";

export default function DaysCounter() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(calcDays());
    const id = setInterval(() => setDays(calcDays()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-rose-200 text-lg font-light tracking-widest uppercase">
        Together for
      </p>
      <div
        className="pulse-glow text-white font-bold leading-none tabular-nums"
        style={{ fontSize: "clamp(4rem, 12vw, 9rem)" }}
      >
        {days === null ? "—" : days}
      </div>
      <p className="text-rose-200 text-2xl font-light tracking-widest uppercase">
        {days === 1 ? "day" : "days"}
      </p>
      <p className="text-rose-300 text-sm mt-2 font-light">
        Since November 21, 2024
      </p>
    </div>
  );
}
