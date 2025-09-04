import { GameState, Mob, Tower, Projectile, Vec2, TowerKind, MobType, TOWER_STATS, TOWER_ICONS } from '../engine/types';
import { gridToWorld } from '../engine/grid';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 32;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  getTileSize(): number {
    return this.tileSize;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderGrid(game: GameState) {
    const { grid } = game;

    // Render tiles
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const tileType = grid.tiles[y][x];
        const worldPos = gridToWorld({ x, y }, this.tileSize);
        
        this.ctx.fillStyle = this.getTileColor(tileType);
        this.ctx.fillRect(
          worldPos.x - this.tileSize / 2,
          worldPos.y - this.tileSize / 2,
          this.tileSize,
          this.tileSize
        );

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
          worldPos.x - this.tileSize / 2,
          worldPos.y - this.tileSize / 2,
          this.tileSize,
          this.tileSize
        );
      }
    }

    // Highlight selected tile
    if (game.selectedTile) {
      const worldPos = gridToWorld(game.selectedTile, this.tileSize);
      this.ctx.strokeStyle = '#60a5fa';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(
        worldPos.x - this.tileSize / 2,
        worldPos.y - this.tileSize / 2,
        this.tileSize,
        this.tileSize
      );
    }

    // Show build preview
    if (game.buildingTower && game.selectedTile) {
      this.renderBuildPreview(game.buildingTower, game.selectedTile, game);
    }
  }

  renderTowers(towers: Tower[], selectedTowerId?: string) {
    for (const tower of towers) {
      const worldPos = gridToWorld(tower.tile, this.tileSize);
      
      // Only show border for selected tower
      if (selectedTowerId === tower.id) {
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(worldPos.x, worldPos.y, this.tileSize * 0.4, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // Tower icon based on type
      this.renderTowerIcon(tower.kind, worldPos, this.tileSize * 0.35);

      // Tower tier indicator (small number)
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(tower.tier.toString(), worldPos.x + this.tileSize * 0.2, worldPos.y - this.tileSize * 0.2);
    }
  }

  renderMobs(mobs: Mob[]) {
    for (const mob of mobs) {
      const size = this.getMobSize(mob.type);
      
      // Special rendering for different mob types
      if (mob.type === 'flying') {
        // Flying mobs have a shadow effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(mob.pos.x + 2, mob.pos.y + 2, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Mob body
      this.ctx.fillStyle = this.getMobColor(mob.type);
      
      if (mob.type === 'tank') {
        // Tank mobs are squares
        this.ctx.fillRect(
          mob.pos.x - size,
          mob.pos.y - size,
          size * 2,
          size * 2
        );
      } else if (mob.type === 'fast') {
        // Fast mobs are triangles pointing forward
        this.ctx.beginPath();
        this.ctx.moveTo(mob.pos.x + size, mob.pos.y);
        this.ctx.lineTo(mob.pos.x - size, mob.pos.y - size/2);
        this.ctx.lineTo(mob.pos.x - size, mob.pos.y + size/2);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Normal and flying mobs are circles
        this.ctx.beginPath();
        this.ctx.arc(mob.pos.x, mob.pos.y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Flying mob wing indicators
      if (mob.type === 'flying') {
        this.ctx.strokeStyle = this.getMobColor(mob.type);
        this.ctx.lineWidth = 2;
        // Left wing
        this.ctx.beginPath();
        this.ctx.arc(mob.pos.x - size/2, mob.pos.y, size/3, 0, Math.PI * 2);
        this.ctx.stroke();
        // Right wing
        this.ctx.beginPath();
        this.ctx.arc(mob.pos.x + size/2, mob.pos.y, size/3, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // Armor indicator for tank mobs
      if (mob.type === 'tank' && mob.armor > 0) {
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          mob.pos.x - size,
          mob.pos.y - size,
          size * 2,
          size * 2
        );
      }

      // Health bar
      const barWidth = size * 2;
      const barHeight = 4;
      const healthRatio = mob.hp / mob.maxHp;
      
      // Background
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(
        mob.pos.x - barWidth / 2,
        mob.pos.y - size - 8,
        barWidth,
        barHeight
      );
      
      // Health
      this.ctx.fillStyle = 'green';
      this.ctx.fillRect(
        mob.pos.x - barWidth / 2,
        mob.pos.y - size - 8,
        barWidth * healthRatio,
        barHeight
      );

      // Slow effect indicator
      if (mob.slowUntil && Date.now() / 1000 < mob.slowUntil) {
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(mob.pos.x, mob.pos.y, size + 2, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }
  }

  renderProjectiles(projectiles: Projectile[]) {
    for (const projectile of projectiles) {
      this.ctx.fillStyle = this.getProjectileColor(projectile.kind);
      this.ctx.beginPath();
      const size = projectile.kind === 'cannon' ? 4 : 2;
      this.ctx.arc(projectile.pos.x, projectile.pos.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderTowerRange(tower: Tower) {
    const worldPos = gridToWorld(tower.tile, this.tileSize);
    this.ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(worldPos.x, worldPos.y, tower.range, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  render(game: GameState) {
    this.clear();
    this.renderGrid(game);
    this.renderTowers(game.towers, game.selectedTower);
    this.renderMobs(game.mobs);
    this.renderProjectiles(game.projectiles);

    // Render range for selected tower
    if (game.selectedTower) {
      const tower = game.towers.find(t => t.id === game.selectedTower);
      if (tower) {
        this.renderTowerRange(tower);
      }
    }
  }

  renderTowerIcon(kind: TowerKind, center: Vec2, size: number) {
    // Save current state
    const originalFont = this.ctx.font;
    const originalTextAlign = this.ctx.textAlign;
    const originalTextBaseline = this.ctx.textBaseline;
    const originalFillStyle = this.ctx.fillStyle;

    // Set up emoji rendering
    this.ctx.font = `${size * 1.2}px serif`; // Use serif for better emoji support
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'white';

    // Render emoji icon
    const emoji = TOWER_ICONS[kind];
    this.ctx.fillText(emoji, center.x, center.y);

    // Restore original state
    this.ctx.font = originalFont;
    this.ctx.textAlign = originalTextAlign;
    this.ctx.textBaseline = originalTextBaseline;
    this.ctx.fillStyle = originalFillStyle;
  }

  renderBuildPreview(towerKind: TowerKind, tile: Vec2, game: GameState) {
    const worldPos = gridToWorld(tile, this.tileSize);
    const towerStats = TOWER_STATS[towerKind][0]; // Tier 1 stats
    
    // Check if can build here
    const canBuild = this.canBuildAt(tile, game);
    const isOccupied = game.towers.some(t => t.tile.x === tile.x && t.tile.y === tile.y);
    
    // Show range preview
    this.ctx.strokeStyle = canBuild && !isOccupied ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(worldPos.x, worldPos.y, towerStats.range, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reset dash

    // Show tower icon preview (larger size, no background)
    this.ctx.globalAlpha = 0.8;
    this.renderTowerIcon(towerKind, worldPos, this.tileSize * 0.4); // Increased from 0.25 to 0.4
    this.ctx.globalAlpha = 1.0;

    // Show tile highlight
    this.ctx.fillStyle = canBuild && !isOccupied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    this.ctx.fillRect(
      worldPos.x - this.tileSize / 2,
      worldPos.y - this.tileSize / 2,
      this.tileSize,
      this.tileSize
    );
  }

  canBuildAt(tile: Vec2, game: GameState): boolean {
    // Check bounds
    if (tile.x < 0 || tile.x >= game.grid.width || tile.y < 0 || tile.y >= game.grid.height) {
      return false;
    }
    
    // Check if tile is buildable
    return game.grid.tiles[tile.y][tile.x] === 'buildable';
  }

  private getTileColor(tileType: string): string {
    switch (tileType) {
      case 'path': return '#1e40af';
      case 'buildable': return '#1e293b';
      case 'blocked': return '#475569';
      default: return '#334155';
    }
  }


  private getMobColor(type: MobType): string {
    switch (type) {
      case 'normal': return '#fbbf24'; // Bright yellow
      case 'fast': return '#fb7185'; // Bright pink-red  
      case 'tank': return '#c084fc'; // Bright purple
      case 'flying': return '#38bdf8'; // Bright cyan
      default: return '#64748b';
    }
  }

  private getMobSize(type: MobType): number {
    switch (type) {
      case 'normal': return 6;
      case 'fast': return 5;
      case 'tank': return 8;
      case 'flying': return 6;
      default: return 6;
    }
  }

  private getProjectileColor(kind: TowerKind): string {
    switch (kind) {
      case 'arrow': return '#16a34a';
      case 'cannon': return '#dc2626';
      case 'frost': return '#3b82f6';
      default: return '#64748b';
    }
  }

  screenToWorld(screenPos: Vec2): Vec2 {
    return {
      x: screenPos.x,
      y: screenPos.y
    };
  }

  worldToGrid(worldPos: Vec2): Vec2 {
    return {
      x: Math.floor(worldPos.x / this.tileSize),
      y: Math.floor(worldPos.y / this.tileSize)
    };
  }
}