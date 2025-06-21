import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Trophy,
  ListChecks,
  Layers3,
  User,
  Store,
  ShieldCheck,
  Gift,
} from "lucide-react";
import Phaser from "phaser";

/***************************************************************************
 * SpaceJump – v2.4 (stability patch)                                      *
 *  • 100 % закрытый JSX (ни одного dangling‑тега).                        *
 *  • Удалён специфичный для Next.js атрибут «jsx global».                 *
 *  • GlobalKeyframes теперь обычный <style>.                              *
 *  • Добавлены keyframes starScroll90 — на будущее.                       *
 ***************************************************************************/

export default function SpaceJumpApp() {
  const [screen, setScreen] = useState("menu");
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-cyan-100 font-sans select-none">
      <AnimatedBackground />
      <GlobalKeyframes />

      <AnimatePresence mode="wait">
        {screen === "menu" && (
          <MainMenu
            key="menu"
            onStart={() => setScreen("game")}
            onNavigate={setScreen}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {screen === "game" && <GameScreen key="game" onExit={() => setScreen("menu")} />}
      </AnimatePresence>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

/* ----------------------------- Main Menu ------------------------------ */
function MainMenu({ onStart, onNavigate, onOpenSettings }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
    >
      <motion.button
        whileHover={{ rotate: 120 }}
        className="absolute top-4 right-4 z-20 text-cyan-300/80 hover:text-white/90"
        onClick={onOpenSettings}
        aria-label="Настройки"
      >
        <Settings size={32} strokeWidth={1.5} />
      </motion.button>

      <div className="flex-1 flex items-center justify-center z-10">
        <StartPlanet onClick={onStart} />
      </div>

      <PlanetNav onNavigate={onNavigate} />
    </motion.div>
  );
}

function StartPlanet({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      className="relative w-60 aspect-square rounded-full bg-gradient-to-br from-cyan-300 via-violet-500 to-lime-400 shadow-[0_0_40px_rgba(0,255,255,0.6)] text-black text-3xl font-extrabold tracking-widest uppercase flex items-center justify-center"
      onClick={onClick}
    >
      Играть
      <span className="pointer-events-none absolute inset-0 before:absolute before:inset-0 before:rounded-full before:border before:border-cyan-200/40 before:blur-[2px] before:animate-ringOrbit" />
      <span className="absolute inset-0 rounded-full ring-4 ring-cyan-300/40 animate-pulseNeon" />
    </motion.button>
  );
}

function PlanetNav({ onNavigate }) {
  const items = [
    { icon: ListChecks, label: "Задания", key: "quests", colors: "from-teal-400 to-cyan-500" },
    { icon: Trophy, label: "Рейтинг", key: "leaderboard", colors: "from-yellow-400 to-orange-500" },
    { icon: Store, label: "Маркет", key: "market", colors: "from-pink-400 to-fuchsia-500" },
    { icon: Layers3, label: "Коллекции", key: "collections", colors: "from-purple-400 to-violet-500" },
    { icon: User, label: "Профиль", key: "profile", colors: "from-lime-400 to-emerald-500" },
  ];
  return (
    <nav className="h-28 w-full bg-black/10 backdrop-blur-md flex justify-around items-center gap-2 z-20 relative">
      {items.map(({ icon: Icon, label, key, colors }) => (
        <motion.button
          key={key}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.9 }}
          className="relative flex flex-col items-center gap-1 text-xs font-medium text-white/90"
          onClick={() => onNavigate(key)}
        >
          <span className={`absolute -z-10 w-16 h-16 rounded-full bg-gradient-to-br ${colors} blur-xl opacity-40`} />
          <span className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors} flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.2)] animate-floatPlanet`}>
            <Icon size={24} strokeWidth={1.4} />
          </span>
          {label}
        </motion.button>
      ))}
    </nav>
  );
}

/* ----------------------------- Game Stub ------------------------------ */
function GameScreen({ onExit }) {
  useEffect(() => {
    if (window.__spacejump) return;
    // TODO: подключить Phaser сцены или WebGL‑шэйдер
  }, []);

  return (
    <motion.div key="game" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <StarField className="opacity-20" size={1} speed={60} density={120} />
      <StarStreaks />
      <div id="game-canvas" className="absolute inset-0" />
      <motion.button whileHover={{ scale: 1.08 }} className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-cyan-200 hover:text-white" onClick={onExit}>Меню</motion.button>
    </motion.div>
  );
}

/* --------------------------- Settings Modal --------------------------- */
function SettingsModal({ onClose }) {
  return (
    <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="w-[90vw] max-w-md bg-gradient-to-b from-slate-900 to-black rounded-3xl p-6 shadow-2xl text-cyan-100" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl mb-4 font-semibold text-white">Настройки</h3>
        <ul className="space-y-4 text-sm">
          <SettingRow label="Язык" action={<select className="bg-black/40 px-2 py-1 rounded"><option>Русский</option><option>English</option></select>} />
          <SettingRow label="Звук" action={<Toggle defaultChecked />} />
          <SettingRow label="Эффекты" action={<Toggle defaultChecked />} />
          <SettingRow label="FPS" action={<select className="bg-black/40 px-2 py-1 rounded"><option>60</option><option>120</option></select>} />
        </ul>
        <button className="mt-6 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-black font-semibold" onClick={onClose}>Закрыть</button>
      </motion.div>
    </motion.div>
  );
}

const SettingRow = ({ label, action }) => (
  <li className="flex items-center justify-between">
    <span>{label}</span>
    {action}
  </li>
);

const Toggle = ({ defaultChecked }) => (
  <input type="checkbox" defaultChecked={defaultChecked} className="w-10 h-5 rounded-full bg-cyan-600 appearance-none checked:bg-lime-500 relative before:absolute before:content-[''] before:top-0.5 before:left-0.5 before:bg-white before:w-4 before:h-4 before:rounded-full before:transition-all checked:before:translate-x-5" />
);

/* ----------------------- Parallax Background FX ----------------------- */
function AnimatedBackground() {
  return (
    <>
      <StarField className="opacity-40" size={1} speed={30} density={200} />
      <StarField className="opacity-60" size={2} speed={80} density={120} />
      <StarStreaks />
      <NebulaCloud />
      <BlackHole />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black -z-10" />
    </>
  );
}

function StarField({ className = "", size = 1, speed = 60, density = 100 }) {
  const stars = Array.from({ length: density }).map((_, i) => (
    <div key={i} className="absolute rounded-full bg-white" style={{ width: size, height: size, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.6 + 0.2, filter: "drop-shadow(0 0 6px #0ff)", animation: `starScroll${speed} ${speed}s linear infinite`, animationDelay: `-${Math.random() * speed}s` }} />
  ));
  return <div className={`absolute inset-0 -z-20 ${className}`}>{stars}</div>;
}

function StarStreaks() {
  const streaks = Array.from({ length: 40 }).map((_, i) => (
    <div key={i} className="absolute w-0.5 h-8 bg-white/70 blur-[1px] -z-10" style={{ top: `-${
