import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
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
  waveCompleted: false, // First wave is not completed yet
  gameOver: false,
  victory: false,
  paused: false,
  speed: 1,
  gameStarted: false, // Game starts after intro modal
  grid: createGrid(),
  mobs: [],
  towers: [],
  projectiles: [],
});

// Actions
type GameAction =
  | { type: 'TICK'; deltaTime: number; tileSize: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_SPEED'; speed: 1 | 2 }
  | { type: 'SELECT_TILE'; tile: Vec2 }
  | { type: 'START_BUILDING'; towerKind: TowerKind }
  | { type: 'CANCEL_BUILDING' }
  | { type: 'BUILD_TOWER'; tile: Vec2 }
  | { type: 'SELECT_TOWER'; towerId: string | null }
  | { type: 'UPGRADE_TOWER'; towerId: string }
  | { type: 'SELL_TOWER'; towerId: string }
  | { type: 'START_NEXT_WAVE' }
  | { type: 'START_GAME' }
  | { type: 'RESTART' };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK':
      return advanceTick(state, action.deltaTime, action.tileSize);

    case 'PAUSE':
      return { ...state, paused: true };

    case 'RESUME':
      return { ...state, paused: false };

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'SELECT_TILE':
      return { ...state, selectedTile: action.tile, selectedTower: undefined };

    case 'START_BUILDING':
      if (!canAffordTower(state, action.towerKind)) return state;
      return { 
        ...state, 
        buildingTower: action.towerKind,
        selectedTower: undefined
      };

    case 'CANCEL_BUILDING':
      return { 
        ...state, 
        buildingTower: undefined,
        selectedTile: undefined
      };

    case 'BUILD_TOWER': {
      if (!state.buildingTower) return state;
      
      const tile = action.tile;
      
      // Check bounds
      if (tile.x < 0 || tile.x >= state.grid.width || tile.y < 0 || tile.y >= state.grid.height) return state;
      
      if (state.grid.tiles[tile.y][tile.x] !== 'buildable') return state;
      
      // Check if tile is already occupied
      if (state.towers.some(t => t.tile.x === tile.x && t.tile.y === tile.y)) return state;
      
      const towerStats = TOWER_STATS[state.buildingTower][0];
      if (state.money < towerStats.cost) return state;

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

      return {
        ...state,
        towers: [...state.towers, newTower],
        money: state.money - towerStats.cost,
        buildingTower: undefined,
        selectedTile: tile,
        selectedTower: newTower.id
      };
    }

    case 'SELECT_TOWER':
      return { 
        ...state, 
        selectedTower: action.towerId || undefined,
        buildingTower: undefined,
        selectedTile: undefined
      };

    case 'UPGRADE_TOWER': {
      const tower = state.towers.find(t => t.id === action.towerId);
      if (!tower || tower.tier >= 3) return state;
      
      const nextTierStats = TOWER_STATS[tower.kind][tower.tier];
      if (state.money < nextTierStats.cost) return state;

      const updatedTowers = state.towers.map(t => 
        t.id === action.towerId 
          ? {
              ...t,
              tier: (t.tier + 1) as 1 | 2 | 3,
              damage: nextTierStats.damage,
              range: nextTierStats.range,
              rate: nextTierStats.rate,
              projectileSpeed: nextTierStats.projectileSpeed
            }
          : t
      );

      return {
        ...state,
        towers: updatedTowers,
        money: state.money - nextTierStats.cost
      };
    }

    case 'SELL_TOWER': {
      const tower = state.towers.find(t => t.id === action.towerId);
      if (!tower) return state;

      // Calculate sell value (50% of total investment)
      let totalCost = 0;
      for (let tier = 1; tier <= tower.tier; tier++) {
        totalCost += TOWER_STATS[tower.kind][tier - 1].cost;
      }
      const sellValue = Math.floor(totalCost * 0.5);

      return {
        ...state,
        towers: state.towers.filter(t => t.id !== action.towerId),
        money: state.money + sellValue,
        selectedTower: undefined
      };
    }

    case 'START_NEXT_WAVE':
      return startNextWave(state);

    case 'START_GAME':
      return { 
        ...state, 
        gameStarted: true,
        waveCompletedTime: state.time // This will trigger auto-start after 30 seconds
      };

    case 'RESTART':
      return createInitialState();

    default:
      return state;
  }
}

// Context
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  isRunning: boolean;
  startGame: () => void;
  stopGame: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

// Provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const isRunningRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const gameLoop = useCallback((currentTime: number) => {
    if (!isRunningRef.current) return;

    const deltaTime = lastTimeRef.current === 0 ? 0 : (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    // Cap delta time to prevent spiral of death
    const cappedDeltaTime = Math.min(deltaTime, GAME_CONFIG.MAX_DELTA_TIME) * state.speed;

    if (cappedDeltaTime > 0) {
      dispatch({ type: 'TICK', deltaTime: cappedDeltaTime, tileSize: GAME_CONFIG.TILE_SIZE });
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [state.speed]);

  const startGame = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const stopGame = useCallback(() => {
    isRunningRef.current = false;
    lastTimeRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Auto-start/stop based on game state
  useEffect(() => {
    if (state.gameOver || state.paused || !state.gameStarted) {
      stopGame();
    } else if (!isRunningRef.current) {
      startGame();
    }
  }, [state.gameOver, state.paused, state.gameStarted, startGame, stopGame]);

  // Restart game loop when speed changes
  useEffect(() => {
    if (isRunningRef.current && !state.gameOver && !state.paused && state.gameStarted) {
      stopGame();
      startGame();
    }
  }, [state.speed, startGame, stopGame, state.gameOver, state.paused, state.gameStarted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const contextValue: GameContextType = {
    state,
    dispatch,
    isRunning: isRunningRef.current,
    startGame,
    stopGame
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Selector hooks for performance
export function useGameState() {
  return useGame().state;
}

export function useGameActions() {
  const { dispatch } = useGame();

  return {
    pause: () => dispatch({ type: 'PAUSE' }),
    resume: () => dispatch({ type: 'RESUME' }),
    setSpeed: (speed: 1 | 2) => dispatch({ type: 'SET_SPEED', speed }),
    selectTile: (tile: Vec2) => dispatch({ type: 'SELECT_TILE', tile }),
    startBuilding: (towerKind: TowerKind) => dispatch({ type: 'START_BUILDING', towerKind }),
    cancelBuilding: () => dispatch({ type: 'CANCEL_BUILDING' }),
    buildTower: (tile: Vec2) => dispatch({ type: 'BUILD_TOWER', tile }),
    selectTower: (towerId: string | null) => dispatch({ type: 'SELECT_TOWER', towerId }),
    upgradeTower: (towerId: string) => dispatch({ type: 'UPGRADE_TOWER', towerId }),
    sellTower: (towerId: string) => dispatch({ type: 'SELL_TOWER', towerId }),
    startNextWave: () => dispatch({ type: 'START_NEXT_WAVE' }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    restart: () => dispatch({ type: 'RESTART' })
  };
}