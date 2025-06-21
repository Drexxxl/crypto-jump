import React, { useState } from "react";
import {
  Home,
  List,
  Trophy,
  Grid,
  User,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SpaceJumpMainMenu() {
  const [screen, setScreen] = useState("menu");

  const titles = {
    play: "Игра скоро",
    home: "Главная",
    list: "Таблица лидеров",
    trophy: "Достижения",
    grid: "Меню",
    profile: "Профиль",
    ton: "О проекте",
    settings: "Настройки",
  };

  const ScreenContent = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-white text-2xl">
      {title}
    </div>
  );

  return (
    <div className="relative w-full min-h-screen lg:h-screen bg-black overflow-hidden p-4 md:p-8 flex flex-col items-center max-w-md md:max-w-2xl xl:max-w-none mx-auto">
      {/* Новый CSS-анимированный звёздный фон */}
      <div className="absolute inset-0 z-0">
        <div className="stars-layer"></div>
      </div>

      {/* Основное меню, затемняется и размывается при открытии окон */}
      <div className={`${screen !== "menu" ? "filter blur-sm brightness-50 pointer-events-none" : ""} relative flex flex-col items-center grow w-full`}>
        <div className="absolute top-4 md:top-8 left-0 right-0 z-10 flex justify-between items-center px-4 md:px-8">
          <button
            onClick={() => setScreen("ton")}
            className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform"
            aria-label="О проекте"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/3791/3791513.png" alt="TON" className="w-6 h-6" />
          </button>
          <h1 className="text-white text-4xl md:text-5xl font-black tracking-widest">
            SpaceJump
          </h1>
          <button
            onClick={() => setScreen("settings")}
            className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform"
            aria-label="Настройки"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence>
          {screen === "menu" && (
            <>
              {/* Главная кнопка Играть */}
              <motion.div
                key="play"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex grow justify-center items-center z-10 relative"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setScreen("play")}
                  className="bg-white text-black w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 text-5xl md:text-6xl font-bold rounded-full shadow-2xl flex items-center justify-center neon-button"
                >
                  ▶
                </motion.button>
              </motion.div>

              {/* Нижнее меню */}
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-4 md:bottom-8 w-full flex justify-center gap-6 md:gap-12 z-10 text-white"
              >
                <IconButton ariaLabel="Главная" icon={<Home />} onClick={() => setScreen("home")}/>
                <IconButton ariaLabel="Лидеры" icon={<List />} onClick={() => setScreen("list")}/>
                <IconButton ariaLabel="Достижения" icon={<Trophy />} onClick={() => setScreen("trophy")}/>
                <IconButton ariaLabel="Меню" icon={<Grid />} onClick={() => setScreen("grid")}/>
                <IconButton ariaLabel="Профиль" icon={<User />} onClick={() => setScreen("profile")}/>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Всплывающие окна поверх меню */}
      <AnimatePresence>
        {screen !== "menu" && (
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col bg-black/70 backdrop-blur-lg"
          >
            <div className="flex justify-between items-center px-4 md:px-8 pt-4 md:pt-8">
              <button
                onClick={() => setScreen("menu")}
                className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform"
                aria-label="Назад"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-white text-4xl md:text-5xl font-black tracking-widest">
                SpaceJump
              </h1>
              <span className="w-12 h-12" />
            </div>
            <div className="flex grow items-center justify-center z-20">
              <ScreenContent title={titles[screen]} />
            </div>
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
          animation: moveStars 90s linear infinite;
          opacity: 0.3;
          will-change: transform;
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
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function IconButton({ icon, onClick, ariaLabel }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className="hover:scale-105 transition-transform">
      <div className="icon-wrapper">
        {icon}
      </div>
    </button>
  );
}
