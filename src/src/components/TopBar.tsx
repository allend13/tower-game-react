import { DollarSign, Heart, Play, Pause, RotateCcw } from 'lucide-react';
import { 
  useGameMoney, 
  useGameLives, 
  usePaused, 
  useSpeed, 
  useGameOver, 
  usePause,
  useResume,
  useSetSpeed,
  useRestart
} from '../state/zustandStore';

export function TopBar() {
  const money = useGameMoney();
  const lives = useGameLives();
  const paused = usePaused();
  const speed = useSpeed();
  const gameOver = useGameOver();
  const pause = usePause();
  const resume = useResume();
  const setSpeed = useSetSpeed();
  const restart = useRestart();

  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Game stats */}
        <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-foreground">{lives}</span>
              <span className="hidden xs:inline text-foreground">HP</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <span className="text-foreground">{money}</span>
            </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden xs:inline">Speed:</span>
                          <select 
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value) as 1 | 2)}
                disabled={gameOver}
                className="bg-input-background border border-border rounded px-2 py-1 text-foreground text-sm"
              >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
          </div>
          
                      <button
              onClick={paused ? resume : pause}
              disabled={gameOver}
              className="flex items-center px-3 py-2 bg-secondary hover:bg-secondary/80 rounded text-secondary-foreground disabled:opacity-50"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

          <button
            onClick={restart}
            className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded text-secondary-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden xs:inline">Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
}