import { Target, TrendingUp, Trash2 } from 'lucide-react';
import { useGameState, useGameActions } from '../state/zustandStore';
import { TOWER_STATS, TOWER_ICONS } from '../engine/types';
import { canUpgradeTower } from '../engine/sim';

export function TowerPanel() {
  const state = useGameState();
  const actions = useGameActions();

  const selectedTower = state.selectedTower 
    ? state.towers.find(t => t.id === state.selectedTower)
    : null;

  if (!selectedTower) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium text-foreground mb-2 text-[20px]">
            Select a tower to view details
          </div>
          <div className="text-sm text-muted-foreground">
            Click on any tower on the battlefield to see its stats and upgrade options
          </div>
        </div>
      </div>
    );
  }

  const currentStats = TOWER_STATS[selectedTower.kind][selectedTower.tier - 1];
  const nextStats = selectedTower.tier < 3 ? TOWER_STATS[selectedTower.kind][selectedTower.tier] : null;
  const canUpgrade = canUpgradeTower(state, selectedTower.id);
  const Icon = TOWER_ICONS[selectedTower.kind];

  // Calculate total investment
  let totalInvestment = 0;
  for (let tier = 1; tier <= selectedTower.tier; tier++) {
    totalInvestment += TOWER_STATS[selectedTower.kind][tier - 1].cost;
  }
  
  const sellValue = Math.floor(totalInvestment * 0.5);

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{Icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground">{currentStats.name}</h3>
          <div className="text-sm text-muted-foreground">Level {selectedTower.tier}/3</div>
        </div>
      </div>

      {/* Stats List */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Damage:</span>
          <span className="text-foreground font-medium">{selectedTower.damage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Range:</span>
          <span className="text-foreground font-medium">{selectedTower.range}px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fire Rate:</span>
          <span className="text-foreground font-medium">{selectedTower.rate}/sec</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Damage Type:</span>
          <span className="text-foreground font-medium">
            {selectedTower.kind === 'arrow' ? 'Physical' : 
             selectedTower.kind === 'cannon' ? 'Explosive' : 'Frost'}
          </span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Level Progress</span>
          <span>{selectedTower.tier}/3</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${(selectedTower.tier / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Next Upgrade */}
      {nextStats && (
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-3">Next Upgrade:</div>
          <div className="bg-slate-950 rounded-lg p-3 mb-4 border border-slate-800">
            <div className="text-sm font-medium text-foreground">Increased damage</div>
            <div className="text-xs text-slate-400">
              Damage: +{nextStats.damage - selectedTower.damage}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {nextStats && (
          <button
            onClick={() => actions.upgradeTower(selectedTower.id)}
            disabled={!canUpgrade || state.gameOver}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              canUpgrade
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">Upgrade to Level {selectedTower.tier + 1}</span>
            <span className="text-yellow-400 font-medium">${nextStats.cost}</span>
          </button>
        )}

        {selectedTower.tier >= 3 && (
          <div className="text-center text-sm text-green-500 py-2">
            ✓ Maximum level reached
          </div>
        )}

        <button
          onClick={() => actions.sellTower(selectedTower.id)}
          disabled={state.gameOver}
          className="w-full flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-red-400 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-5 h-5 mr-3" />
          <span className="flex-1 text-left">Sell Tower</span>
          <span className="text-yellow-400 font-medium">${sellValue}</span>
        </button>
        
        <div className="text-center text-sm text-muted-foreground pt-2">
          Position: ({selectedTower.tile.x}, {selectedTower.tile.y})
        </div>
      </div>
    </div>
  );
}