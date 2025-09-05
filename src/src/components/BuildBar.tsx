import { useGameState, useGameActions } from '../state/_store';
import { TOWER_STATS, TOWER_ICONS, TowerKind } from '../engine/types';
import { canAffordTower } from '../engine/sim';

export function BuildBar() {
  const state = useGameState();
  const actions = useGameActions();

  const handleTowerSelect = (towerKind: TowerKind) => {
    if (state.buildingTower === towerKind) {
      actions.cancelBuilding();
    } else {
      actions.startBuilding(towerKind);
    }
  };

  return (
    <div className="bg-card p-3 rounded-lg border border-border">
      <h3 className="mb-3 text-sm">Build Towers</h3>
      
      <div className="space-y-2">
        {Object.entries(TOWER_STATS).map(([kind, tiers]) => {
          const towerKind = kind as TowerKind;
          const tier1Stats = tiers[0];
          const canAfford = canAffordTower(state, towerKind);
          const isSelected = state.buildingTower === towerKind;
          const Icon = TOWER_ICONS[towerKind];

          return (
            <button
              key={kind}
              onClick={() => handleTowerSelect(towerKind)}
              disabled={!canAfford || state.gameOver}
              className={`w-full p-2 border rounded-lg text-left transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : canAfford
                  ? 'border-border hover:border-primary/50 hover:bg-accent'
                  : 'border-border bg-muted opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{Icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{tier1Stats.name}</span>
                    <span className={`text-xs ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                      ${tier1Stats.cost}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>DMG:{tier1Stats.damage}</span>
                    <span>RNG:{tier1Stats.range}</span>
                    <span>SPD:{tier1Stats.rate}/s</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-3 pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Keys: 1-3 build, Space pause, Esc cancel
        </p>
      </div>
    </div>
  );
}