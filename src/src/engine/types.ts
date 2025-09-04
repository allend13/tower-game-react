export type Vec2 = { x: number; y: number };

export type TileType = 'path' | 'buildable' | 'blocked';

export type MobType = 'normal' | 'fast' | 'tank' | 'flying';

export type Mob = {
  id: string;
  pos: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  armor: number;
  bounty: number;
  type: MobType;
  pathIndex: number;
  slowUntil?: number;
  spawnTime: number;
};

export type TowerKind = 'arrow' | 'cannon' | 'frost';

export type Tower = {
  id: string;
  tile: Vec2;
  range: number;
  damage: number;
  rate: number; // attacks per second
  projectileSpeed?: number;
  lastFiredAt: number;
  kind: TowerKind;
  tier: 1 | 2 | 3;
  cost: number;
  kills: number;
};

export type Projectile = {
  id: string;
  pos: Vec2;
  targetId: string;
  targetPos: Vec2; // for prediction
  speed: number;
  damage: number;
  kind: TowerKind;
  splash?: { radius: number };
  createdAt: number;
};

export type WaveEntry = {
  delay: number;
  kind: MobType;
  count: number;
  spacing: number;
};

export type Wave = {
  id: number;
  entries: WaveEntry[];
  reward: number;
};

export type GameGrid = {
  width: number;
  height: number;
  tiles: TileType[][];
  path: Vec2[];
};

export type GameState = {
  time: number;
  money: number;
  lives: number;
  currentWave: number;
  waveStartTime?: number;
  waveCompleted: boolean;
  waveCompletedTime?: number;
  gameOver: boolean;
  victory: boolean;
  paused: boolean;
  speed: 1 | 2;
  gameStarted: boolean;
  grid: GameGrid;
  mobs: Mob[];
  towers: Tower[];
  projectiles: Projectile[];
  selectedTile?: Vec2;
  buildingTower?: TowerKind;
  selectedTower?: string;
};

export type TowerStats = {
  kind: TowerKind;
  tier: 1 | 2 | 3;
  name: string;
  cost: number;
  damage: number;
  range: number;
  rate: number;
  projectileSpeed?: number;
  splash?: { radius: number };
  slow?: { duration: number; factor: number };
  description: string;
};

export const TOWER_STATS: Record<TowerKind, TowerStats[]> = {
  arrow: [
    {
      kind: 'arrow',
      tier: 1,
      name: 'Archer Tower',
      cost: 100,
      damage: 15,
      range: 80,
      rate: 2,
      projectileSpeed: 300,
      description: 'Fast single-target attacks'
    },
    {
      kind: 'arrow',
      tier: 2,
      name: 'Ranger Tower',
      cost: 40,
      damage: 25,
      range: 80,
      rate: 2,
      projectileSpeed: 350,
      description: 'Increased damage'
    },
    {
      kind: 'arrow',
      tier: 3,
      name: 'Sniper Tower',
      cost: 80,
      damage: 40,
      range: 100,
      rate: 2,
      projectileSpeed: 400,
      description: 'Extended range and damage'
    }
  ],
  cannon: [
    {
      kind: 'cannon',
      tier: 1,
      name: 'Cannon',
      cost: 150,
      damage: 40,
      range: 60,
      rate: 0.8,
      projectileSpeed: 200,
      splash: { radius: 40 },
      description: 'Slow but powerful splash damage'
    },
    {
      kind: 'cannon',
      tier: 2,
      name: 'Artillery',
      cost: 80,
      damage: 60,
      range: 60,
      rate: 0.8,
      projectileSpeed: 220,
      splash: { radius: 50 },
      description: 'Explosive shells'
    },
    {
      kind: 'cannon',
      tier: 3,
      name: 'Destroyer',
      cost: 150,
      damage: 90,
      range: 60,
      rate: 1.0,
      projectileSpeed: 250,
      splash: { radius: 60 },
      description: 'Rapid fire cannons'
    }
  ],
  frost: [
    {
      kind: 'frost',
      tier: 1,
      name: 'Ice Tower',
      cost: 120,
      damage: 10,
      range: 70,
      rate: 1.5,
      projectileSpeed: 250,
      slow: { duration: 2, factor: 0.5 },
      description: 'Slows enemies by 50%'
    },
    {
      kind: 'frost',
      tier: 2,
      name: 'Frost Tower',
      cost: 60,
      damage: 10,
      range: 85,
      rate: 1.5,
      projectileSpeed: 280,
      slow: { duration: 3, factor: 0.4 },
      description: 'Wider freeze effect'
    },
    {
      kind: 'frost',
      tier: 3,
      name: 'Blizzard Tower',
      cost: 120,
      damage: 20,
      range: 85,
      rate: 2.0,
      projectileSpeed: 300,
      slow: { duration: 4, factor: 0.3 },
      description: 'Deep freeze'
    }
  ]
};

