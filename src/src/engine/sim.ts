import { GameState, Mob, Projectile, Vec2, TOWER_STATS, MOB_STATS, WAVES } from './types';
import { findTarget, predictMobPosition } from './targeting';
import { getPathWorldPositions } from './grid';
import { GAME_CONFIG } from '../constants';

let nextId = 0;
function generateId(): string {
  return `id_${++nextId}`;
}

function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(v: Vec2): Vec2 { 
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

function updateMobs(game: GameState, deltaTime: number, tileSize: number): GameState {
  const pathPositions = getPathWorldPositions(game.grid, tileSize);
  const updatedMobs: Mob[] = [];

  for (const mob of game.mobs) {
    const newMob = { ...mob };

    // Apply slow effects
    let currentSpeed = newMob.baseSpeed;
    if (newMob.slowUntil && game.time < newMob.slowUntil) {
      currentSpeed *= GAME_CONFIG.MOB_SLOW_FACTOR; // 60% speed reduction when slowed
    }
    newMob.speed = Math.max(currentSpeed, newMob.baseSpeed * GAME_CONFIG.MOB_MIN_SPEED_FACTOR); // Minimum 30% speed

    // Move along path
    if (newMob.pathIndex < pathPositions.length - 1) {
      const current = newMob.pos;
      const target = pathPositions[newMob.pathIndex + 1];
      const direction = normalize({
        x: target.x - current.x,
        y: target.y - current.y
      });

      const moveDistance = newMob.speed * deltaTime;
      const newPos = {
        x: current.x + direction.x * moveDistance,
        y: current.y + direction.y * moveDistance
      };

      // Check if we reached the target waypoint
      const distanceToTarget = distance(current, target);
      if (distanceToTarget <= moveDistance) {
        newMob.pos = target;
        newMob.pathIndex++;
      } else {
        newMob.pos = newPos;
      }

      updatedMobs.push(newMob);
    }
    // Mob reached the end - will be handled by reducing lives
  }

  return { ...game, mobs: updatedMobs };
}

function updateTowers(game: GameState, _deltaTime: number, tileSize: number): { game: GameState; newProjectiles: Projectile[] } {
  const pathPositions = getPathWorldPositions(game.grid, tileSize);
  const newProjectiles: Projectile[] = [];

  const updatedTowers = game.towers.map(tower => {
    const timeSinceLastFire = game.time - tower.lastFiredAt;
    const fireRate = 1 / tower.rate; // seconds between shots

    if (timeSinceLastFire >= fireRate) {
      const target = findTarget(tower, game.mobs, tileSize);
      if (target) {
        // Calculate projectile travel time for prediction
        const towerPos = {
          x: tower.tile.x * tileSize + tileSize / 2,
          y: tower.tile.y * tileSize + tileSize / 2
        };
        
        let targetPos = target.pos;
        
        // Predict target position for moving projectiles
        if (tower.projectileSpeed) {
          const distanceToTarget = distance(towerPos, targetPos);
          const travelTime = distanceToTarget / tower.projectileSpeed;
          targetPos = predictMobPosition(target, travelTime, pathPositions);
        }

        const projectile: Projectile = {
          id: generateId(),
          pos: { ...towerPos },
          targetId: target.id,
          targetPos,
          speed: tower.projectileSpeed || 0,
          damage: tower.damage,
          kind: tower.kind,
          createdAt: game.time
        };

        // Add splash radius for cannons
        if (tower.kind === 'cannon') {
          const stats = TOWER_STATS[tower.kind][tower.tier - 1];
          projectile.splash = stats.splash;
        }

        newProjectiles.push(projectile);

        return {
          ...tower,
          lastFiredAt: game.time
        };
      }
    }

    return tower;
  });

  return {
    game: { ...game, towers: updatedTowers },
    newProjectiles
  };
}

function updateProjectiles(game: GameState, deltaTime: number): { game: GameState; hits: Array<{ mobId: string; damage: number; slow?: { duration: number; factor: number } }> } {
  const updatedProjectiles: Projectile[] = [];
  const hits: Array<{ mobId: string; damage: number; slow?: { duration: number; factor: number } }> = [];

  for (const projectile of game.projectiles) {
    if (projectile.speed === 0) {
      // Instant hit (frost towers)
      const target = game.mobs.find(m => m.id === projectile.targetId);
      if (target) {
        const stats = TOWER_STATS[projectile.kind].find(s => s.damage <= projectile.damage) || TOWER_STATS[projectile.kind][0];
        hits.push({
          mobId: target.id,
          damage: projectile.damage,
          slow: stats.slow
        });
      }
      continue; // Don't add to updated projectiles (instant removal)
    }

    // Move projectile towards target
    const direction = normalize({
      x: projectile.targetPos.x - projectile.pos.x,
      y: projectile.targetPos.y - projectile.pos.y
    });

    const moveDistance = projectile.speed * deltaTime;
    const newPos = {
      x: projectile.pos.x + direction.x * moveDistance,
      y: projectile.pos.y + direction.y * moveDistance
    };

    const distanceToTarget = distance(projectile.pos, projectile.targetPos);

    if (distanceToTarget <= moveDistance) {
      // Projectile hit target
      if (projectile.splash) {
        // Splash damage - hit all mobs within radius
        for (const mob of game.mobs) {
          const distanceToMob = distance(projectile.targetPos, mob.pos);
          if (distanceToMob <= projectile.splash.radius) {
            // Apply falloff damage (optional - for now, full damage in radius)
            hits.push({
              mobId: mob.id,
              damage: projectile.damage
            });
          }
        }
      } else {
        // Single target
        const target = game.mobs.find(m => m.id === projectile.targetId);
        if (target) {
          const stats = TOWER_STATS[projectile.kind].find(s => s.damage <= projectile.damage) || TOWER_STATS[projectile.kind][0];
          hits.push({
            mobId: target.id,
            damage: projectile.damage,
            slow: stats.slow
          });
        }
      }
    } else {
      // Continue moving
      updatedProjectiles.push({
        ...projectile,
        pos: newPos
      });
    }
  }

  return {
    game: { ...game, projectiles: updatedProjectiles },
    hits
  };
}

function applyDamage(game: GameState, hits: Array<{ mobId: string; damage: number; slow?: { duration: number; factor: number } }>): { game: GameState; killedMobs: Mob[] } {
  const killedMobs: Mob[] = [];
  const updatedMobs = game.mobs.map(mob => {
    const mobHits = hits.filter(h => h.mobId === mob.id);
    if (mobHits.length === 0) return mob;

    let newMob = { ...mob };
    let totalDamage = 0;

    for (const hit of mobHits) {
      // Apply armor reduction
      const effectiveDamage = Math.max(1, hit.damage - newMob.armor);
      totalDamage += effectiveDamage;

      // Apply slow effect
      if (hit.slow) {
        newMob.slowUntil = Math.max(newMob.slowUntil || 0, game.time + hit.slow.duration);
      }
    }

    newMob.hp -= totalDamage;

    if (newMob.hp <= 0) {
      killedMobs.push(newMob);
      return null; // Will be filtered out
    }

    return newMob;
  }).filter(Boolean) as Mob[];

  return {
    game: { ...game, mobs: updatedMobs },
    killedMobs
  };
}

function spawnWave(game: GameState, tileSize: number): GameState {
  if (game.currentWave > WAVES.length) {
    return { ...game, victory: true };
  }

  // Don't spawn new mobs if wave is completed
  if (game.waveCompleted) {
    return game;
  }

  const wave = WAVES[game.currentWave - 1];
  if (!game.waveStartTime) {
    return { ...game, waveStartTime: game.time };
  }

  const waveTime = game.time - game.waveStartTime;
  const pathPositions = getPathWorldPositions(game.grid, tileSize);
  const spawnPos = pathPositions[0];
  const newMobs: Mob[] = [];

  for (const entry of wave.entries) {
    if (waveTime >= entry.delay) {
      const entryTime = waveTime - entry.delay;
      const spawnInterval = entry.spacing;
      const mobsToSpawn = Math.min(
        entry.count,
        Math.floor(entryTime / spawnInterval) + 1
      );

      for (let i = 0; i < mobsToSpawn; i++) {
        const spawnTime = entry.delay + i * spawnInterval;
        const existing = game.mobs.find(m => 
          Math.abs(m.spawnTime - (game.waveStartTime! + spawnTime)) < 0.1
        );
        
        if (!existing) {
          const stats = MOB_STATS[entry.kind];
          const mob: Mob = {
            id: generateId(),
            pos: { ...spawnPos },
            hp: stats.hp,
            maxHp: stats.hp,
            speed: stats.speed,
            baseSpeed: stats.speed,
            armor: stats.armor,
            bounty: stats.bounty,
            type: entry.kind, // Use entry.kind directly instead of stats.type
            pathIndex: 0,
            spawnTime: game.waveStartTime + spawnTime
          };
          
          newMobs.push(mob);
        }
      }
    }
  }

  return { ...game, mobs: [...game.mobs, ...newMobs] };
}

export function advanceTick(game: GameState, deltaTime: number, tileSize: number = 32): GameState {
  if (game.paused || game.gameOver || !game.gameStarted) return game;

  let newGame = { ...game, time: game.time + deltaTime };
  console.log('Advancing tick', {
    newGame,
  });

  // Check if current wave is complete - simplified logic
  if (newGame.waveStartTime && !newGame.waveCompleted) {
    const waveTime = newGame.time - newGame.waveStartTime;
    const WAVE_DURATION = GAME_CONFIG.WAVE_DURATION; // 30 seconds per wave
    
    // Wave is complete after 30 seconds
    if (waveTime >= WAVE_DURATION) {
      const wave = WAVES[newGame.currentWave - 1];
      newGame.waveCompleted = true;
      newGame.money += wave.reward;
      newGame.waveCompletedTime = newGame.time;
      
      if (newGame.currentWave >= WAVES.length) {
        newGame.victory = true;
        newGame.gameOver = true;
      }
    }
  }

  // Auto-start next wave after 30 seconds
  if (newGame.waveCompleted && newGame.waveCompletedTime && !newGame.victory && !newGame.gameOver) {
    const timeSinceCompleted = newGame.time - newGame.waveCompletedTime;
    if (timeSinceCompleted >= GAME_CONFIG.WAVE_AUTO_START_DELAY) {
      newGame = startNextWave(newGame);
    }
  }

  // Spawn next wave
  if (!newGame.victory && !newGame.gameOver) {
    newGame = spawnWave(newGame, tileSize);
  }

  // Update mobs
  newGame = updateMobs(newGame, deltaTime, tileSize);

  // Check for mobs that reached the end
  const mobsAtEnd = newGame.mobs.filter(mob => mob.pathIndex >= newGame.grid.path.length - 1);
  if (mobsAtEnd.length > 0) {
    newGame.lives -= mobsAtEnd.length;
    newGame.mobs = newGame.mobs.filter(mob => mob.pathIndex < newGame.grid.path.length - 1);
    
    if (newGame.lives <= 0) {
      newGame.gameOver = true;
    }
  }

  // Update towers and create projectiles
  const towerResult = updateTowers(newGame, deltaTime, tileSize);
  newGame = towerResult.game;
  newGame.projectiles = [...newGame.projectiles, ...towerResult.newProjectiles];

  // Update projectiles and detect hits
  const projectileResult = updateProjectiles(newGame, deltaTime);
  newGame = projectileResult.game;

  // Apply damage and handle killed mobs
  const damageResult = applyDamage(newGame, projectileResult.hits);
  newGame = damageResult.game;

  // Award money for killed mobs
  const bounty = damageResult.killedMobs.reduce((sum, mob) => sum + mob.bounty, 0);
  newGame.money += bounty;

  return newGame;
}

export function startNextWave(game: GameState): GameState {
  if (game.waveCompleted && game.currentWave < WAVES.length) {
    return {
      ...game,
      currentWave: game.currentWave + 1,
      waveStartTime: undefined,
      waveCompleted: false,
      waveCompletedTime: undefined
    };
  }
  return game;
}

export function canAffordTower(game: GameState, towerKind: string, tier: number = 1): boolean {
  const stats = TOWER_STATS[towerKind as keyof typeof TOWER_STATS];
  if (!stats || !stats[tier - 1]) return false;
  return game.money >= stats[tier - 1].cost;
}

export function canUpgradeTower(game: GameState, towerId: string): boolean {
  const tower = game.towers.find(t => t.id === towerId);
  if (!tower || tower.tier >= 3) return false;
  
  const nextTierStats = TOWER_STATS[tower.kind][tower.tier];
  return game.money >= nextTierStats.cost;
}