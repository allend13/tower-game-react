import { Timer } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../state/zustandStore';
import { WAVES } from '../engine/types';
import { GAME_CONFIG } from '../constants';

export function WaveBar() {
  const { 
    currentWave, 
    waveCompleted, 
    gameOver, 
    victory, 
    time, 
    waveStartTime, 
    waveCompletedTime 
  } = useGameStore(
    useShallow(state => ({
      currentWave: state.currentWave,
      waveCompleted: state.waveCompleted,
      gameOver: state.gameOver,
      victory: state.victory,
      time: state.time,
      waveStartTime: state.waveStartTime,
      waveCompletedTime: state.waveCompletedTime
    }))
  );
  
  // Calculate derived state
  const canStartWave = !waveCompleted && !gameOver && !victory;
  const waveInProgress = !waveCompleted && !gameOver && !victory;
  
  // Add safety checks for undefined state
  if (currentWave === undefined) {
    return null;
  }
  
  const currentWaveData = WAVES[currentWave - 1];

  // Calculate wave progress locally to avoid object recreation
  const waveProgress = (() => {
    if (waveCompleted && waveCompletedTime) {
      const timeSinceCompleted = time - waveCompletedTime;
      const remainingTime = Math.max(0, 5 - timeSinceCompleted); // 5 seconds delay
      return { progress: 100, remainingTime, isCountdown: true };
    }
    
    if (!waveStartTime) return null;
    
    const waveTime = time - waveStartTime;
    const WAVE_DURATION = GAME_CONFIG.WAVE_DURATION; // 15 seconds duration
    const remainingTime = Math.max(0, WAVE_DURATION - waveTime);
    const progress = ((WAVE_DURATION - remainingTime) / WAVE_DURATION) * 100;
    
    return { progress, remainingTime, isCountdown: false };
  })();

  const getStatusText = () => {
    if (victory) return 'Victory!';
    if (gameOver && !victory) return 'Game Over';
    if (canStartWave) return 'Waiting for next wave';
    if (waveInProgress) return 'In progress';
    return 'Starting...';
  };

  const getStatusColor = () => {
    if (gameOver && !victory) return 'text-red-500';
    if (victory) return 'text-green-400';
    if (waveInProgress) return 'text-green-400';
    if (canStartWave) return 'text-green-400';
    return 'text-muted-foreground';
  };

  return (
    <>
      {/* Mobile version */}
      <div className="lg:hidden bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Wave number and status */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">
              Wave {currentWave}/10
            </span>
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Right - Progress bar or timer */}
          {waveProgress ? (
            waveProgress.isCountdown ? (
              // Show text countdown when waiting for next wave
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Next wave in {Math.ceil(waveProgress.remainingTime)}s
                </span>
              </div>
            ) : (
              // Show progress bar during wave
              <div className="flex items-center gap-2">
                <div 
                  className="w-20 h-2 bg-muted rounded-full overflow-hidden"
                  title={`Spawn progress: ${waveProgress.remainingTime.toFixed(1)}s remaining`}
                >
                  <div 
                    className="h-full transition-all duration-500 ease-out bg-primary"
                    style={{ width: `${waveProgress.progress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-[2rem]">
                  {Math.ceil(waveProgress.remainingTime)}s
                </span>
              </div>
            )
          ) : null}
        </div>

        {/* Optional: Show current wave reward on mobile when not in progress */}
        {currentWaveData && !waveInProgress && (
          <div className="mt-2 text-sm text-muted-foreground">
            Reward: ${currentWaveData.reward} • Mobs: {currentWaveData.entries?.reduce((total, entry) => total + entry.count, 0) || 0}
          </div>
        )}
      </div>

      {/* Desktop version */}
      <div className="hidden lg:block bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Wave info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium text-foreground text-[15px]">
                Wave {currentWave} of 10
              </span>
              <div className="w-px h-6 bg-border"></div>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            {/* Wave progress bar or countdown text */}
            {waveProgress && (
              <>
                <div className="w-px h-6 bg-border"></div>
                {waveProgress.isCountdown ? (
                  // Show text countdown when waiting for next wave
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Next wave in {Math.ceil(waveProgress.remainingTime)}s
                    </span>
                  </div>
                ) : (
                  // Show progress bar during wave
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <div 
                      className="w-32 h-2 bg-muted rounded-full overflow-hidden"
                      title={`Spawn progress: ${waveProgress.remainingTime.toFixed(1)}s remaining`}
                    >
                      <div 
                        className="h-full transition-all duration-500 ease-out bg-primary"
                        style={{ width: `${waveProgress.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[2rem]">
                      {Math.ceil(waveProgress.remainingTime)}s
                    </span>
                  </div>
                )}
              </>
            )}
            
            {currentWaveData && (
              <>
                <div className="w-px h-6 bg-border"></div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Reward: ${currentWaveData.reward || 0}</span>
                </div>
              </>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {gameOver && !victory && (
              <span className="text-sm text-muted-foreground">
                Click restart to try again
              </span>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}