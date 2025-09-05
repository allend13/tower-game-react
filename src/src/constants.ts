// Game Configuration
export const GAME_CONFIG = {
  // Game Loop
  MIN_FPS: 30,
  MAX_DELTA_TIME: 1 / 30, // Maximum delta time to prevent spiral of death
  TILE_SIZE: 32,
  
  // Game State
  INITIAL_MONEY: 500,
  INITIAL_LIVES: 20,
  INITIAL_WAVE: 1,
  
  // Wave System
  WAVE_DURATION: 30, // seconds per wave
  WAVE_AUTO_START_DELAY: 30, // seconds between waves
  TOTAL_WAVES: 10,
  
  // Mob System
  MOB_SLOW_FACTOR: 0.4, // 60% speed reduction when slowed
  MOB_MIN_SPEED_FACTOR: 0.3, // Minimum 30% of base speed
  
  // Grid
  GRID_WIDTH: 20,
  GRID_HEIGHT: 15,
  
  // UI
  PROGRESS_BAR_WIDTH: 100, // percentage
  DEBOUNCE_DELAY: 100, // milliseconds
} as const;

// Towers Configuration
export const TOWERS_CONFIG = {
  archer: {
    tier1: {
      cost: 100,
      damage: 15,
      range: 80,
      rate: 2,
      projectileSpeed: 300,
    },
    tier2: {
      cost: 40,
      damage: 25,
      range: 80,
      rate: 2,
      projectileSpeed: 350,
    },
    tier3: {
      cost: 80,
      damage: 40,
      range: 100,
      rate: 2,
      projectileSpeed: 400,
    },
  },
  cannon: {
    tier1: {
      cost: 150,
      damage: 40,
      range: 60,
      rate: 0.8,
      projectileSpeed: 200,
      splashRadius: 40,
    },
    tier2: {
      cost: 80,
      damage: 60,
      range: 60,
      rate: 0.8,
      projectileSpeed: 220,
      splashRadius: 50,
    },
    tier3: {
      cost: 150,
      damage: 90,
      range: 60,
      rate: 1.0,
      projectileSpeed: 250,
      splashRadius: 60,
    },
  },
  frost: {
    tier1: {
      cost: 120,
      damage: 10,
      range: 70,
      rate: 1.5,
      projectileSpeed: 250,
      slowDuration: 2,
      slowFactor: 0.5,
    },
    tier2: {
      cost: 60,
      damage: 10,
      range: 85,
      rate: 1.5,
      projectileSpeed: 280,
      slowDuration: 3,
      slowFactor: 0.4,
    },
    tier3: {
      cost: 120,
      damage: 20,
      range: 85,
      rate: 2.0,
      projectileSpeed: 300,
      slowDuration: 4,
      slowFactor: 0.3,
    },
  },
} as const;

// Mobs Configuration
export const MOB_CONFIG = {
  normal: {
    hp: 100,
    speed: 80,
    armor: 0,
    bounty: 10,
    size: 12,
  },
  fast: {
    hp: 60,
    speed: 140,
    armor: 0,
    bounty: 15,
    size: 10,
  },
  tank: {
    hp: 300,
    speed: 50,
    armor: 5,
    bounty: 25,
    size: 16,
  },
  flying: {
    hp: 80,
    speed: 100,
    armor: 0,
    bounty: 20,
    size: 12,
  },
} as const;

// Wave Rewards
export const WAVE_REWARDS = {
  WAVE_1: 50,
  WAVE_2: 75,
  WAVE_3: 100,
  WAVE_4: 125,
  WAVE_5: 150,
  WAVE_6: 175,
  WAVE_7: 200,
  WAVE_8: 250,
  WAVE_9: 300,
  WAVE_10: 500,
} as const;

