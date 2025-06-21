import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export default function DoodleJumpGame({ onExit }) {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

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
    const pW = 60;
    const pH = 10;
    for (let i = 0; i < 7; i++) {
      platforms.push({ x: Math.random() * (canvas.width - pW), y: i * 80 });
    }

    const keys = {};
    const keyDown = (e) => {
      keys[e.key] = true;
    };
    const keyUp = (e) => {
      keys[e.key] = false;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    let animId;
    const loop = () => {
      player.vy += 0.2;
      player.y += player.vy;
      if (keys["ArrowLeft"]) player.x -= 4;
      if (keys["ArrowRight"]) player.x += 4;
      if (player.x < -player.w) player.x = canvas.width;
      if (player.x > canvas.width) player.x = -player.w;

      if (player.vy > 0) {
        platforms.forEach((p) => {
          if (
            player.x + player.w > p.x &&
            player.x < p.x + pW &&
            player.y + player.h > p.y &&
            player.y + player.h < p.y + pH &&
            player.vy > 0
          ) {
            player.vy = -8;
          }
        });
      }

      if (player.y < canvas.height / 2) {
        const diff = canvas.height / 2 - player.y;
        player.y = canvas.height / 2;
        platforms.forEach((p) => {
          p.y += diff;
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * (canvas.width - pW);
            setScore((s) => s + 1);
          }
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
      ctx.fillStyle = "#0f0";
      platforms.forEach((p) => ctx.fillRect(p.x, p.y, pW, pH));
      ctx.fillStyle = "#fff";
      ctx.fillText("Score: " + score, 10, 20);

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="text-white flex flex-col items-center justify-center w-screen h-screen">
      {gameOver && (
        <div className="mb-4 text-center">
          <p className="text-xl">Game Over</p>
          <p className="mb-2">Score: {score}</p>
          <Button onClick={onExit}>В меню</Button>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full border border-white block" />
    </div>
  );
}
