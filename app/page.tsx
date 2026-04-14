import Image from "next/image";
import DaysCounter from "@/app/components/DaysCounter";
import { PHOTOS, MEMORIES, HEARTS } from "@/lib/content";

export default function Home() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a0010 0%, #3d0024 30%, #7f1d3f 60%, #be185d 100%)",
      }}
    >
      {/* Floating hearts */}
      {HEARTS.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
            color: "#fb7185",
          }}
          aria-hidden="true"
        >
          ♥
        </span>
      ))}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-rose-300 text-sm tracking-[0.4em] uppercase mb-6 font-light">
            A love letter
          </p>
          <h1
            className="shimmer-text font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
          >
            To the Love of My Life
          </h1>
          <p className="text-rose-100 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed mb-16">
            Every moment with you is a gift I never knew I needed.
            You are my favourite person, my safe place, my greatest joy.
          </p>
        </div>

        <div className="fade-in-up" style={{ animationDelay: "0.4s" }}>
          <DaysCounter />
        </div>

        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-rose-300 text-2xl"
          aria-hidden="true"
        >
          ↓
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 max-w-3xl mx-auto">
        <h2 className="shimmer-text text-4xl md:text-5xl font-bold text-center mb-16">
          Our Story
        </h2>

        <div className="relative">
          <div
            className="absolute left-6 top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #fb7185, transparent)",
            }}
          />

          <ul className="flex flex-col gap-12 pl-16">
            {MEMORIES.map((m, i) => (
              <li
                key={i}
                className="fade-in-up relative"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <span className="absolute -left-[2.75rem] top-1 w-4 h-4 rounded-full bg-rose-400 border-2 border-rose-200 shadow-lg" />
                <p className="text-rose-300 text-xs tracking-widest uppercase font-light mb-1">
                  {m.date}
                </p>
                <h3 className="text-white text-xl font-semibold mb-2">
                  {m.emoji} {m.title}
                </h3>
                <p className="text-rose-100 text-base font-light leading-relaxed">
                  {m.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Photo Gallery ──────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="shimmer-text text-4xl md:text-5xl font-bold text-center mb-4">
            Our Memories
          </h2>
          <p className="text-rose-300 text-center text-sm font-light mb-16 tracking-wide">
            Drop your photos into{" "}
            <code className="bg-white/10 px-2 py-0.5 rounded text-rose-200">
              public/photos/
            </code>{" "}
            to fill this gallery
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PHOTOS.map((filename) => (
              <div
                key={filename}
                className="relative rounded-2xl overflow-hidden shadow-xl border border-rose-500/20"
                style={{ aspectRatio: "1 / 1" }}
              >
                <Image
                  src={`/photos/${filename}`}
                  alt={`Our memory`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-32 text-center max-w-2xl mx-auto">
        <p className="text-rose-200 text-2xl md:text-3xl font-light leading-relaxed italic mb-10">
          &ldquo;In all the world, there is no heart for me like yours.
          In all the world, there is no love for you like mine.&rdquo;
        </p>
        <p className="text-rose-400 text-sm tracking-widest uppercase font-light">
          — Maya Angelou
        </p>
        <div className="mt-16 text-6xl animate-pulse" style={{ color: "#fb7185" }}>
          ♥
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center py-8 text-rose-400 text-xs font-light tracking-widest border-t border-rose-900/40">
        Made with ♥ · Since November 21, 2024
      </footer>
    </div>
  );
}
