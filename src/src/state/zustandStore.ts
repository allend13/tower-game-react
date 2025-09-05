import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { GameState, Tower, TowerKind, TOWER_STATS, Vec2 } from '../engine/types';
import { createGrid } from '../engine/grid';
import { advanceTick, startNextWave, canAffordTower } from '../engine/sim';
import { GAME_CONFIG } from '../constants';

// Initial game state
const createInitialState = (): GameState => ({
  time: 0,
  money: GAME_CONFIG.INITIAL_MONEY,
  lives: GAME_CONFIG.INITIAL_LIVES,
  currentWave: GAME_CONFIG.INITIAL_WAVE,
  waveStartTime: undefined,
  waveCompleted: false,
  waveCompletedTime: undefined,
  gameOver: false,
  victory: false,
  paused: false,
  speed: 1,
  gameStarted: false,
  grid: createGrid(),
  mobs: [],
  towers: [],
  projectiles: [],
});

// Game store interface
interface GameStore extends GameState {
  // UI state
  selectedTile?: Vec2;
  buildingTower?: TowerKind;
  selectedTower?: string;
  
  // Actions
  tick: (deltaTime: number, tileSize: number) => void;
  pause: () => void;
  resume: () => void;
  setSpeed: (speed: 1 | 2) => void;
  selectTile: (tile: Vec2) => void;
  startBuilding: (towerKind: TowerKind) => void;
  cancelBuilding: () => void;
  buildTower: (tile: Vec2) => void;
  selectTower: (towerId: string | null) => void;
  upgradeTower: (towerId: string) => void;
  sellTower: (towerId: string) => void;
  startNextWave: () => void;
  startGame: () => void;
  restart: () => void;
}

// Create the store
export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      ...createInitialState(),
      selectedTile: undefined,
      buildingTower: undefined,
      selectedTower: undefined,

      // Actions
      tick: (deltaTime: number, tileSize: number) => {
        const state = get();
        const newState = advanceTick(state, deltaTime, tileSize);
        set(newState);
      },

      pause: () => set({ paused: true }),

      resume: () => set({ paused: false }),

      setSpeed: (speed: 1 | 2) => set({ speed }),

      selectTile: (tile: Vec2) => {
        const state = get();
        if (state.buildingTower) {
          set({ selectedTile: tile, selectedTower: undefined });
        } else {
          set({ selectedTile: undefined });
        }
      },

      startBuilding: (towerKind: TowerKind) => {
        const state = get();
        if (!canAffordTower(state, towerKind)) return;
        set({ 
          buildingTower: towerKind,
          selectedTower: undefined
        });
      },

      cancelBuilding: () => {
        set({ 
          buildingTower: undefined,
          selectedTile: undefined
        });
      },

      buildTower: (tile: Vec2) => {
        const state = get();
        if (!state.buildingTower) return;
        
        // Check bounds
        if (tile.x < 0 || tile.x >= state.grid.width || tile.y < 0 || tile.y >= state.grid.height) return;
        
        if (state.grid.tiles[tile.y][tile.x] !== 'buildable') return;
        
        // Check if tile is already occupied
        if (state.towers.some(t => t.tile.x === tile.x && t.tile.y === tile.y)) return;
        
        const towerStats = TOWER_STATS[state.buildingTower][0];
        if (state.money < towerStats.cost) return;

        const newTower: Tower = {
          id: `tower_${Date.now()}_${Math.random()}`,
          tile,
          range: towerStats.range,
          damage: towerStats.damage,
          rate: towerStats.rate,
          projectileSpeed: towerStats.projectileSpeed,
          lastFiredAt: 0,
          kind: state.buildingTower,
          tier: 1,
          cost: towerStats.cost,
          kills: 0
        };

        set({
          towers: [...state.towers, newTower],
          money: state.money - towerStats.cost,
          buildingTower: undefined,
          selectedTile: tile,
          selectedTower: newTower.id
        });
      },

      selectTower: (towerId: string | null) => {
        set({ 
          selectedTower: towerId || undefined,
          buildingTower: undefined,
          selectedTile: undefined
        });
      },

      upgradeTower: (towerId: string) => {
        const state = get();
        const tower = state.towers.find(t => t.id === towerId);
        if (!tower || tower.tier >= 3) return;
        
        const nextTierStats = TOWER_STATS[tower.kind][tower.tier];
        if (state.money < nextTierStats.cost) return;

        set({
          towers: state.towers.map(t => 
            t.id === towerId 
              ? {
                  ...t,
                  tier: (t.tier + 1) as 1 | 2 | 3,
                  damage: nextTierStats.damage,
                  range: nextTierStats.range,
                  rate: nextTierStats.rate,
                  projectileSpeed: nextTierStats.projectileSpeed
                }
              : t
          ),
          money: state.money - nextTierStats.cost
        });
      },

      sellTower: (towerId: string) => {
        const state = get();
        const tower = state.towers.find(t => t.id === towerId);
        if (!tower) return;

        // Calculate sell value (50% of total investment)
        let totalCost = 0;
        for (let tier = 1; tier <= tower.tier; tier++) {
          totalCost += TOWER_STATS[tower.kind][tier - 1].cost;
        }
        const sellValue = Math.floor(totalCost * 0.5);
        
        set({
          towers: state.towers.filter(t => t.id !== towerId),
          money: state.money + sellValue,
          selectedTower: undefined
        });
      },

      startNextWave: () => {
        const state = get();
        const newState = startNextWave(state);
        set(newState);
      },

      startGame: () => {
        set({
          gameStarted: true,
          paused: false,
          waveCompletedTime: get().time
        });
      },

      restart: () => {
        set({
          ...createInitialState(),
          selectedTile: undefined,
          buildingTower: undefined,
          selectedTower: undefined,
        });
      },
    })),
    {
      name: 'tower-defense-game',
    }
  )
);