export type MobStats = {
  type: MobType;
  hp: number;
  speed: number;
  armor: number;
  bounty: number;
  size: number;
};

export const MOB_STATS: Record<MobType, MobStats> = {
  normal: { type: 'normal', hp: 100, speed: 80, armor: 0, bounty: 10, size: 12 },
  fast: { type: 'fast', hp: 60, speed: 140, armor: 0, bounty: 15, size: 10 },
  tank: { type: 'tank', hp: 300, speed: 50, armor: 5, bounty: 25, size: 16 },
  flying: { type: 'flying', hp: 80, speed: 100, armor: 0, bounty: 20, size: 12 }
};

export const WAVES: Wave[] = [
  { id: 1, entries: [
    { delay: 0, kind: 'normal', count: 8, spacing: 1.2 },
    { delay: 12, kind: 'fast', count: 2, spacing: 1.5 }
  ], reward: 50 },
  { id: 2, entries: [
    { delay: 0, kind: 'normal', count: 12, spacing: 0.9 },
    { delay: 8, kind: 'fast', count: 3, spacing: 1.0 },
    { delay: 18, kind: 'flying', count: 1, spacing: 1.0 }
  ], reward: 75 },
  { id: 3, entries: [
    { delay: 0, kind: 'normal', count: 10, spacing: 0.8 },
    { delay: 5, kind: 'fast', count: 6, spacing: 0.6 }
  ], reward: 100 },
  { id: 4, entries: [
    { delay: 0, kind: 'fast', count: 12, spacing: 0.7 },
    { delay: 10, kind: 'tank', count: 1, spacing: 1.0 }
  ], reward: 125 },
  { id: 5, entries: [
    { delay: 0, kind: 'normal', count: 15, spacing: 0.6 },
    { delay: 8, kind: 'tank', count: 3, spacing: 2.0 }
  ], reward: 150 },
  { id: 6, entries: [
    { delay: 0, kind: 'flying', count: 8, spacing: 0.8 },
    { delay: 10, kind: 'fast', count: 5, spacing: 0.5 }
  ], reward: 175 },
  { id: 7, entries: [
    { delay: 0, kind: 'fast', count: 15, spacing: 0.5 },
    { delay: 6, kind: 'tank', count: 5, spacing: 1.5 }
  ], reward: 200 },
  { id: 8, entries: [
    { delay: 0, kind: 'normal', count: 20, spacing: 0.4 },
    { delay: 5, kind: 'flying', count: 10, spacing: 0.6 },
    { delay: 12, kind: 'tank', count: 3, spacing: 1.0 }
  ], reward: 250 },
  { id: 9, entries: [
    { delay: 0, kind: 'tank', count: 8, spacing: 1.0 },
    { delay: 10, kind: 'fast', count: 20, spacing: 0.3 },
    { delay: 15, kind: 'flying', count: 8, spacing: 0.5 }
  ], reward: 300 },
  { id: 10, entries: [
    { delay: 0, kind: 'normal', count: 30, spacing: 0.3 },
    { delay: 5, kind: 'fast', count: 15, spacing: 0.4 },
    { delay: 10, kind: 'tank', count: 10, spacing: 0.8 },
    { delay: 15, kind: 'flying', count: 15, spacing: 0.5 }
  ], reward: 500 }
];

// Tower icons mapping using emoji
export const TOWER_ICONS = {
  arrow: '🏹',
  cannon: '💣',
  frost: '❄️'
};