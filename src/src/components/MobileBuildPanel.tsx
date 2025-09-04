import { useGameState, useGameActions } from '../state/store';
import { TowerKind, TOWER_STATS, TOWER_ICONS } from '../engine/types';

const towerConfig = {
  arrow: {
    name: 'Arrow',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20'
  },
  cannon: {
    name: 'Cannon', 
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20'
  },
  frost: {
    name: 'Frost',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10', 
    borderColor: 'border-blue-400/20'
  }
};

export function MobileBuildPanel() {
  const state = useGameState();
  const actions = useGameActions();

  const handleTowerSelect = (type: TowerKind) => {
    const stats = TOWER_STATS[type][0];
    if (state.money >= stats.cost) {
      actions.startBuilding(type);
    }
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Tower Cards */}
      <div className="flex gap-2">
        {Object.entries(towerConfig).map(([type, config]) => {
          const towerType = type as TowerKind;
          const stats = TOWER_STATS[towerType][0];
          const canAfford = state.money >= stats.cost;
          const isSelected = state.buildingTower === towerType;
          const icon = TOWER_ICONS[towerType];
          
          return (
            <button
              key={type}
              onClick={() => handleTowerSelect(towerType)}
              disabled={!canAfford || state.gameOver}
              className={`
                flex-1 p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? `${config.borderColor} ${config.bgColor} shadow-lg` 
                  : 'border-border bg-card hover:border-border/60'
                }
                ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                disabled:hover:shadow-none
              `}
            >
              {/* Icon and Name */}
              <div className="flex flex-col items-center gap-2 mb-3">
                <div className={`
                  p-2 rounded-full
                  ${isSelected ? config.bgColor : 'bg-muted'}
                `}>
                  <span className="text-2xl">{icon}</span>
                </div>
                <h3 className={`
                  text-sm font-medium text-center
                  ${isSelected ? config.color : 'text-foreground'}
                `}>
                  {config.name}
                </h3>
              </div>
              
              {/* Stats Column */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className={`
                    font-medium
                    ${canAfford ? 'text-yellow-400' : 'text-red-400'}
                  `}>
                    ${stats.cost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DMG:</span>
                  <span className="text-muted-foreground font-medium">{stats.damage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="text-muted-foreground font-medium">{stats.range}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {state.buildingTower && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary text-center">
            Tap on the game field to place your tower
          </p>
        </div>
      )}
    </div>
  );
}