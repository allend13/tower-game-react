import { Play, Pause, RotateCcw, Zap, Heart, DollarSign, Shield } from 'lucide-react';
import { useGameState, useGameActions } from '../state/store';
import { WAVES } from '../engine/types';

export function Hud() {
  const state = useGameState();
  const actions = useGameActions();

  const currentWave = WAVES[state.currentWave - 1];
  const isLastWave = state.currentWave >= WAVES.length;

  return (
    <div className="bg-card p-3 rounded-lg border border-border">
      {/* Top Row: Stats + Controls */}
      <div className="flex items-center justify-between mb-3">
        {/* Game Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-yellow-500" />
            <span>{state.money}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500" />
            <span>{state.lives}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-500" />
            <span>Wave {state.currentWave}</span>
          </div>
          {state.mobs.length > 0 && (
            <div className="text-muted-foreground">
              {state.mobs.length} enemies
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={state.paused ? actions.resume : actions.pause}
            className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            disabled={state.gameOver}
          >
            {state.paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {state.paused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={() => actions.setSpeed(state.speed === 1 ? 2 : 1)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-sm ${
              state.speed === 2 
                ? 'bg-yellow-500 text-white border-yellow-500' 
                : 'bg-background border-border hover:bg-accent'
            }`}
            disabled={state.gameOver}
          >
            <Zap className="w-3 h-3" />
            {state.speed}x
          </button>

          <button
            onClick={actions.restart}
            className="flex items-center gap-1 px-2 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
          >
            <RotateCcw className="w-3 h-3" />
            Restart
          </button>
        </div>
      </div>

      {/* Wave Info Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm">
            Wave {state.currentWave} {isLastWave ? '(Final)' : ''}
            {currentWave && <span className="text-muted-foreground ml-2">${currentWave.reward}</span>}
          </span>
          
          {state.waveStartTime && !state.waveCompleted && (
            <span className="text-xs text-muted-foreground">
              In progress...
            </span>
          )}
        </div>

        {state.waveCompleted && !isLastWave && !state.victory && (
          <button
            onClick={actions.startNextWave}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Start Next Wave
          </button>
        )}
      </div>

      {/* Wave Preview (compact) */}
      {currentWave && state.waveCompleted && !state.waveStartTime && (
        <div className="mt-2 p-2 bg-muted rounded">
          <div className="flex flex-wrap gap-1 text-xs">
            {currentWave.entries.map((entry, index) => (
              <span key={index} className="px-1.5 py-0.5 bg-background rounded">
                {entry.count}x {entry.kind}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}