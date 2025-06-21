import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export default function DoodleJumpGame({ onExit }) {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const maxHeightRef = useRef(0);

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setRestartKey((k) => k + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

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
      w: 40,
      h: 40,
    };

    const platforms = [];
    const coins = [];
    const pW = 60;
    const pH = 10;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (canvas.width - pW);
      const y = canvas.height - i * 80;
      const moving = Math.random() < 0.3;
      const vx = moving ? (Math.random() < 0.5 ? -1 : 1) * 2 : 0;
      const p = { x, y, vx, moving };
      platforms.push(p);
      if (Math.random() < 0.5) {
        coins.push({ x: x + pW / 2, y: y - 15, r: 6, phase: Math.random() * Math.PI * 2, platform: p });
      }
    }

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
    const speed = 5;
    const jumpVy = -8;
    const gravity = 0.2;
    const loop = () => {
      player.vy += gravity;
      player.y += player.vy;
      if (keys["ArrowLeft"] || touchDir === -1) player.x -= speed;
      if (keys["ArrowRight"] || touchDir === 1) player.x += speed;
      if (player.x < -player.w) player.x = canvas.width;
      if (player.x > canvas.width) player.x = -player.w;

      platforms.forEach((p) => {
        if (p.moving) {
          p.x += p.vx;
          if (p.x < 0 || p.x > canvas.width - pW) p.vx *= -1;
        }
      });

      if (player.vy > 0) {
        platforms.forEach((p) => {
          if (
            player.x + player.w > p.x &&
            player.x < p.x + pW &&
            player.y + player.h > p.y &&
            player.y + player.h < p.y + pH &&
            player.vy > 0
          ) {
            player.vy = jumpVy;
          }
        });
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
            if (Math.random() < 0.5) {
              coins.push({ x: p.x + pW / 2, y: p.y - 15, r: 6, phase: 0, platform: p });
            }
          }
        });
        coins.forEach((c, i) => {
          c.y += diff;
          if (c.y - c.r > canvas.height) coins.splice(i, 1);
        });
      }

      if (player.y > canvas.height) {
        setGameOver(true);
        cancelAnimationFrame(animId);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = "bottom";
      ctx.font = player.h + "px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText("🚀", player.x, player.y + player.h);
      if (player.vy < 0) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(player.x + player.w / 2, player.y + player.h);
        ctx.lineTo(player.x + player.w / 2 - 5, player.y + player.h + 10);
        ctx.lineTo(player.x + player.w / 2 + 5, player.y + player.h + 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "#0f0";
      platforms.forEach((p) => ctx.fillRect(p.x, p.y, pW, pH));

      // coins
      coins.forEach((c) => {
        c.phase += 0.1;
        const r = c.r * (1 + Math.sin(c.phase) * 0.3);
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "orange";
        ctx.stroke();
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
        }
      });
      ctx.fillStyle = "#fff";
      const heightScore = Math.floor(maxHeightRef.current / 100);
      ctx.fillText("Score: " + (heightScore + score), 10, 20);

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
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
    <div className="text-white flex flex-col items-center justify-center w-screen h-screen">
      {gameOver && (
        <div className="mb-4 text-center">
          <p className="text-xl">Game Over</p>
          <p className="mb-2">Score: {Math.floor(maxHeightRef.current / 100) + score}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRestart}>Перезапуск</Button>
            <Button onClick={onExit}>В меню</Button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full border border-white block" />
    </div>
  );
}
