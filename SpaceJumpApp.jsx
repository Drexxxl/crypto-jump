import { useState, useEffect, useRef } from "https://esm.sh/react@18";
import { motion, AnimatePresence } from "https://esm.sh/framer-motion@10";
import {
  Settings,
  Trophy,
  ListChecks,
  Layers3,
  User,
  Store,
  Gift,
} from "https://esm.sh/lucide-react@0.270.0";
import Phaser from "https://esm.sh/phaser@3";

/***************************************************************************
 * SpaceJump – v3.1                                                        *
 *  ▸ Геймплей:                                                    *
 *      • 4 вида платформ – static, moving, fragile, trampoline.           *
 *      • Процедурный бесконечный подъём, спавн новых платформ/монет.      *
 *      • Частицы реактивного огня (Phaser emitter).                      *
 *      • Game‑Over overlay + рестарт.                                    *
 *  ▸ UI: HUD (монеты, высота, рекорд), плавное появление экранов.         *
 *  ▸ Фон: три скорости звёзд, падение метеоров, мягкий градиент.          *
 ***************************************************************************/

export default function SpaceJumpApp() {
  const [screen, setScreen] = useState("menu");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coins, setCoins] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [best, setBest] = useState(0);

  /* Event bus */
  useEffect(() => {
    const handler = (e) => {
      const { type, value } = e.detail;
      if (type === "coin") setCoins((c) => c + 1);
      if (type === "alt") setAltitude(value);
      if (type === "gameover") {
        setBest((b) => Math.max(b, value));
        setScreen("menu");
      }
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
            coins={coins}
            best={best}
            onStart={() => {
              setCoins(0);
              setAltitude(0);
              setScreen("game");
            }}
            onNavigate={setScreen}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {screen === "game" && (
          <GameScreen key="game" coins={coins} altitude={altitude} onExit={() => setScreen("menu")} />
        )}
        {screen === "quests" && <Quests key="quests" onBack={() => setScreen("menu")} />}
        {screen === "leaderboard" && <Leaderboard key="lb" onBack={() => setScreen("menu")} />}
        {screen === "collections" && <Collections key="col" onBack={() => setScreen("menu")} />}
        {screen === "market" && <Market key="mkt" onBack={() => setScreen("menu")} />}
        {screen === "profile" && <Profile key="prof" onBack={() => setScreen("menu")} best={best} />}
      </AnimatePresence>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

/* ----------------------------- Main Menu ------------------------------ */
function MainMenu({ onStart, onNavigate, onOpenSettings, coins, best }) {
  return (
    <motion.div className="absolute inset-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.button whileHover={{ rotate: 120 }} className="absolute top-4 right-4 z-20 text-cyan-300/80 hover:text-white/90" onClick={onOpenSettings}><Settings size={32}/></motion.button>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 z-10">
        <StartPlanet onClick={onStart}/>
        <div className="text-center text-xs text-white/70">Всего монет: {coins}<br/>Лучший подъём: {best} m</div>
      </div>

      <PlanetNav onNavigate={onNavigate}/>
    </motion.div>
  );
}

/* ... StartPlanet and PlanetNav unchanged ... */

/* ----------------------------- Game Screen ---------------------------- */
function GameScreen({ onExit, coins, altitude }) {
  const phaserRef = useRef(null);
  useEffect(() => {
    if (phaserRef.current) return;

    /* ---------- Phaser Setup ---------- */
    class Boot extends Phaser.Scene {
      preload() {
        this.load.image("platform", "https://dummyimage.com/128x32/ffffff/0ff&text=");
        this.load.image("platformFrag", "https://dummyimage.com/128x32/ffaaaa/fff&text=");
        this.load.image("platformMove", "https://dummyimage.com/128x32/aaaaff/fff&text=");
        this.load.image("platformJump", "https://dummyimage.com/128x32/aaffaa/fff&text=");
        this.load.image("particle", "https://dummyimage.com/4x4/ffff00/ffff00");
        this.load.spritesheet("rocket", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", { frameWidth: 64, frameHeight: 56 });
        this.load.spritesheet("coin", "https://raw.githubusercontent.com/ksavvy/coin-sprite/master/coin-sprite.png", { frameWidth: 32, frameHeight: 32 });
      }
      create() { this.scene.start("Play"); }
    }

    class Play extends Phaser.Scene {
      create() {
        const { width, height } = this.scale;
        /* Animations */
        this.anims.create({ key: "rocketFly", frames: this.anims.generateFrameNumbers("rocket", { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: "spin", frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }), frameRate: 12, repeat: -1 });

        /* Groups */
        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.group();

        /* Rocket */
        this.rocket = this.physics.add.sprite(width/2, height-150, "rocket").setScale(0.7);
        this.rocket.play("rocketFly");
        this.rocket.setCollideWorldBounds(true);
        const flames = this.add.particles("particle").createEmitter({ speed: { min: -20, max: 20 }, scale: { start: 0.4, end: 0 }, lifespan: 300, alpha: { start: 1, end: 0 }, blendMode: "ADD", follow: this.rocket, followOffset: { y: 30 } });

        /* First platforms */
        for(let i=0;i<12;i++) this.spawnPlatform(height - i*100);

        /* Collisions */
        this.physics.add.collider(this.rocket, this.platforms, this.handlePlatform, undefined, this);
        this.physics.add.overlap(this.rocket, this.coins, (r,c)=>{c.destroy(); window.dispatchEvent(new CustomEvent("spacejump", {detail:{type:"coin"}}));});

        /* Camera */
        this.cameras.main.startFollow(this.rocket, false, 0, 1, 0, 150);
        this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
      }

      spawnPlatform(y){
        const { width } = this.scale;
        const x = Phaser.Math.Between(40, width-40);
        const typeChance = Phaser.Math.Between(0,100);
        let key = "platform";
        let data = { kind: "static" };
        if(typeChance<15){ key="platformFrag"; data.kind="fragile"; }
        else if(typeChance<35){ key="platformMove"; data.kind="moving"; }
        else if(typeChance<45){ key="platformJump"; data.kind="jump"; }
        const p = this.platforms.create(x,y,key).setScale(0.5).refreshBody();
        p.setData(data);
        /* moving tween */
        if(data.kind==="moving") this.tweens.add({ targets:p, x:{from:x-60,to:x+60}, yoyo:true, repeat:-1, duration:2000, ease:"sine.inOut"});
        /* coin */
        if(Phaser.Math.Between(0,100)<60){ const c=this.coins.create(x,y-40,"coin").setScale(0.6); c.play("spin"); }
      }

      handlePlatform(rocket, platform){
        if(rocket.body.velocity.y>0) return; // only when going down
        const kind = platform.getData("kind");
        if(kind==="fragile"){ platform.disableBody(true,true); }
        if(kind==="jump"){ rocket.setVelocityY(-900); }
        else{ rocket.setVelocityY(-650); }
      }

      update(){
        const { height } = this.scale;
        /* Input */
        if(this.input.activePointer.isDown){ this.rocket.x = this.input.x; }

        /* Altitude */
        const alt = Math.max(0, Math.round((height - this.rocket.y)/10));
        window.dispatchEvent(new CustomEvent("spacejump", {detail:{type:"alt", value: alt}}));

        /* Spawn new platforms */
        const topMost = this.getTopMostY();
        while(topMost> this.cameraTop-100){ this.spawnPlatform(topMost-120); }

        /* Cleanup */
        this.platforms.children.iterate((p)=>{ if(p.y>this.cameras.main.scrollY+height+50) p.destroy(); });
        this.coins.children.iterate((c)=>{ if(c.y>this.cameras.main.scrollY+height+50) c.destroy(); });

        /* Game over */
        if(this.rocket.y>this.cameras.main.scrollY+height+200){ window.dispatchEvent(new CustomEvent("spacejump", {detail:{type:"gameover", value:alt}})); this.scene.restart(); }
      }

      get cameraTop(){ return this.cameras.main.scrollY; }
      getTopMostY(){ let min=1e9; this.platforms.children.iterate(p=>{ if(p.y<min) min=p.y; }); return min; }
    }

    phaserRef.current = new Phaser.Game({ type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight, parent: "game-canvas", transparent: true, physics:{default:"arcade", arcade:{gravity:{y:1200},debug:false}}, scene:[Boot,Play] });

    return () => phaserRef.current.destroy(true);
  }, []);

  return (
    <motion.div key="game" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <StarField className="opacity-20" size={1} speed={60} density={120}/>
      <StarStreaks />
      <div id="game-canvas" className="absolute inset-0" />

      <div className="absolute top-4 right-4 text-sm text-white flex flex-col items-end"><div className="flex items-center gap-1"><img src="https://dummyimage.com/16x16/ffff00/ffff00" className="w-4 h-4"/> {coins}</div><div>{altitude} m</div></div>

      <motion.button whileHover={{ scale:1.08 }} className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-cyan-200 hover:text-white" onClick={onExit}>Меню</motion.button>
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