// Selector hooks for atomic subscriptions
export const useGameTime = () => useGameStore(state => state.time);
export const useGameMoney = () => useGameStore(state => state.money);
export const useGameLives = () => useGameStore(state => state.lives);
export const useCurrentWave = () => useGameStore(state => state.currentWave);
export const useWaveCompleted = () => useGameStore(state => state.waveCompleted);
export const useWaveStartTime = () => useGameStore(state => state.waveStartTime);
export const useWaveCompletedTime = () => useGameStore(state => state.waveCompletedTime);
export const useGameOver = () => useGameStore(state => state.gameOver);
export const useVictory = () => useGameStore(state => state.victory);
export const usePaused = () => useGameStore(state => state.paused);
export const useSpeed = () => useGameStore(state => state.speed);
export const useGameStarted = () => useGameStore(state => state.gameStarted);
export const useMobs = () => useGameStore(state => state.mobs);
export const useTowers = () => useGameStore(state => state.towers);
export const useProjectiles = () => useGameStore(state => state.projectiles);
export const useGrid = () => useGameStore(state => state.grid);

// UI selectors
export const useSelectedTile = () => useGameStore(state => state.selectedTile);
export const useBuildingTower = () => useGameStore(state => state.buildingTower);
export const useSelectedTower = () => useGameStore(state => state.selectedTower);

// Complex selectors - removed useWaveProgress to avoid object recreation

export const useCanStartWave = () => useGameStore(state => 
  state.waveCompleted && !state.gameOver && state.currentWave < GAME_CONFIG.TOTAL_WAVES
);

export const useWaveInProgress = () => useGameStore(state => 
  state.mobs.length > 0 || (state.waveStartTime && !state.waveCompleted)
);

// Action hooks - individual selectors to avoid object recreation
export const useTick = () => useGameStore(state => state.tick);
export const usePause = () => useGameStore(state => state.pause);
export const useResume = () => useGameStore(state => state.resume);
export const useSetSpeed = () => useGameStore(state => state.setSpeed);
export const useSelectTile = () => useGameStore(state => state.selectTile);
export const useStartBuilding = () => useGameStore(state => state.startBuilding);
export const useCancelBuilding = () => useGameStore(state => state.cancelBuilding);
export const useBuildTower = () => useGameStore(state => state.buildTower);
export const useSelectTower = () => useGameStore(state => state.selectTower);
export const useUpgradeTower = () => useGameStore(state => state.upgradeTower);
export const useSellTower = () => useGameStore(state => state.sellTower);
export const useStartNextWave = () => useGameStore(state => state.startNextWave);
export const useStartGame = () => useGameStore(state => state.startGame);
export const useRestart = () => useGameStore(state => state.restart);

// Legacy selectors for compatibility with old components
export const useGameState = () => useGameStore();
export const useGameActions = () => useGameStore(state => ({
  pause: state.pause,
  resume: state.resume,
  setSpeed: state.setSpeed,
  selectTile: state.selectTile,
  startBuilding: state.startBuilding,
  cancelBuilding: state.cancelBuilding,
  buildTower: state.buildTower,
  selectTower: state.selectTower,
  upgradeTower: state.upgradeTower,
  sellTower: state.sellTower,
  startNextWave: state.startNextWave,
  startGame: state.startGame,
  restart: state.restart,
}));
