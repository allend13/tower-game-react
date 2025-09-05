import { useEffect, useRef, useCallback } from "react";
import { CanvasRenderer } from "../renderers/canvas";
import { 
  useMobs, 
  useTowers, 
  useProjectiles, 
  useGrid, 
  useSelectedTile, 
  useBuildingTower,
  useSelectedTower,
  usePaused,
  useGameOver,
  useVictory,
  useSelectTile,
  useBuildTower,
  useSelectTower,
  useCancelBuilding,
  useResume,
  usePause,
  useRestart,
  useStartBuilding
} from "../state/zustandStore";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const mobs = useMobs();
  const towers = useTowers();
  const projectiles = useProjectiles();
  const grid = useGrid();
  const selectedTile = useSelectedTile();
  const buildingTower = useBuildingTower();
  const selectedTower = useSelectedTower();
  const paused = usePaused();
  const gameOver = useGameOver();
  const victory = useVictory();
  const selectTile = useSelectTile();
  const buildTower = useBuildTower();
  const selectTower = useSelectTower();
  const cancelBuilding = useCancelBuilding();
  const resume = useResume();
  const pause = usePause();
  const restart = useRestart();
  const startBuilding = useStartBuilding();

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(
        canvasRef.current,
      );
      rendererRef.current.setSize(640, 480);
    }
  }, []);

  // Render game state
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render({
        mobs,
        towers,
        projectiles,
        grid,
        selectedTile,
        buildingTower,
        selectedTower,
      } as any);
    }
  }, [mobs, towers, projectiles, grid, selectedTile, buildingTower, selectedTower]);

  // Handle mouse movement for building preview
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!rendererRef.current || !buildingTower) return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const screenPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const worldPos = rendererRef.current.screenToWorld(screenPos);
      const gridPos = rendererRef.current.worldToGrid(worldPos);

      // Check bounds
      if (
        gridPos.x < 0 ||
        gridPos.x >= grid.width ||
        gridPos.y < 0 ||
        gridPos.y >= grid.height
      ) {
        return;
      }

      // Update selected tile for preview
      selectTile(gridPos);
    },
    [buildingTower, grid.width, grid.height, selectTile],
  );

  // Handle canvas clicks
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!rendererRef.current) return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const screenPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const worldPos =
        rendererRef.current.screenToWorld(screenPos);
      const gridPos = rendererRef.current.worldToGrid(worldPos);

      // Check bounds
      if (
        gridPos.x < 0 ||
        gridPos.x >= grid.width ||
        gridPos.y < 0 ||
        gridPos.y >= grid.height
      ) {
        return;
      }

      // If building a tower, try to place it
      if (buildingTower) {
        buildTower(gridPos);
        return;
      }

      // Check if clicking on an existing tower
      const tower = towers.find(
        (t) => t.tile.x === gridPos.x && t.tile.y === gridPos.y,
      );

      if (tower) {
        selectTower(tower.id);
      } else {
        selectTile(gridPos);
      }
    },
    [
      buildingTower,
      grid.width,
      grid.height,
      towers,
      buildTower,
      selectTower,
    ],
  );

  // Handle right-click to cancel building
  const handleRightClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (buildingTower) {
        cancelBuilding();
      }
    },
    [buildingTower, cancelBuilding],
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (paused) {
            resume();
          } else {
            pause();
          }
          break;
        case "Escape":
          event.preventDefault();
          if (buildingTower) {
            cancelBuilding();
          } else if (selectedTower) {
            selectTower(null);
          }
          break;
        case "KeyR":
          event.preventDefault();
          if (gameOver) {
            restart();
          }
          break;
        case "Digit1":
          event.preventDefault();
          startBuilding("arrow");
          break;
        case "Digit2":
          event.preventDefault();
          startBuilding("cannon");
          break;
        case "Digit3":
          event.preventDefault();
          startBuilding("frost");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [
    paused,
    buildingTower,
    selectedTower,
    gameOver,
    resume,
    pause,
    cancelBuilding,
    selectTower,
    restart,
    startBuilding,
  ]);

  return (
    <div className="relative border-2 border-border rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onContextMenu={handleRightClick}
        className="block cursor-crosshair"
        width={640}
        height={480}
        tabIndex={0}
      />

      {/* Game overlays */}
      {paused && !gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2>Game Paused</h2>
            <p className="text-muted-foreground mt-2">
              Press Space to continue
            </p>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border border-border text-center">
            <h2 className="mb-4">
              {victory ? "🎉 Victory!" : "💀 Game Over"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {victory
                ? "You successfully defended against all waves!"
                : "Your defenses have been overwhelmed!"}
            </p>
            <button
              onClick={restart}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Play Again (R)
            </button>
          </div>
        </div>
      )}

      {/* Building hint */}
      {buildingTower && (
        <div className="absolute top-2 left-2 bg-card p-2 rounded border border-border">
          <p className="text-sm">
            Building {buildingTower} tower - Click to
            place, Right-click to cancel
          </p>
        </div>
      )}
    </div>
  );
}