import { useEffect, useRef, useCallback } from "react";
import { CanvasRenderer } from "../renderers/canvas";
import { useGameState, useGameActions } from "../state/store";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const state = useGameState();
  const actions = useGameActions();

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
      rendererRef.current.render(state);
    }
  }, [state]);

  // Handle mouse movement for building preview
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!rendererRef.current || !state.buildingTower) return;

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
        gridPos.x >= state.grid.width ||
        gridPos.y < 0 ||
        gridPos.y >= state.grid.height
      ) {
        return;
      }

      // Update selected tile for preview
      actions.selectTile(gridPos);
    },
    [state.buildingTower, state.grid.width, state.grid.height, actions],
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
        gridPos.x >= state.grid.width ||
        gridPos.y < 0 ||
        gridPos.y >= state.grid.height
      ) {
        return;
      }

      // If building a tower, try to place it
      if (state.buildingTower) {
        actions.buildTower(gridPos);
        return;
      }

      // Check if clicking on an existing tower
      const tower = state.towers.find(
        (t) => t.tile.x === gridPos.x && t.tile.y === gridPos.y,
      );

      if (tower) {
        actions.selectTower(tower.id);
      } else {
        actions.selectTile(gridPos);
      }
    },
    [
      state.buildingTower,
      state.grid.width,
      state.grid.height,
      state.towers,
      actions,
    ],
  );

  // Handle right-click to cancel building
  const handleRightClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (state.buildingTower) {
        actions.cancelBuilding();
      }
    },
    [state.buildingTower, actions],
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (state.paused) {
            actions.resume();
          } else {
            actions.pause();
          }
          break;
        case "Escape":
          event.preventDefault();
          if (state.buildingTower) {
            actions.cancelBuilding();
          } else if (state.selectedTower) {
            actions.selectTower(null);
          }
          break;
        case "KeyR":
          event.preventDefault();
          if (state.gameOver) {
            actions.restart();
          }
          break;
        case "Digit1":
          event.preventDefault();
          actions.startBuilding("arrow");
          break;
        case "Digit2":
          event.preventDefault();
          actions.startBuilding("cannon");
          break;
        case "Digit3":
          event.preventDefault();
          actions.startBuilding("frost");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.paused,
    state.buildingTower,
    state.selectedTower,
    state.gameOver,
    actions,
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
      {state.paused && !state.gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2>Game Paused</h2>
            <p className="text-muted-foreground mt-2">
              Press Space to continue
            </p>
          </div>
        </div>
      )}

      {state.gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border border-border text-center">
            <h2 className="mb-4">
              {state.victory ? "🎉 Victory!" : "💀 Game Over"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {state.victory
                ? "You successfully defended against all waves!"
                : "Your defenses have been overwhelmed!"}
            </p>
            <button
              onClick={actions.restart}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Play Again (R)
            </button>
          </div>
        </div>
      )}

      {/* Building hint */}
      {state.buildingTower && (
        <div className="absolute top-2 left-2 bg-card p-2 rounded border border-border">
          <p className="text-sm">
            Building {state.buildingTower} tower - Click to
            place, Right-click to cancel
          </p>
        </div>
      )}
    </div>
  );
}