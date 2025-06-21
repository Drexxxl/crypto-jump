import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export default function DoodleJumpGame({ onExit, mode = "free", difficulty = "normal" }) {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const maxHeightRef = useRef(0);
  const [tons, setTons] = useState(0);
  const shieldRef = useRef(0);
  const nitroRef = useRef(0);
  const [showHint, setShowHint] = useState(true);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef(3);
  const initialLives = mode === "hardcore" ? 1 : 3;
  const [lives, setLives] = useState(initialLives);
  const livesRef = useRef(initialLives);
  const [survivalTime, setSurvivalTime] = useState(0);
  const startTimeRef = useRef(performance.now());
  const pauseStartRef = useRef(null);
  const [nitroActive, setNitroActive] = useState(false);

  const DIFFICULTY_SETTINGS = {
    easy: { platformCount: 14, speed: 0.9, breakableChance: 0.05 },
    normal: { platformCount: 10, speed: 1, breakableChance: 0.1 },
    hard: { platformCount: 8, speed: 1.2, breakableChance: 0.2 },
  };
  const diffSettings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.normal;

  const coinSound = useRef(null);

  const totalScore = Math.floor(maxHeightRef.current / 100) + score;

  const startCountdown = () => {
    setCountdown(3);
    countdownRef.current = 3;
    setPaused(true);
    pausedRef.current = true;
  };

  useEffect(() => {
    countdownRef.current = countdown;
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setPaused(false);
      pausedRef.current = false;
      return;
    }
    const id = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const togglePause = () => {
    if (pausedRef.current) {
      if (pauseStartRef.current) {
        startTimeRef.current += performance.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      startCountdown();
    } else {
      setPaused(true);
      pausedRef.current = true;
      pauseStartRef.current = performance.now();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setRestartKey((k) => k + 1);
    setTons(0);
    shieldRef.current = 0;
    nitroRef.current = 0;
    setLives(initialLives);
    livesRef.current = initialLives;
    setSurvivalTime(0);
    startTimeRef.current = performance.now();
    pauseStartRef.current = null;
    startCountdown();
  };

  useEffect(() => {
    const id = setInterval(() => {
      setNitroActive(nitroRef.current > performance.now());
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onPauseKey = (e) => {
      if (e.key.toLowerCase() === 'p') togglePause();
    };
    window.addEventListener('keydown', onPauseKey);
    return () => window.removeEventListener('keydown', onPauseKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    coinSound.current = new Audio(
      "https://cdn.jsdelivr.net/gh/jwilson8787/100-Sound-effects/Audio/coin1.wav"
    );
    const hintTimer = setTimeout(() => setShowHint(false), 3000);
    startTimeRef.current = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 80,
      vy: -8,
      vx: 0,
      w: 40,
      h: 40,
    };

    const platforms = [];
    const coins = [];
    const boosts = [];
    const pW = 60;
    const pH = 10;
    const count = diffSettings.platformCount;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (canvas.width - pW);
      const y = canvas.height - i * 80;
      const moving = Math.random() < 0.3;
      const vx = moving ? (Math.random() < 0.5 ? -1 : 1) * 2 : 0;
      const type = Math.random() < diffSettings.breakableChance ? "breakable" : "normal";
      const p = { x, y, vx, moving, type };
      platforms.push(p);
      if (Math.random() < 0.5) {
        coins.push({ x: x + pW / 2, y: y - 15, r: 6, phase: Math.random() * Math.PI * 2, platform: p });
      }
      if (Math.random() < 0.1) {
        const r = Math.random();
        let type = "spring";
        if (r < 0.33) type = "spring";
        else if (r < 0.66) type = "shield";
        else type = "nitro";
        boosts.push({ x: x + pW / 2, y: y - 25, type, platform: p });
      }
    }

    // стартовая платформа
    platforms.push({ x: canvas.width / 2 - pW / 2, y: canvas.height - 40, vx: 0, moving: false, floor: true });

    let worldY = 0;

    const keys = {};
    const keyDown = (e) => {
      keys[e.key] = true;
    };
    const keyUp = (e) => {
      keys[e.key] = false;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    let touchDir = 0;
    let startX = 0;
    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 20) touchDir = dx > 0 ? 1 : -1;
    };
    const onTouchEnd = () => {
      touchDir = 0;
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    let animId;

    startCountdown();
    const baseSpeed = 5 * diffSettings.speed;
    const jumpVy = -8;
    const baseGravity = 0.2 * diffSettings.speed;
    const loop = () => {
      if (pausedRef.current || countdownRef.current !== null) {
        animId = requestAnimationFrame(loop);
        return;
      }
      if (mode === "survival") {
        setSurvivalTime(Math.floor((performance.now() - startTimeRef.current) / 1000));
      }
      const progress =
        mode === "survival"
          ? 1 + survivalTime / 30
          : mode === "hardcore"
          ? 1.5 + maxHeightRef.current / 1000
          : 1 + maxHeightRef.current / 2000;

      const nitroBoost = nitroRef.current > performance.now() ? 1.5 : 1;
      const speed = baseSpeed * progress * nitroBoost;
      const gravity = baseGravity * progress;
      player.vy += gravity;
      player.y += player.vy;

      if (keys["ArrowLeft"] || touchDir === -1) player.vx -= 0.5 * progress;
      if (keys["ArrowRight"] || touchDir === 1) player.vx += 0.5 * progress;
      player.vx *= 0.9;
      player.x += player.vx * nitroBoost;
      if (player.x < -player.w) player.x = canvas.width;
      if (player.x > canvas.width) player.x = -player.w;

      for (let p of platforms) {
        if (p.moving) {
          p.x += p.vx * progress;
          if (p.x < 0 || p.x > canvas.width - pW) p.vx *= -1;
        }
      }

      if (player.vy > 0) {
        for (let i = 0; i < platforms.length; i++) {
          const p = platforms[i];
          if (
            player.x + player.w > p.x &&
            player.x < p.x + pW &&
            player.y + player.h > p.y &&
            player.y + player.h < p.y + pH &&
            player.vy > 0
          ) {
            player.vy = jumpVy;
            if (p.type === 'breakable' && !p.floor) {
              platforms.splice(i, 1);
              i--;
            }
          }
        }
      }

      if (player.y < canvas.height / 2) {
        const diff = canvas.height / 2 - player.y;
        player.y = canvas.height / 2;
        worldY += diff;
        maxHeightRef.current = Math.max(maxHeightRef.current, worldY);
        platforms.forEach((p) => {
          p.y += diff;
          if (p.y > canvas.height) {
            p.y = -pH;
            p.x = Math.random() * (canvas.width - pW);
            p.moving = Math.random() < 0.3;
            p.vx = p.moving ? (Math.random() < 0.5 ? -1 : 1) * 2 : 0;
            p.type = Math.random() < diffSettings.breakableChance ? 'breakable' : 'normal';
            if (Math.random() < 0.5) {
              coins.push({ x: p.x + pW / 2, y: p.y - 15, r: 6, phase: 0, platform: p });
            }
            if (Math.random() < 0.1) {
              const r = Math.random();
              let type = "spring";
              if (r < 0.33) type = "spring";
              else if (r < 0.66) type = "shield";
              else type = "nitro";
              boosts.push({ x: p.x + pW / 2, y: p.y - 25, type, platform: p });
            }
          }
        });
        coins.forEach((c, i) => {
          c.y += diff;
          if (c.y - c.r > canvas.height) coins.splice(i, 1);
        });
        boosts.forEach((b, i) => {
          b.y += diff;
          if (b.y > canvas.height) boosts.splice(i, 1);
        });
      }

      if (player.y > canvas.height) {
        if (shieldRef.current > performance.now()) {
          player.y = canvas.height - 100;
          player.vy = jumpVy;
        } else if (livesRef.current > 1) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          player.y = canvas.height - 100;
          player.vy = jumpVy;
        } else {
          setGameOver(true);
          cancelAnimationFrame(animId);
          return;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const drawRocket = (x, y, w, h, vy) => {
        const nitroOn = nitroRef.current > performance.now();
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(w / 40, h / 40);
        const bodyGrad = ctx.createLinearGradient(20, 0, 20, 40);
        bodyGrad.addColorStop(0, "#fff");
        bodyGrad.addColorStop(1, "#ccc");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(30, 10);
        ctx.lineTo(30, 30);
        ctx.lineTo(20, 40);
        ctx.lineTo(10, 30);
        ctx.lineTo(10, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f87171";
        ctx.beginPath();
        ctx.moveTo(20, -6);
        ctx.lineTo(32, 10);
        ctx.lineTo(8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(12, 18, 16, 8);
        if (vy < 0) {
          const flame = nitroOn ? 12 : 8;
          ctx.fillStyle = nitroOn ? "#fbbf24" : "orange";
          ctx.beginPath();
          ctx.moveTo(20, 40);
          ctx.lineTo(15, 40 + flame);
          ctx.lineTo(25, 40 + flame);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      };

      const drawRoundedRect = (x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      };

      ctx.textBaseline = "bottom";
      drawRocket(player.x, player.y, player.w, player.h, player.vy);
      if (shieldRef.current > performance.now()) {
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w, 0, Math.PI * 2);
        ctx.stroke();
      }
      platforms.forEach((p) => {
        let grad = ctx.createLinearGradient(0, 0, 0, pH);
        if (p.type === 'breakable') {
          grad.addColorStop(0, '#f87171');
          grad.addColorStop(1, '#ef4444');
        } else {
          grad.addColorStop(0, '#4ade80');
          grad.addColorStop(1, '#22d3ee');
        }
        ctx.fillStyle = grad;
        drawRoundedRect(p.x, p.y, pW, pH, 4);
      });

      // coins
      coins.forEach((c) => {
        c.phase += 0.1;
        const r = c.r * (1 + Math.sin(c.phase) * 0.3);
        ctx.fillStyle = "#0098ea";
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - r * 0.6);
        ctx.lineTo(c.x - r * 0.4, c.y + r * 0.6);
        ctx.lineTo(c.x + r * 0.4, c.y + r * 0.6);
        ctx.closePath();
        ctx.fill();
      });

      coins.forEach((c, i) => {
        const r = c.r;
        if (
          player.x + player.w > c.x - r &&
          player.x < c.x + r &&
          player.y + player.h > c.y - r &&
          player.y < c.y + r
        ) {
          coins.splice(i, 1);
          setScore((s) => s + 5);
          setTons((t) => t + 1);
          if (coinSound.current) {
            coinSound.current.currentTime = 0;
            coinSound.current.play().catch(() => {});
          }
        }
      });

      // boosts
      boosts.forEach((b) => {
        if (b.type === "spring") {
          ctx.fillStyle = "#4ade80";
          ctx.fillRect(b.x - 10, b.y - 5, 20, 10);
          ctx.fillRect(b.x - 4, b.y - 15, 8, 10);
        } else if (b.type === "shield") {
          ctx.strokeStyle = "#0ff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.moveTo(b.x, b.y - 8);
          ctx.lineTo(b.x + 8, b.y + 8);
          ctx.lineTo(b.x - 8, b.y + 8);
          ctx.closePath();
          ctx.fill();
        }
      });

      boosts.forEach((b, i) => {
        const br = 12;
        if (
          player.x + player.w > b.x - br &&
          player.x < b.x + br &&
          player.y + player.h > b.y - br &&
          player.y < b.y + br
        ) {
          boosts.splice(i, 1);
          if (b.type === "spring") {
            player.vy = jumpVy * 1.5;
          } else if (b.type === "shield") {
            shieldRef.current = performance.now() + 2000 + Math.random() * 4000;
          } else {
            nitroRef.current = performance.now() + 3000;
          }
        }
      });
      ctx.fillStyle = "#fff";
      const heightScore = Math.floor(maxHeightRef.current / 100);
      const text =
        mode === "survival"
          ? `Time: ${survivalTime}s TON: ${tons}`
          : `Score: ${heightScore + score} TON: ${tons}`;
      if (mode === "hardcore") {
        ctx.fillStyle = "#f87171";
        ctx.fillText("HC", 10, 40);
        ctx.fillStyle = "#fff";
      }
      ctx.fillText(text, 10, 20);

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      clearTimeout(hintTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("resize", resize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [restartKey]);

  return (
    <div className="relative text-white flex flex-col items-center justify-center w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="stars-layer" />
      </div>

      <div className="absolute top-0 left-0 w-full p-2 sm:p-4 flex justify-between items-center text-xs sm:text-base bg-black/30 backdrop-blur-md border-b border-white/20 z-20">
        <div className="flex items-center gap-2">
          <button
            title="Back"
            onClick={onExit}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
          >
            ←
          </button>
          <button
            title={paused ? 'Resume' : 'Pause'}
            onClick={togglePause}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
          >
            {paused ? '▶' : '⏸'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
            {mode === "survival" ? (
              <>
                <span>⏱</span>
                <span className="font-semibold">{survivalTime}</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span className="font-semibold">{totalScore}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
            <span>❤️</span>
            <span className="font-semibold">{lives}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
            <span>Lvl</span>
            <span className="font-semibold">
              {difficulty === 'easy' ? '1' : difficulty === 'hard' ? '3' : '2'}
            </span>
          </div>
        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-4 h-4 fill-current text-cyan-400">
              <circle cx="32" cy="32" r="30" fill="#0098ea" />
              <path fill="#fff" d="M32 16L16 48h32L32 16z" />
            </svg>
            <span className="font-semibold">{tons}</span>
          </div>
          {nitroActive && (
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
              <span>⚡</span>
            </div>
          )}
        </div>
      </div>

      {showHint && !gameOver && (
        <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-2 rounded text-xs sm:text-sm z-20">
          Используйте стрелки или свайпы для перемещения
        </div>
      )}

      {paused && !gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 text-center">
          <p className="text-xl mb-4">Пауза</p>
          <Button onClick={togglePause}>Продолжить</Button>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70 text-6xl font-bold">
          {countdown}
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center">
          <p className="text-xl mb-2">Game Over</p>
          {mode === "survival" ? (
            <p className="mb-2">Time: {survivalTime}s | TON: {tons}</p>
          ) : (
            <p className="mb-2">Score: {totalScore} | TON: {tons}</p>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRestart}>Перезапуск</Button>
            <Button onClick={onExit}>В меню</Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="relative z-10 w-full h-full border border-white/20 rounded-md" />
    </div>
  );
}
