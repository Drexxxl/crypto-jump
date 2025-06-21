import React, { useMemo } from "react";

export default function GameScene({ onExit }) {
  const platforms = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        top: 100 + i * 60,
        left: Math.random() * 80 + 10,
      })),
    []
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="stars-layer" />
      </div>

      {/* Top bar UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 text-white text-lg bg-black/30 backdrop-blur-sm border-b border-white/10">
        <button
          title="Back"
          onClick={onExit}
          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold tracking-widest drop-shadow-md">SpaceJump</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
            <span>🚀</span>
            <span className="font-semibold">0</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-5 h-5 fill-current text-cyan-400">
              <circle cx="32" cy="32" r="30" fill="#0098ea" />
              <path fill="#fff" d="M32 16L16 48h32L32 16z" />
            </svg>
            <span className="font-semibold">0</span>
          </div>
        </div>
      </div>

      {/* Coins */}
      {platforms.map((p, i) => (
        <svg
          key={`coin-${i}`}
          className="absolute w-6 h-6 z-10 animate-bounce"
          style={{ top: `${p.top - 30}px`, left: `${p.left + 5}%` }}
          viewBox="0 0 24 24"
          fill="gold"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="orange" strokeWidth="2" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="black">$</text>
        </svg>
      ))}

      {/* Platforms */}
      {platforms.map((p, i) => (
        <div
          key={i}
          className="absolute w-24 h-2 bg-gradient-to-r from-green-400 to-lime-500 rounded-full shadow-xl border border-white/10 hover:scale-105 transition-transform duration-200"
          style={{ top: `${p.top}px`, left: `${p.left}%` }}
        />
      ))}

      {/* Rocket */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          className="w-16 h-16 animate-bounce drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
        >
          <path fill="#ccc" d="M32 2C20 14 14 32 14 32s6 6 18 6 18-6 18-6-6-18-18-30z" />
          <circle cx="32" cy="32" r="4" fill="#00f" />
          <path d="M18 34l-6 6 6 6 6-6-6-6zM46 34l6 6-6 6-6-6 6-6z" fill="#e00" />
          <path d="M30 38v8h4v-8h-4z" fill="#ff9800" />
          <path d="M30 46c0 4 4 10 2 16 2-6 6-12 2-16h-4z" fill="#ff5722" />
        </svg>
      </div>

      <style jsx>{`
        .stars-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at bottom, #0d1b2a 0%, #000000 100%);
          overflow: hidden;
        }
        .stars-layer::before {
          content: "";
          position: absolute;
          width: 200%;
          height: 200%;
          background: transparent url("https://www.transparenttextures.com/patterns/stardust.png") repeat;
          animation: scrollStars 60s linear infinite;
          opacity: 0.3;
        }
        @keyframes scrollStars {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-1000px);
          }
        }
      `}</style>
    </div>
  );
}
