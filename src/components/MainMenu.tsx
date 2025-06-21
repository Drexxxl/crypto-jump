import { Play } from 'lucide-react'

export function MainMenu() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white">
      <div className="absolute inset-0 bg-stars animate-fade"></div>

      <div className="flex flex-col items-center justify-center h-full z-10 relative">
        <h1 className="text-5xl font-bold mb-8">SpaceJump</h1>
        <button className="bg-white text-black px-8 py-4 rounded-full text-xl hover:scale-105 transition">
          <Play className="inline mr-2" /> Играть
        </button>
      </div>

      <div className="absolute bottom-0 w-full flex justify-around py-4 bg-black/40 text-sm">
        <div>🏠</div>
        <div>🏆</div>
        <div>👤</div>
        <div>⚙️</div>
      </div>
    </div>
  )
}
