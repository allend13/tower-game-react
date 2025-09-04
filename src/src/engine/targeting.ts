import { Mob, Tower, Vec2 } from './types';

export type TargetingStrategy = 'first' | 'last' | 'nearest' | 'strongest' | 'weakest';

function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isInRange(tower: Tower, mob: Mob, tileSize: number): boolean {
  const towerPos = {
    x: tower.tile.x * tileSize + tileSize / 2,
    y: tower.tile.y * tileSize + tileSize / 2
  };
  return distance(towerPos, mob.pos) <= tower.range;
}

export function findTarget(
  tower: Tower,
  mobs: Mob[],
  tileSize: number,
  strategy: TargetingStrategy = 'first'
): Mob | null {
  const towerPos = {
    x: tower.tile.x * tileSize + tileSize / 2,
    y: tower.tile.y * tileSize + tileSize / 2
  };

  // Filter mobs in range
  const mobsInRange = mobs.filter(mob => {
    // Flying mobs can only be targeted by certain towers
    if (mob.type === 'flying' && tower.kind === 'cannon') {
      return false; // Cannons can't hit flying enemies
    }
    return distance(towerPos, mob.pos) <= tower.range;
  });

  if (mobsInRange.length === 0) return null;

  switch (strategy) {
    case 'first':
      // Target mob that's furthest along the path
      return mobsInRange.reduce((best, mob) => 
        mob.pathIndex > best.pathIndex ? mob : best
      );

    case 'last':
      // Target mob that's least far along the path
      return mobsInRange.reduce((best, mob) => 
        mob.pathIndex < best.pathIndex ? mob : best
      );

    case 'nearest':
      // Target closest mob
      return mobsInRange.reduce((best, mob) => {
        const bestDist = distance(towerPos, best.pos);
        const mobDist = distance(towerPos, mob.pos);
        return mobDist < bestDist ? mob : best;
      });

    case 'strongest':
      // Target mob with most HP
      return mobsInRange.reduce((best, mob) => 
        mob.hp > best.hp ? mob : best
      );

    case 'weakest':
      // Target mob with least HP
      return mobsInRange.reduce((best, mob) => 
        mob.hp < best.hp ? mob : best
      );

    default:
      return mobsInRange[0];
  }
}

export function predictMobPosition(mob: Mob, deltaTime: number, pathPositions: Vec2[]): Vec2 {
  if (mob.pathIndex >= pathPositions.length - 1) {
    return mob.pos;
  }

  const currentSpeed = mob.speed;
  const futureDistance = currentSpeed * deltaTime;
  
  // Find where the mob will be after deltaTime
  let remainingDistance = futureDistance;
  let currentIndex = mob.pathIndex;
  let currentPos = { ...mob.pos };

  while (remainingDistance > 0 && currentIndex < pathPositions.length - 1) {
    const target = pathPositions[currentIndex + 1];
    const toTarget = {
      x: target.x - currentPos.x,
      y: target.y - currentPos.y
    };
    const distanceToTarget = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y);

    if (distanceToTarget <= remainingDistance) {
      // Mob will reach the next waypoint
      currentPos = target;
      remainingDistance -= distanceToTarget;
      currentIndex++;
    } else {
      // Mob will be somewhere between current and next waypoint
      const ratio = remainingDistance / distanceToTarget;
      currentPos.x += toTarget.x * ratio;
      currentPos.y += toTarget.y * ratio;
      remainingDistance = 0;
    }
  }

  return currentPos;
}