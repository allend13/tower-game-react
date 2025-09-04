# React Tower Defense

A fully-featured tower defense game built with React, TypeScript, and HTML5 Canvas. Defend your base against 10 increasingly difficult waves of enemies using strategic tower placement and upgrades.

## 🎮 Features

### Core Gameplay
- **Fixed 2D grid-based map** with a winding path from spawn to base
- **10 challenging waves** with increasing difficulty and enemy variety
- **3 tower archetypes** with unique abilities and 3 upgrade tiers each
- **4 enemy types** with different strengths and weaknesses
- **Economy system** with money management and strategic upgrades
- **Lives system** - lose when enemies reach your base

### Tower Types
1. **Arrow Tower** - Fast single-target attacks, effective against all enemies
2. **Cannon Tower** - Slow but powerful splash damage, cannot hit flying enemies  
3. **Frost Tower** - Moderate damage with slow effects to control enemy movement

### Enemy Types
1. **Normal** - Balanced health and speed
2. **Fast** - Quick movement but low health
3. **Tank** - High health and armor, slow movement
4. **Flying** - Immune to cannon attacks, moderate stats

### Technical Features
- **60 FPS performance** with optimized canvas rendering
- **Fixed timestep simulation** for consistent gameplay
- **Predictive targeting** for moving projectiles
- **Keyboard and mouse controls** with accessibility support
- **Responsive design** for various screen sizes
- **Game state management** with React Context and reducers

## 🚀 Getting Started

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 How to Play

### Basic Controls
- **Mouse**: Click to select tiles and towers, place buildings
- **Right-click**: Cancel building mode
- **Keyboard Shortcuts**:
  - `1` - Select Arrow Tower
  - `2` - Select Cannon Tower  
  - `3` - Select Frost Tower
  - `Space` - Pause/Resume game
  - `R` - Restart game (when game over)
  - `Esc` - Cancel building

### Gameplay Strategy
1. **Build towers** on buildable (green) tiles along the enemy path
2. **Upgrade towers** to increase damage, range, and attack speed
3. **Balance your economy** - spend money wisely on towers vs upgrades
4. **Counter enemy types** - use Arrow/Frost for flying enemies, Cannons for groups
5. **Use Frost towers** strategically to slow down fast enemies and tough waves

### Wave System
- Waves automatically start after the previous wave is cleared
- Each wave provides a money reward upon completion
- Preview upcoming enemies in the wave information panel
- Call early waves for bonus (future enhancement)

## 🏗️ Architecture

The game follows a clean separation between engine logic and UI components:

### Engine (`/src/engine/`)
- **`types.ts`** - Core game data structures and constants
- **`grid.ts`** - Grid management and A* pathfinding  
- **`targeting.ts`** - Tower targeting strategies and prediction
- **`sim.ts`** - Core simulation loop and game state updates

### Rendering (`/src/renderers/`)
- **`canvas.ts`** - Optimized canvas renderer with batched drawing

### State Management (`/src/state/`)
- **`store.tsx`** - React Context with useReducer for game state

### UI Components (`/src/components/`)
- **`GameCanvas.tsx`** - Main game area with input handling
- **`Hud.tsx`** - Game statistics and controls
- **`BuildBar.tsx`** - Tower selection and building
- **`TowerInfo.tsx`** - Tower details and upgrade interface

## 🔧 Technical Details

### Performance Optimizations
- Canvas-based rendering for 60 FPS with hundreds of entities
- Fixed timestep simulation prevents frame rate dependencies
- Efficient collision detection with spatial partitioning concepts
- Minimal React re-renders by separating game state from UI state

### Game Mechanics
- **Armor system**: `effectiveDamage = max(1, baseDamage - armor)`
- **Slow effects**: Multiplicative stacking with minimum 30% base speed
- **Targeting**: First-in-path strategy with predictive aiming
- **Projectile system**: Physics-based movement with collision detection

### Accessibility Features
- Keyboard-only controls available
- Clear visual feedback for all game states
- Semantic HTML structure for screen readers
- Reduced motion respect (future enhancement)

## 🎨 Customization

The game is designed to be easily extensible:

### Adding New Towers
1. Add tower type to `TowerKind` union in `types.ts`
2. Define stats in `TOWER_STATS` object
3. Add rendering logic in `canvas.ts`
4. Add icon to `BuildBar.tsx`

### Adding New Enemies  
1. Add enemy type to `MobType` union in `types.ts`
2. Define stats in `MOB_STATS` object
3. Add to wave definitions in `WAVES` array
4. Update rendering in `canvas.ts`

### Modifying Waves
Edit the `WAVES` array in `types.ts` to adjust:
- Enemy composition and count
- Spawn timing and pacing
- Wave rewards
- Difficulty progression

## 🏆 Future Enhancements

- **Map Editor**: Design custom maps with JSON export
- **Endless Mode**: Procedurally generated infinite waves
- **Achievement System**: Unlock rewards for various challenges
- **Save/Load**: Persist game progress
- **Multiplayer**: Competitive or cooperative modes
- **Mobile Touch**: Enhanced mobile controls
- **Sound Effects**: Audio feedback for actions
- **Particle Effects**: Visual polish for explosions and impacts

## 📊 Performance Targets

The game is optimized to meet these performance targets:

- **60 FPS** with 200+ active entities (mobs + projectiles)
- **< 50ms** main thread blocking time
- **Stable memory** usage over 10+ minute sessions
- **< 2 second** cold start time

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests  
npm run test:e2e

# Performance profiling
npm run build && npm run preview
# Use browser DevTools for performance analysis
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines and submit pull requests for any improvements.

---

Built with ❤️ using React, TypeScript, and HTML5 Canvas.