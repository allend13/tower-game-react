import { TrendingUp, Trash2, X } from 'lucide-react';
import { useGameState, useGameActions } from '../state/store';
import { TOWER_STATS, TOWER_ICONS } from '../engine/types';
import { canUpgradeTower } from '../engine/sim';
import { gridToWorld } from '../engine/grid';
import { useEffect, useRef, useState } from 'react';

export function TowerModal() {
  const state = useGameState();
  const actions = useGameActions();
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const selectedTower = state.selectedTower 
    ? state.towers.find(t => t.id === state.selectedTower)
    : null;

  const handleClose = () => {
    actions.selectTower(null);
  };

  // Get canvas position for tower modal positioning
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCanvasPosition({ x: rect.left, y: rect.top });
    }
  }, [selectedTower]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && selectedTower) {
        handleClose();
      }
    };

    if (selectedTower) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedTower]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (selectedTower) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedTower]);

  if (!selectedTower) {
    return null;
  }

  const currentStats = TOWER_STATS[selectedTower.kind][selectedTower.tier - 1];
  const nextStats = selectedTower.tier < 3 ? TOWER_STATS[selectedTower.kind][selectedTower.tier] : null;
  const canUpgrade = canUpgradeTower(state, selectedTower.id);
  const icon = TOWER_ICONS[selectedTower.kind];

  // Calculate total investment
  let totalInvestment = 0;
  for (let tier = 1; tier <= selectedTower.tier; tier++) {
    totalInvestment += TOWER_STATS[selectedTower.kind][tier - 1].cost;
  }
  
  const sellValue = Math.floor(totalInvestment * 0.5);

  // Calculate tower screen position (32px tile size from canvas renderer)
  const tileSize = 32;
  const worldPos = gridToWorld(selectedTower.tile, tileSize);
  const towerScreenX = canvasPosition.x + worldPos.x + tileSize; // 1 tile to the right
  const towerScreenY = canvasPosition.y + worldPos.y - tileSize; // 1 tile above

  return (
    <div 
      ref={modalRef}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-3 w-64"
      style={{ 
        left: `${towerScreenX}px`,
        top: `${towerScreenY}px`,
        transform: towerScreenY < 0 ? `translateY(${tileSize * 3}px)` : 'none' // Position below if no space above
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">{currentStats.name}</div>
          <div className="text-xs text-muted-foreground">Level {selectedTower.tier}/3</div>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Damage:</span>
          <span className="text-foreground font-medium">{selectedTower.damage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Range:</span>
          <span className="text-foreground font-medium">{selectedTower.range}px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rate:</span>
          <span className="text-foreground font-medium">{selectedTower.rate}/sec</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {nextStats && (
          <button
            onClick={() => {
              actions.upgradeTower(selectedTower.id);
              handleClose();
            }}
            disabled={!canUpgrade || state.gameOver}
            className={`w-full flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
              canUpgrade
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-3 h-3 mr-2" />
            <span className="flex-1 text-left">Upgrade</span>
            <span className="text-yellow-400 font-medium">${nextStats.cost}</span>
          </button>
        )}

        {selectedTower.tier >= 3 && (
          <div className="text-center text-xs text-green-500 py-1">
            ✓ Max level
          </div>
        )}

        <button
          onClick={() => {
            actions.sellTower(selectedTower.id);
            handleClose();
          }}
          disabled={state.gameOver}
          className="w-full flex items-center px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-red-400 rounded text-xs transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3 h-3 mr-2" />
          <span className="flex-1 text-left">Sell</span>
          <span className="text-yellow-400 font-medium">${sellValue}</span>
        </button>
      </div>
    </div>
  );
}