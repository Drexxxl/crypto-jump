import React, { useState } from "react";
import {
  Home,
  List,
  Trophy,
  Grid,
  User,
  Users,
  Shield,
  RotateCcw,
  Zap,
  Share2,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import DoodleJumpGame from "./game/DoodleJumpGame";

export default function SpaceJumpMainMenu() {
  const [screen, setScreen] = useState("menu");
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");


  const titles = {
    play: "Режим игры",
    list: "Таблица лидеров",
    trophy: "Достижения",
    grid: "Магазин",
    profile: "Профиль",
    ton: "О проекте",
    settings: "Настройки",
    referral: "Рефералы",
    free: "Бесплатная игра",
    survival: "Выживание",
    hardcore: "Хардкор",
    difficulty: "Сложность",
    game: "Игра",
  };

  const ScreenContent = () => {
    switch (screen) {
      case "play":
        return (
          <GameModeMenu
            onSelect={(m) => {
              setGameMode(m);
              setScreen("difficulty");
            }}
          />
        );
      case "difficulty":
        return (
          <DifficultyMenu
            onSelect={(d) => {
              setDifficulty(d);
              setScreen("game");
            }}
            onBack={() => setScreen("play")}
          />
        );
      case "game":
        return (
          <DoodleJumpGame
            mode={gameMode || "free"}
            difficulty={difficulty}
            onExit={() => setScreen("menu")}
          />
        );
      case "list":
        return <Leaderboard />;
      case "trophy":
        return <Achievements />;
      case "grid":
        return <Shop />;
      case "profile":
        return <Profile />;
      case "referral":
        return <Referral />;
      case "ton":
        return <About />;
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-screen min-h-screen lg:h-screen bg-black overflow-hidden p-4 md:p-8 flex flex-col items-center mx-auto">
      {/* Новый CSS-анимированный звёздный фон */}
      <div className="absolute inset-0 z-0">
        <div className="stars-layer"></div>
      </div>

      {/* Основное меню, затемняется и размывается при открытии окон */}
      <div className={`${screen !== "menu" ? "filter blur-sm brightness-50 pointer-events-none" : ""} relative flex flex-col items-center grow w-full`}>
        <div className="absolute top-4 md:top-8 left-0 right-0 z-10 flex flex-col items-center gap-2 px-4 md:px-8">
          <div className="hidden md:flex justify-between items-center w-full">
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
          <div className="md:hidden flex flex-col items-center gap-2 w-full">
            <h1 className="text-white text-4xl font-black tracking-widest">SpaceJump</h1>
            <div className="flex justify-between w-full">
              <button
                onClick={() => setScreen("ton")}
                className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform"
                aria-label="О проекте"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/3791/3791513.png" alt="TON" className="w-6 h-6" />
              </button>
              <button
                onClick={() => setScreen("settings")}
                className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform"
                aria-label="Настройки"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" className="w-6 h-6" />
              </button>
            </div>
          </div>
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
                  className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 text-5xl md:text-6xl font-bold rounded-full shadow-2xl flex items-center justify-center neon-button"
                >
                  JUMP
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
                <IconButton ariaLabel="Главная" icon={<Home />} onClick={() => setScreen("menu")}/>
                <IconButton ariaLabel="Лидеры" icon={<List />} onClick={() => setScreen("list")}/>
                <IconButton ariaLabel="Достижения" icon={<Trophy />} onClick={() => setScreen("trophy")}/>
                <IconButton ariaLabel="Меню" icon={<Grid />} onClick={() => setScreen("grid")}/>
                <IconButton ariaLabel="Профиль" icon={<User />} onClick={() => setScreen("profile")}/>
                <IconButton ariaLabel="Рефералы" icon={<Users />} onClick={() => setScreen("referral")}/>
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
            className={`absolute inset-0 z-20 flex flex-col ${
              screen === "game"
                ? "bg-black"
                : "bg-black/70 backdrop-blur-lg"
            }`}
          >
            {screen !== "game" && (
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
            )}
            <div className="flex grow items-center justify-center z-20">
              <div className={`w-full ${screen === "game" ? "h-full" : "max-w-md"}`}>
                {screen !== "game" && (
                  <h2 className="panel-header text-white">
                    {titles[screen]}
                  </h2>
                )}
                <ScreenContent />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .neon-button {
          box-shadow: 0 0 20px #8b5cf6, 0 0 40px #3b82f6, 0 0 60px #06b6d4;
          transition: box-shadow 0.3s ease;
        }
        .neon-button:hover {
          box-shadow: 0 0 30px #8b5cf6, 0 0 60px #3b82f6, 0 0 90px #06b6d4;
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

function GameModeMenu({ onSelect }) {
  return (
    <div className="space-y-4 text-white">
      <div
        onClick={() => onSelect('free')}
        className="flex justify-between items-center panel panel-texture p-4 cursor-pointer hover:bg-white/20"
      >
        <span>Free – играть бесплатно</span>
      </div>
      <div
        onClick={() => onSelect('survival')}
        className="flex justify-between items-center panel panel-texture p-4 cursor-pointer hover:bg-white/20"
      >
        <span>Выживание – бесплатно</span>
      </div>
      <div
        onClick={() => onSelect('hardcore')}
        className="flex justify-between items-center panel panel-texture p-4 cursor-pointer hover:bg-white/20"
      >
        <span>Хардкор – 1 жизнь</span>
      </div>
    </div>
  );
}

function DifficultyMenu({ onSelect, onBack }) {
  const levels = [
    { id: 'easy', label: 'Легко' },
    { id: 'normal', label: 'Нормально' },
    { id: 'hard', label: 'Сложно' },
  ];
  return (
    <div className="space-y-4 text-white">
      {levels.map((l) => (
        <div
          key={l.id}
          onClick={() => onSelect(l.id)}
          className="flex justify-between items-center panel panel-texture p-4 cursor-pointer hover:bg-white/20"
        >
          <span>{l.label}</span>
        </div>
      ))}
      <div className="text-center">
        <Button onClick={onBack} className="mt-2">
          <ChevronLeft className="w-4 h-4 inline" /> Назад
        </Button>
      </div>
    </div>
  );
}

function Leaderboard() {
  const players = Array.from({ length: 10 }, (_, i) => ({
    user: `@player${i + 1}`,
    level: 10 - i,
  }));
  return (
    <div className="text-white panel panel-texture p-4">
      <table className="w-full mb-4 text-left text-sm">
        <thead>
          <tr>
            <th className="pb-2">Игрок</th>
            <th className="text-right pb-2">Уровень</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.user} className="border-t border-white/10 hover:bg-white/5">
              <td className="flex items-center gap-2">
                {i < 3 && <Trophy className="w-4 h-4 text-yellow-400" />}
                {p.user}
              </td>
              <td className="text-right">{p.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-center">обновлено 5 мин назад</p>
    </div>
  );
}

function Achievements() {
  return (
    <div className="text-white text-center panel panel-texture p-4 space-y-4">
      <h3 className="panel-header">Ваши достижения</h3>
      <div className="grid grid-cols-3 gap-3 text-sm">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center py-4 bg-white/10 rounded"
          >
            <Trophy className="mb-1" />
            <span>#{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Shop() {
  const items = [
    { label: "Щит 10 сек", icon: <Shield className="w-5 h-5" /> },
    { label: "Возрождение", icon: <RotateCcw className="w-5 h-5" /> },
    { label: "Нитро 10 сек", icon: <Zap className="w-5 h-5" /> },
  ];
  return (
    <div className="space-y-4 text-white">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between items-center panel panel-texture p-4"
        >
          <div className="flex items-center gap-2">
            {item.icon}
            <span>{item.label} – бесплатно</span>
          </div>
          <Button onClick={() => window.open('#', '_blank')}>Получить</Button>
        </div>
      ))}
    </div>
  );
}

function Profile() {
  const friends = ["@astro1", "@astro2", "@astro3"];
  return (
    <div className="text-white space-y-4 panel panel-texture p-4">
      <div className="flex items-center gap-4">
        <img src="https://via.placeholder.com/80" alt="avatar" className="w-16 h-16 rounded-full" />
        <div>
          <p>@username</p>
          <p className="text-sm text-sky-400">Баланс: 0 TON</p>
        </div>
      </div>
      <div>
        <p className="mb-1">Лучший уровень</p>
        <div className="progress">
          <div style={{ width: '50%' }} />
        </div>
      </div>
      <div>
        <p className="mb-1">Друзья</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          {friends.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="text-white text-center panel panel-texture p-4">
      Прыгайте всё выше, собирайте бонусы и зарабатывайте TON — и всё это не выходя из Telegram. Веселитесь, соревнуйтесь с друзьями и прокачивайте себя!
    </div>
  );
}

function Settings() {
  return (
    <div className="space-y-4 text-white panel panel-texture p-4">
      <div>
        <label className="block mb-1">Громкость музыки</label>
        <input type="range" className="w-full" />
      </div>
      <div>
        <label className="block mb-1">SFX</label>
        <input type="range" className="w-full" />
      </div>
      <div>
        <label className="block mb-1">Вибро</label>
        <input type="range" className="w-full" />
      </div>
      <div>
        <label className="block mb-1">Язык</label>
        <select className="w-full p-2 rounded-md text-black">
          <option>RU</option>
          <option>EN</option>
        </select>
      </div>
      <div className="text-center">
        <a href="https://t.me/" target="_blank" rel="noreferrer" className="inline-block bg-blue-600 px-4 py-2 rounded-md">Обратная связь</a>
      </div>
    </div>
  );
}

function Referral() {
  return (
    <div className="text-white space-y-4 text-center panel panel-texture p-4">
      <p>Приглашайте друзей по ссылке и получайте бонусы TON.</p>
      <Button
        onClick={() => navigator.clipboard.writeText('https://t.me/your_bot')}
        className="mx-auto flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" /> Скопировать ссылку
      </Button>
    </div>
  );
}
