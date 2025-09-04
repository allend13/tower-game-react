import { Hammer } from 'lucide-react';
import { useGameState, useGameActions } from '../state/store';
import { TOWER_STATS, TOWER_ICONS, TowerKind } from '../engine/types';
import { canAffordTower } from '../engine/sim';

export function BuildPanel() {
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
    <div className="bg-card rounded-lg border border-border p-4 h-full flex flex-col overflow-hidden lg:h-full">
      <div className="flex items-center gap-2 mb-4 lg:mb-8">
        <Hammer className="w-4 h-4 text-yellow-500" />
        <h2 className="text-base text-foreground lg:text-[20px]">Build Towers</h2>
      </div>
      
      {/* Mobile: Horizontal layout */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
        {Object.entries(TOWER_STATS).map(([kind, tiers]) => {
          const towerKind = kind as TowerKind;
          const tier1Stats = tiers[0];
          const canAfford = canAffordTower(state, towerKind);
          const isSelected = state.buildingTower === towerKind;
          const icon = TOWER_ICONS[towerKind];

          return (
            <button
              key={kind}
              onClick={() => handleTowerSelect(towerKind)}
              disabled={!canAfford || state.gameOver}
              className={`flex-shrink-0 w-24 h-20 p-2 text-center transition-all hover:bg-slate-700/30 rounded ${
                isSelected ? 'bg-slate-700/50' : ''
              } ${
                !canAfford ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{icon}</span>
                <div className="text-xs text-yellow-500 font-medium">
                  ${tier1Stats.cost}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Desktop: Vertical layout */}
      <div className="hidden lg:block space-y-2 flex-1 overflow-y-auto">
        {Object.entries(TOWER_STATS).map(([kind, tiers]) => {
          const towerKind = kind as TowerKind;
          const tier1Stats = tiers[0];
          const canAfford = canAffordTower(state, towerKind);
          const isSelected = state.buildingTower === towerKind;
          const icon = TOWER_ICONS[towerKind];

          return (
            <button
              key={kind}
              onClick={() => handleTowerSelect(towerKind)}
              disabled={!canAfford || state.gameOver}
              className={`w-full py-2 px-2 text-left transition-all hover:bg-slate-700/30 rounded ${
                isSelected ? 'bg-slate-700/50' : ''
              } ${
                !canAfford ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">{tier1Stats.name}</div>
                  <div className="text-xs text-slate-400">
                    {tier1Stats.damage} dmg • {tier1Stats.range}px range
                  </div>
                </div>
                <div className="text-sm text-yellow-500 font-medium">
                  ${tier1Stats.cost}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop: Money info */}
      <div className="hidden lg:block mt-4 pt-3 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-400">Available Gold:</div>
          <div className="text-sm text-yellow-500 font-medium">${state.money}</div>
        </div>
        
        <div className="p-2 bg-slate-900/80 rounded text-center">
          <div className="text-xs text-slate-400">
            Select a tower, then click on a buildable tile to place it
          </div>
        </div>
      </div>
      
      {/* Mobile: Compact money info */}
      <div className="lg:hidden flex items-center justify-between mt-2 p-2 bg-slate-900/80 rounded">
        <div className="text-xs text-slate-400">Gold: ${state.money}</div>
        <div className="text-xs text-slate-400">
          Tap tower, then tap tile
        </div>
      </div>
    </div>
  );
}