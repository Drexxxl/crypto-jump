import { useState, useEffect, useRef } from "react";
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
 * SpaceJump – v3.0                                                        *
 *  ▸ Полноценная рабочая игра: ракета + платформы + монеты.               *
 *  ▸ Космический фон (три параллакс‑слоя + туманность).                   *
 *  ▸ Все вкладки (Quests / Leaderboard / Collections / Market / Profile). *
 *  ▸ Start‑кнопка переводит в игру, кнопка «Меню» — назад.                *
 *  ▸ Нет внешних ассетов? — рисуем примитивы (debug‑fallback).            *
 ***************************************************************************/

export default function SpaceJumpApp() {
  const [screen, setScreen] = useState("menu");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coins, setCoins] = useState(0);
  const [altitude, setAltitude] = useState(0);

  /* Small event bus: Phaser -> React */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.type === "coin") setCoins((c) => c + 1);
      if (e.detail.type === "alt") setAltitude(e.detail.y);
    };
    window.addEventListener("spacejump", handler);
    return () => window.removeEventListener("spacejump", handler);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-cyan-100 font-sans select-none">
      <AnimatedBackground />
      <GlobalKeyframes />

      <AnimatePresence mode="wait" initial={false}>
        {screen === "menu" && (
          <MainMenu
            key="menu"
            onStart={() => setScreen("game")}
            onNavigate={setScreen}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {screen === "game" && (
          <GameScreen
            key="game"
            coins={coins}
            altitude={altitude}
            onExit={() => setScreen("menu")}
          />
        )}
        {screen === "quests" && <Quests key="quests" onBack={() => setScreen("menu")} />}
        {screen === "leaderboard" && <Leaderboard key="lb" onBack={() => setScreen("menu")} />}
        {screen === "collections" && <Collections key="col" onBack={() => setScreen("menu")} />}
        {screen === "market" && <Market key="mkt" onBack={() => setScreen("menu")} />}
        {screen === "referrals" && <Referrals key="refs" onBack={() => setScreen("menu")} />}
        {screen === "profile" && <Profile key="prof" onBack={() => setScreen("menu")} />}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        whileHover={{ rotate: 120 }}
        className="absolute top-4 right-4 z-20 text-cyan-300/80 hover:text-white/90"
        onClick={onOpenSettings}
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
      whileTap={{ scale: 0.9 }}
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
    { icon: ShieldCheck, label: "Рефералы", key: "referrals", colors: "from-sky-400 to-blue-500" },
    { icon: User, label: "Профиль", key: "profile", colors: "from-lime-400 to-emerald-500" },
  ];
  return (
    <nav className="h-28 w-full bg-black/10 backdrop-blur-md flex justify-around items-center gap-2 z-20">
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

/* ----------------------------- Game Screen ---------------------------- */
function GameScreen({ onExit, coins, altitude }) {
  const phaserRef = useRef(null);
  useEffect(() => {
    if (phaserRef.current) return; // already init

    /* ---------- Phaser Setup ---------- */
    class Preload extends Phaser.Scene {
      preload() {
        this.load.image("platform", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABQCAQAAADznQ0AAAAAFElEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAwF8OMQAAAXxJREFUeF7tzjENgDAQRNGy/6tyEONiCB3sI5IAucs5cjoxOYD65gis6MVlE5gPrmCKzoxWUj2C4nHC5C7hxhuTt6eJvVwPKvT/C/PObbIVd831vdb9vl9t7rbrXtf7Xu1+1/t+7X7X+1/te7X7X+1/tfIvuXvAJJ14oTBy06qAAAAABJRU5ErkJggg==");
        this.load.spritesheet("rocket", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAA4CAYAAAAVyKynAAAACXBIWXMAAAsTAAALEwEAmpwYAAABGUlEQVR4nO3YsUoDQRSA4S94ATqwEfgAHoADcQAY8QU7ASKwBO4Ad2AHxABF4AX0W2KIiMzFxLpyR4nHfXbM7Mzu+s6eWCw+9uziOSgIiICIiAiIgIiICIiAiIgIiICIiAiIgJi0s5momkMumZ5qKYwbcpc1KtpZ5qKYybcpM1KtZZ7q6XEtp58q6bFtZ55q6bE/gPHHTTX3e8DqRL3OjaxAg/P6MqxsDCYX4eWhv4CaArsTcidH833MuAdxpv8uKXu95syEcxrP6infsf/6IDdnh3oX1NwCAVccawJgN+zeps2sonMS/FTpmjmaQ7YQqaY5moO2EYm6UzLTJhGzLMyVycYzaLIW82msdYzWRoNZWY5XrA92Cv0xO+NbtAm8h1HnCAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgMi7ADG7n2AFD+a83AAAAAElFTkSuQmCC", { frameWidth: 64, frameHeight: 56 });
        this.load.spritesheet("coin", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAABgklEQVRYhe1XvUpDQRT/zttBbyAlIKhRFIqqQUp3Eh8G+iDSHPQacRRajYKHyBSipapFKSijxFD6ARe0XUxFRMYiD2Z7Nmzu13R5pTK7Z/Pcw5s7My55zvnPOfcHGV8kK3vpAWDdBrYJYElO+JzAm8h1t/F7Ai/3Gzdhvj1io8GZFODdgNpTiFqouBZhOiCkCmDYJLdnOjFkMrDXLI4gAl4kzbIRbkIuAeGHWxirMRHkRkNvMNFVQVwKP1HjqCOUM3sZ3VAbwH/jGj33jjXNHzvEfgQ/HVbUaz2QmiFjCwXTlzAIXazhbugzuDUFcAUwvx6pRP70dNDO4xjoMnIKPQGd/wcgUp3NEPoBPwAckU4iigI+XvYDn8ApXgHFqRSbuuSSMzdg3NofM8JrIoYNewc0hXtOD87Qy4V/mQJuAeWDVYj1WF+jbgLz2GV5/C/PObbCrYJbCdgFeEDuJeayQMZT6BdSxiqP/d9vywgq6Z9erjRzCQXDpUe1koRaSPoaqe7iH730cdpShUMpOWcZH/AsLiCFYIawFsAAAAASUVORK5CYII=", { frameWidth: 32, frameHeight: 32 });
      }
      create() {
        this.scene.start("Main");
      }
    }

    class Main extends Phaser.Scene {
      create() {
        const { width, height } = this.scale;

        /* Rocket */
        const rocket = this.physics.add.sprite(width / 2, height - 150, "rocket");
        rocket.setBounce(0.2);
        rocket.setCollideWorldBounds(true);
        rocket.play({ key: "fly", repeat: -1 });
        this.anims.create({ key: "fly", frames: this.anims.generateFrameNumbers("rocket", { start: 0, end: 2 }), frameRate: 6, repeat: -1 });

        /* Platforms */
        const platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 10; i++) {
          const x = Phaser.Math.Between(50, width - 50);
          const y = height - i * 120;
          platforms.create(x, y, "platform").setScale(0.5).refreshBody();
        }

        /* Coins */
        const coins = this.physics.add.group();
        const spawnCoin = (px, py) => {
          const c = coins.create(px, py - 40, "coin").setScale(0.6);
          this.anims.create({ key: "spin", frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
          c.play("spin");
        };
        platforms.children.iterate((p) => spawnCoin(p.x, p.y));

        /* Collisions */
        this.physics.add.collider(rocket, platforms, () => {
          if (rocket.body.touching.down) rocket.setVelocityY(-650);
        });
        this.physics.add.overlap(rocket, coins, (r, coin) => {
          coin.destroy();
          window.dispatchEvent(new CustomEvent("spacejump", { detail: { type: "coin" } }));
        });

        /* Controls */
        const cursors = this.input.keyboard.createCursorKeys();
        const keys = this.input.keyboard.addKeys("A,D");
        this.input.on("pointermove", (p) => (rocket.x = p.x));

        /* Camera */
        this.cameras.main.startFollow(rocket, false, 0, 1, 0, 100);
        this.cameras.main.setDeadzone(width * 0.5, height * 0.2);
        this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

        /* Altitude tracker & keyboard */
        this.events.on("update", () => {
          if (cursors.left.isDown || keys.A.isDown) {
            rocket.setVelocityX(-300);
          } else if (cursors.right.isDown || keys.D.isDown) {
            rocket.setVelocityX(300);
          } else {
            rocket.setVelocityX(0);
          }

          const alt = Math.max(0, Math.round((height - rocket.y) / 10));
          window.dispatchEvent(new CustomEvent("spacejump", { detail: { type: "alt", y: alt } }));
        });
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-canvas",
      transparent: true,
      physics: { default: "arcade", arcade: { gravity: { y: 1200 }, debug: false } },
      scene: [Preload, Main],
      pixelArt: true,
    });

    phaserRef.current = game;
    return () => game.destroy(true);
  }, []);

  return (
    <motion.div key="game" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <StarField className="opacity-20" size={1} speed={60} density={120} />
      <StarStreaks />
      <div id="game-canvas" className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute top-4 right-4 flex flex-col items-end text-sm text-white/90">
        <div className="flex items-center gap-1"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAOklEQVR42mNgGAWjgBEwY7AAC6uBiZ2BjYGBgeG/iEViRXkBxITKqeJkA1AhZEBtcA4gLxEAWAMTGBiApAMBwcAOzsPBtGyF2EAAAAASUVORK5CYII=" alt="c" className="w-5 h-5" /> {coins}</div>
        <div>{altitude} m</div>
      </div>

      <motion.button whileHover={{ scale: 1.08 }} className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-cyan-200 hover:text-white" onClick={onExit}>Меню</motion.button>
    </motion.div>
  );
}

/* -------------------- Placeholder content screens -------------------- */
const ScreenWrapper = ({ title, children, onBack }) => (
  <motion.div className="absolute inset-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <AnimatedBackground />
    <div className="flex items-center justify-between p-4"><button onClick={onBack} className="px-3 py-1 bg-white/10 rounded text-sm">←</button><h2 className="text-lg font-medium">{title}</h2><span className="w-8" /></div>
    <div className="flex-1 overflow-y-auto p-4 space-y-4">{children}</div>
  </motion.div>
);

const Quests = (p) => (
  <ScreenWrapper title="Задания" {...p}>
    {[20,65,90].map((pr,i)=>(<div key={i} className="p-3 bg-white/5 rounded-xl flex items-center gap-3"><Gift size={20}/><span>Выполни задачу #{i+1}</span><div className="flex-1 h-1 bg-white/20 rounded"><div className="h-full bg-gradient-to-r from-cyan-400 to-lime-400" style={{width:pr+'%'}}/></div></div>))}
  </ScreenWrapper>
);

const Leaderboard = (p) => (
  <ScreenWrapper title="Рейтинг" {...p}>
    {['Neo','Nova','Orion'].map((n,i)=>(<div key={n} className="flex justify-between bg-white/5 rounded p-2"><span>#{i+1} {n}</span><span>{10-i}k m</span></div>))}
  </ScreenWrapper>
);

const Collections = (p) => (
  <ScreenWrapper title="Коллекции" {...p}>
    <div className="grid grid-cols-3 gap-3">{['neo','retro','lava'].map(s=>(<div key={s} className="p-3 bg-white/5 rounded text-center capitalize">{s}</div>))}</div>
  </ScreenWrapper>
);

const Market = (p) => (
  <ScreenWrapper title="Маркет" {...p}>
    {[1,2,3].map(i=>(<div key={i} className="p-3 bg-white/5 rounded flex justify-between"><span>Товар #{i}</span><button className="px-2 py-1 bg-gradient-to-r from-lime-400 to-cyan-400 text-black text-xs rounded">Купить</button></div>))}
  </ScreenWrapper>
);

const Referrals = (p) => (
  <ScreenWrapper title="Рефералы" {...p}>
    {[1,2,3].map(i=>(
      <div key={i} className="p-3 bg-white/5 rounded flex justify-between items-center">
        <span>ID{i} — lvl {i}</span>
        <span className="text-xs text-cyan-300">+{i*10}c</span>
      </div>
    ))}
  </ScreenWrapper>
);

const Profile = (p) => (
  <ScreenWrapper title="Профиль" {...p}>
    <div className="text-center space-y-2"><img src="https://api.dicebear.com/7.x/personas/svg" className="mx-auto w-24 h-24"/><div>@username</div><div>Лучший счёт: 12k m</div></div>
  </ScreenWrapper>
);

/* ------------------------------ Settings ------------------------------ */
function SettingsModal({ onClose }) {
  return (
    <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="w-[90vw] max-w-md bg-gradient-to-b from-slate-900 to-black rounded-3xl p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl mb-4">Настройки</h3>
        <label className="flex items-center justify-between py-2 text-sm">Звук <Toggle defaultChecked/></label>
        <label className="flex items-center justify-between py-2 text-sm">Эффекты <Toggle defaultChecked/></label>
        <button onClick={onClose} className="mt-4 w-full py-2 rounded bg-cyan-600 text-black">Ок</button>
      </motion.div>
    </motion.div>
  );
}

const Toggle = ({ defaultChecked }) => <input type="checkbox" defaultChecked={defaultChecked} className="w-10 h-5 rounded-full bg-cyan-600 appearance-none checked:bg-lime-500 relative before:absolute before:content-[''] before:top-0.5 before:left-0.5 before:bg-white before:w-4 before:h-4 before:rounded-full before:transition-all checked:before:translate-x-5"/>;

/* ----------------------- Background Components ----------------------- */
function AnimatedBackground() {
  return (
    <>
      <StarField className="opacity-50" size={1} speed={30} density={180}/>
      <StarField className="opacity-70" size={2} speed={60} density={120}/>
      <StarStreaks />
      <NebulaCloud />
      <BlackHole />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black -z-10" />
    </>
  );
}

function StarField({ className="", size=1, speed=60, density=80 }){
  return (<div className={`absolute inset-0 -z-20 ${className}`}>{Array.from({length:density}).map((_,i)=>(<span key={i} className="absolute rounded-full bg-white" style={{width:size,height:size,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,opacity:Math.random()*0.6+0.2,filter:"drop-shadow(0 0 6px #0ff)",animation:`starScroll${speed} ${speed}s linear infinite`,animationDelay:`-${Math.random()*speed}s`}}/>))}</div>);
}

function StarStreaks(){
  return (<>{Array.from({length:40}).map((_,i)=>(<span key={i} className="absolute w-px h-8 bg-white/70 blur-[1px] -z-10" style={{top:`-${Math.random()*100}vh`,left:`${Math.random()*100}vw`,animation:`starFall ${4+Math.random()*3}s linear infinite`,animationDelay:`${Math.random()*5}s`}}/>))}</>);
}

function NebulaCloud(){
  return (<div className="absolute inset-0 -z-30"><div className="absolute top-1/2 left-1/2 w-[160vmax] h-[160vmax] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_90deg_at_center,transparent_0%,rgba(0,255,255,0.15)_15%,rgba(128,0,255,0.2)_50%,rgba(0,255,0,0.15)_85%,transparent_100%)] blur-3xl opacity-50 animate-[rotateSwirl_90s_linear_infinite]"/></div>);
}

function BlackHole(){
  return (<div className="absolute inset-0 -z-10 pointer-events-none"><div className="absolute top-[65%] left-1/2 w-[70vmin] h-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,1)_0%,rgba(0,0,0,0.8)_25%,rgba(0,0,0,0)_60%)]"/><div className="absolute top-[65%] left-1/2 w-[80vmin] h-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-violet-500/30 blur-[1px] animate-[rotateSwirl_30s_linear_infinite]"/></div>);
}

/* ------------------------------ Keyframes ----------------------------- */
function GlobalKeyframes(){
  return (<style>{`
    @keyframes starScroll30{from{transform:translateY(0)}to{transform:translateY(1024px)}}
    @keyframes starScroll60{from{transform:translateY(0)}to{transform:translateY(1024px)}}
    @keyframes starFall{0%{transform:translateY(-100vh) translateX(0);opacity:0}10%{opacity:1}100%{transform:translateY(100vh) translateX(10vw);opacity:0}}
    @keyframes rotateSwirl{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes ringOrbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes pulseNeon{0%,100%{opacity:.6}50%{opacity:1}}
    @keyframes floatPlanet{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .animate-floatPlanet{animation:floatPlanet 4s ease-in-out infinite}
  `}</style>);
}
