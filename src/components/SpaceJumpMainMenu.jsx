import { Home, List, Trophy, Grid, User } from "lucide-react";
import { motion } from "framer-motion";

export default function SpaceJumpMainMenu() {
  return (
    <div className="main-menu">
      {/* Звёздный фон */}
      <div className="stars-layer" />

      {/* Верхняя панель */}
      <div className="top-bar">
        <div className="icon-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/3791/3791513.png" alt="TON" width="24" height="24" />
        </div>
        <h1 className="game-title">SpaceJump</h1>
        <div className="icon-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" width="24" height="24" />
        </div>
      </div>

      {/* Главная кнопка Играть */}
      <div className="play-area">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="play-button"
        >
          ▶
        </motion.button>
      </div>

      {/* Нижнее меню */}
      <div className="bottom-menu">
        <IconButton icon={<Home size={24} />} />
        <IconButton icon={<List size={24} />} />
        <IconButton icon={<Trophy size={24} />} />
        <IconButton icon={<Grid size={24} />} />
        <IconButton icon={<User size={24} />} />
      </div>
    </div>
  );
}

function IconButton({ icon }) {
  return <div className="icon-wrapper">{icon}</div>;
}
