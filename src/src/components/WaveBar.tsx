import { Timer } from 'lucide-react';
import { useGameState } from '../state/store';
import { WAVES } from '../engine/types';
import { GAME_CONFIG } from '../constants';

export function WaveBar() {
  const state = useGameState();
  
  // Add safety checks for undefined state
  if (!state || state.currentWave === undefined) {
    return null;
  }
  
  const currentWave = WAVES[state.currentWave - 1];
  const waveInProgress = state.mobs.length > 0 || (state.waveStartTime && !state.waveCompleted);
  const canStartWave = state.waveCompleted && !state.gameOver && state.currentWave < GAME_CONFIG.TOTAL_WAVES;

  // Calculate countdown timer for next wave or current wave progress
  const getWaveProgress = () => {
    if (canStartWave && state.waveCompletedTime) {
      // Show countdown to auto-start next wave (30 seconds)
      const autoStartDelay = GAME_CONFIG.WAVE_AUTO_START_DELAY; // 30 seconds
      const timeSinceCompleted = state.time - state.waveCompletedTime;
      const remainingTime = Math.max(0, autoStartDelay - timeSinceCompleted);
      const progress = ((autoStartDelay - remainingTime) / autoStartDelay) * 100;
      
      return { progress, remainingTime, isCountdown: true };
    }
    
    if (!waveInProgress || !state.waveStartTime || !currentWave) return null;
    
    const waveTime = state.time - state.waveStartTime;
    const totalWaveTime = Math.max(...currentWave.entries.map(e => e.delay + (e.count - 1) * e.spacing));
    
    // Calculate how many mobs should be spawned by now vs total
    let totalMobs = 0;
    let spawnedMobsShouldBe = 0;
    
    for (const entry of currentWave.entries) {
      totalMobs += entry.count;
      
      if (waveTime >= entry.delay) {
        const entryTime = waveTime - entry.delay;
        const mobsSpawned = Math.min(entry.count, Math.floor(entryTime / entry.spacing) + 1);
        spawnedMobsShouldBe += Math.max(0, mobsSpawned);
      }
    }
    
    const progress = totalMobs > 0 ? Math.min((spawnedMobsShouldBe / totalMobs) * 100, 100) : 0;
    const remainingTime = Math.max(0, totalWaveTime - waveTime);
    
    return { progress, remainingTime, isCountdown: false };
  };

  const waveProgress = getWaveProgress();

  const getStatusText = () => {
    if (state.victory) return 'Victory!';
    if (state.gameOver && !state.victory) return 'Game Over';
    if (waveInProgress) return 'In progress';
    if (canStartWave) return 'Ready to start';
    return 'Starting...';
  };

  const getStatusColor = () => {
    if (state.gameOver && !state.victory) return 'text-red-500';
    if (state.victory) return 'text-green-400';
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
              Wave {state.currentWave}/10
            </span>
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Right - Progress bar or timer */}
          {waveProgress && (
            <div className="flex items-center gap-2">
              <div 
                className="w-20 h-2 bg-muted rounded-full overflow-hidden"
                title={`${waveProgress.isCountdown ? 'Auto-start countdown' : 'Spawn progress'}: ${waveProgress.remainingTime.toFixed(1)}s ${waveProgress.isCountdown ? 'until auto-start' : 'remaining'}`}
              >
                <div 
                  className={`h-full transition-all duration-500 ease-out ${waveProgress.isCountdown ? 'bg-yellow-500' : 'bg-primary'}`}
                  style={{ width: `${waveProgress.progress}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-[2rem]">
                {Math.ceil(waveProgress.remainingTime)}s
              </span>
            </div>
          )}
        </div>

        {/* Optional: Show current wave reward on mobile when not in progress */}
        {currentWave && !waveInProgress && (
          <div className="mt-2 text-sm text-muted-foreground">
            Reward: ${currentWave.reward} • Mobs: {currentWave.entries?.reduce((total, entry) => total + entry.count, 0) || 0}
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
                Wave {state.currentWave} of 10
              </span>
              <div className="w-px h-6 bg-border"></div>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            {/* Wave progress bar */}
            {waveProgress && (
              <>
                <div className="w-px h-6 bg-border"></div>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <div 
                    className="w-32 h-2 bg-muted rounded-full overflow-hidden"
                    title={`${waveProgress.isCountdown ? 'Auto-start countdown' : 'Spawn progress'}: ${waveProgress.remainingTime.toFixed(1)}s ${waveProgress.isCountdown ? 'until auto-start' : 'remaining'}`}
                  >
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${waveProgress.isCountdown ? 'bg-yellow-500' : 'bg-primary'}`}
                      style={{ width: `${waveProgress.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground min-w-[2rem]">
                    {Math.ceil(waveProgress.remainingTime)}s
                  </span>
                </div>
              </>
            )}
            
            {currentWave && (
              <>
                <div className="w-px h-6 bg-border"></div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Mobs: {state.mobs.length}</span>
                  <span>Entries: {currentWave.entries?.length || 0}</span>
                  <span>Reward: ${currentWave.reward || 0}</span>
                </div>
              </>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {state.gameOver && !state.victory && (
              <span className="text-sm text-muted-foreground">
                Click restart to try again
              </span>
            )}
            
            {canStartWave && waveProgress && (
              <span className="text-sm text-muted-foreground">
                Auto-starting in {Math.ceil(waveProgress.remainingTime)}s
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}