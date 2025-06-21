import { Button } from "./ui/button";
import { Home, List, Trophy, Grid, User } from "lucide-react";
import { motion } from "framer-motion";

export default function SpaceJumpMainMenu() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden p-8">
      {/* Новый CSS-анимированный звёздный фон */}
      <div className="absolute inset-0 z-0">
        <div className="stars-layer"></div>
      </div>

      {/* Верхняя панель */}
      <div className="absolute top-8 left-0 right-0 z-10 flex justify-between items-center px-8">
        <div className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform">
          <img src="https://cdn-icons-png.flaticon.com/512/3791/3791513.png" alt="TON" className="w-6 h-6" />
        </div>
        <h1 className="text-white text-5xl font-black tracking-widest font-['Orbitron'],sans-serif">SpaceJump</h1>
        <div className="icon-wrapper w-12 h-12 hover:scale-105 transition-transform">
          <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" className="w-6 h-6" />
        </div>
      </div>

      {/* Главная кнопка Играть */}
      <div className="flex justify-center items-center h-full z-10 relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black w-64 h-64 text-6xl font-bold rounded-full shadow-2xl flex items-center justify-center neon-button"
        >
          ▶
        </motion.button>
      </div>

      {/* Нижнее меню */}
      <div className="absolute bottom-8 w-full flex justify-center gap-12 z-10 text-white">
        <IconButton icon={<Home />} />
        <IconButton icon={<List />} />
        <IconButton icon={<Trophy />} />
        <IconButton icon={<Grid />} />
        <IconButton icon={<User />} />
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

function IconButton({ icon }) {
  return (
    <div className="hover:scale-105 transition-transform">
      <div className="icon-wrapper">
        {icon}
      </div>
    </div>
  );
}
