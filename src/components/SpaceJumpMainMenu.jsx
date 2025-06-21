import React, { useState } from "react";
import { Home, List, Trophy, Grid, User, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SpaceJumpMainMenu() {
  const [screen, setScreen] = useState("menu");

  const ScreenContent = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-white text-2xl">
      {title}
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden p-8 flex flex-col">
      {/* Новый CSS-анимированный звёздный фон */}
      <div className="absolute inset-0 z-0">
        <div className="stars-layer"></div>
      </div>

      {/* Верхняя панель */}
      <div className="absolute top-8 left-0 right-0 z-10 flex justify-between items-center px-4 md:px-8">
        {screen !== "menu" ? (
          <button onClick={() => setScreen("menu")} className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform">
            <img src="https://cdn-icons-png.flaticon.com/512/3791/3791513.png" alt="TON" className="w-6 h-6" />
          </div>
        )}
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-widest">SpaceJump</h1>
        <div className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform">
          <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" className="w-6 h-6" />
        </div>
      </div>

      {screen === "menu" && (
        <>
          {/* Главная кнопка Играть */}
          <div className="flex grow justify-center items-center z-10 relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setScreen("play")}
              className="bg-white text-black w-48 h-48 md:w-64 md:h-64 text-5xl md:text-6xl font-bold rounded-full shadow-2xl flex items-center justify-center neon-button"
            >
              ▶
            </motion.button>
          </div>

          {/* Нижнее меню */}
          <div className="absolute bottom-8 w-full flex justify-center gap-6 md:gap-12 z-10 text-white">
            <IconButton icon={<Home />} onClick={() => setScreen("home")}/>
            <IconButton icon={<List />} onClick={() => setScreen("list")}/>
            <IconButton icon={<Trophy />} onClick={() => setScreen("trophy")}/>
            <IconButton icon={<Grid />} onClick={() => setScreen("grid")}/>
            <IconButton icon={<User />} onClick={() => setScreen("profile")}/>
          </div>
        </>
      )}

      <AnimatePresence>
        {screen !== "menu" && (
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex grow items-center justify-center z-10"
          >
            <ScreenContent title={screen === "play" ? "Игра скоро" : screen === "home" ? "Главная" : screen === "list" ? "Таблица лидеров" : screen === "trophy" ? "Достижения" : screen === "grid" ? "Меню" : "Профиль"} />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .stars-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at bottom, #0d1b2a 0%, #000000 100%);
          overflow: hidden;
        }
        .stars-layer::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: transparent url('https://www.transparenttextures.com/patterns/stardust.png') repeat;
          animation: moveStars 60s linear infinite;
          opacity: 0.3;
        }

        @keyframes moveStars {
          from { transform: translateY(0); }
          to { transform: translateY(-1000px); }
        }

        .neon-button {
          box-shadow: 0 0 20px #00f6ff, 0 0 40px #00f6ff, 0 0 60px #00f6ff;
          transition: box-shadow 0.3s ease;
        }
        .neon-button:hover {
          box-shadow: 0 0 30px #00f6ff, 0 0 60px #00f6ff, 0 0 90px #00f6ff;
        }
        .neon-glow {
          box-shadow: 0 0 10px #00f6ff, 0 0 20px #00f6ff;
        }
        .icon-wrapper {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px #00f6ff, 0 0 20px #00f6ff;
        }
      `}</style>
    </div>
  );
}

function IconButton({ icon, onClick }) {
  return (
    <button onClick={onClick} className="hover:scale-105 transition-transform">
      <div className="icon-wrapper">
        {icon}
      </div>
    </button>
  );
}
