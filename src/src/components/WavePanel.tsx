import { Play, Eye } from 'lucide-react';
import { useGameState, useGameActions } from '../state/_store';
import { WAVES } from '../engine/types';

export function WavePanel() {
  const state = useGameState();
  const actions = useGameActions();

  const isLastWave = state.currentWave >= WAVES.length;
  const canStartWave = state.waveCompleted && !isLastWave && !state.victory;
  const waveInProgress = state.waveStartTime && !state.waveCompleted;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="text-center">
        <div className="text-xl font-medium text-foreground mb-2">
          Wave {state.currentWave} of 10
        </div>
        
        <div className="text-sm text-muted-foreground mb-4">
          {waveInProgress && 'Wave in progress...'}
          {canStartWave && 'Ready to Start'}
          {state.victory && 'Victory!'}
          {state.gameOver && !state.victory && 'Game Over'}
          {!waveInProgress && !canStartWave && !state.gameOver && 'Preparing...'}
        </div>

        {canStartWave && (
          <button
            onClick={actions.startNextWave}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg mb-4 transition-colors"
          >
            <Play className="w-5 h-5" />
            Start {isLastWave ? 'Final' : 'Next'} Wave
          </button>
        )}

        {!canStartWave && !waveInProgress && (
          <div className="w-full px-6 py-3 bg-muted rounded-lg mb-4 text-muted-foreground">
            {state.victory ? 'All waves completed!' : 
             state.gameOver ? 'Click restart to try again' : 
             'Complete current wave first'}
          </div>
        )}

        <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded transition-colors">
          <Eye className="w-4 h-4" />
          Preview Next Wave
        </button>

        <div className="mt-4 text-xs text-muted-foreground">
          Build and upgrade towers before starting the next wave
        </div>
      </div>
    </div>
  );
}