import { GameGrid, TileType, Vec2 } from './types';
import { GAME_CONFIG } from '../constants';



export function createGrid(): GameGrid {
  const width = GAME_CONFIG.GRID_WIDTH;
  const height = GAME_CONFIG.GRID_HEIGHT;
  const tiles: TileType[][] = Array(height).fill(null).map(() => Array(width).fill('buildable'));

  // Create a path from left to right with some turns
  const pathPoints = [
    { x: 0, y: 7 },
    { x: 5, y: 7 },
    { x: 5, y: 4 },
    { x: 10, y: 4 },
    { x: 10, y: 10 },
    { x: 15, y: 10 },
    { x: 15, y: 7 },
    { x: 19, y: 7 }
  ];

  // Draw path between points and build ordered path
  const path: Vec2[] = [];
  
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const start = pathPoints[i];
    const end = pathPoints[i + 1];

    if (start.x === end.x) {
      // Vertical line - maintain direction from start to end
      const step = start.y < end.y ? 1 : -1;
      for (let y = start.y; step > 0 ? y <= end.y : y >= end.y; y += step) {
        tiles[y][start.x] = 'path';
        
        // Add to path - skip if this is same as previous point
        const lastPoint = path[path.length - 1];
        if (!lastPoint || lastPoint.x !== start.x || lastPoint.y !== y) {
          path.push({ x: start.x, y });
        }
      }
    } else {
      // Horizontal line - maintain direction from start to end
      const step = start.x < end.x ? 1 : -1;
      for (let x = start.x; step > 0 ? x <= end.x : x >= end.x; x += step) {
        tiles[start.y][x] = 'path';
        
        // Add to path - skip if this is same as previous point
        const lastPoint = path[path.length - 1];
        if (!lastPoint || lastPoint.x !== x || lastPoint.y !== start.y) {
          path.push({ x, y: start.y });
        }
      }
    }
  }

  return { width, height, tiles, path };
}

export function getTileAt(grid: GameGrid, pos: Vec2): TileType | null {
  if (pos.x < 0 || pos.x >= grid.width || pos.y < 0 || pos.y >= grid.height) {
    return null;
  }
  return grid.tiles[pos.y][pos.x];
}

export function canBuildAt(grid: GameGrid, pos: Vec2): boolean {
  const tile = getTileAt(grid, pos);
  return tile === 'buildable';
}

export function worldToGrid(worldPos: Vec2, tileSize: number): Vec2 {
  return {
    x: Math.floor(worldPos.x / tileSize),
    y: Math.floor(worldPos.y / tileSize)
  };
}

export function gridToWorld(gridPos: Vec2, tileSize: number): Vec2 {
  return {
    x: gridPos.x * tileSize + tileSize / 2,
    y: gridPos.y * tileSize + tileSize / 2
  };
}

export function getPathWorldPositions(grid: GameGrid, tileSize: number): Vec2[] {
  return grid.path.map(pos => gridToWorld(pos, tileSize));
}