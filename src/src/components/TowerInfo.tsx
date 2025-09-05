import { Trash2, TrendingUp } from 'lucide-react';
import { useGameState, useGameActions } from '../state/zustandStore';
import { TOWER_STATS, TOWER_ICONS } from '../engine/types';
import { canUpgradeTower } from '../engine/sim';

export function TowerInfo() {
  const state = useGameState();
  const actions = useGameActions();

  const selectedTower = state.selectedTower 
    ? state.towers.find(t => t.id === state.selectedTower)
    : null;

  if (!selectedTower) {
    return (
      <div className="bg-card p-3 rounded-lg border border-border">
        <p className="text-muted-foreground text-center text-sm">
          Select a tower to view details
        </p>
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
  const dps = selectedTower.damage * selectedTower.rate;

  return (
    <div className="bg-card p-3 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{Icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{currentStats.name}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(tier => (
                <div
                  key={tier}
                  className={`w-1.5 h-1.5 rounded-full ${
                    tier <= selectedTower.tier ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Stats - Compact Grid */}
      <div className="grid grid-cols-2 gap-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">DMG:</span>
          <span>{selectedTower.damage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">RNG:</span>
          <span>{selectedTower.range}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">SPD:</span>
          <span>{selectedTower.rate}/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">DPS:</span>
          <span>{dps.toFixed(1)}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-muted-foreground">Kills:</span>
          <span>{selectedTower.kills}</span>
        </div>
      </div>

      {/* Upgrade Section */}
      {nextStats && (
        <div className="border-t border-border pt-3 mb-3">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Upgrade to </span>
            <span className="text-xs font-medium">{nextStats.name}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1 text-xs mb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">DMG:</span>
              <span>
                {selectedTower.damage}→{nextStats.damage}
                <span className="text-green-500 ml-1 text-[10px]">
                  +{nextStats.damage - selectedTower.damage}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RNG:</span>
              <span>
                {selectedTower.range}→{nextStats.range}
                <span className="text-green-500 ml-1 text-[10px]">
                  +{nextStats.range - selectedTower.range}
                </span>
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">DPS:</span>
              <span>
                {dps.toFixed(1)}→{(nextStats.damage * nextStats.rate).toFixed(1)}
                <span className="text-green-500 ml-1 text-[10px]">
                  +{((nextStats.damage * nextStats.rate) - dps).toFixed(1)}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={() => actions.upgradeTower(selectedTower.id)}
            disabled={!canUpgrade || state.gameOver}
            className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs ${
              canUpgrade
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Upgrade (${nextStats.cost})
          </button>
        </div>
      )}

      {selectedTower.tier >= 3 && (
        <div className="border-t border-border pt-3 mb-3">
          <p className="text-xs text-muted-foreground text-center">
            Max level
          </p>
        </div>
      )}

      {/* Sell Button */}
      <button
        onClick={() => actions.sellTower(selectedTower.id)}
        disabled={state.gameOver}
        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50 text-xs"
      >
        <Trash2 className="w-3 h-3" />
        Sell (${sellValue})
      </button>

      <div className="mt-1 text-[10px] text-muted-foreground text-center">
        Investment: ${totalInvestment}
      </div>
    </div>
  );
}