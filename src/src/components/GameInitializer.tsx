import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../state/zustandStore';
import { GAME_CONFIG } from '../constants';

export function GameInitializer() {
  const gameStarted = useGameStore(state => state.gameStarted);
  const paused = useGameStore(state => state.paused);
  const gameOver = useGameStore(state => state.gameOver);
  const speed = useGameStore(state => state.speed);
  const tick = useGameStore(state => state.tick);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || paused || gameOver) {
      animationFrameRef.current = undefined;
      return;
    }

    const deltaTime = lastTimeRef.current === 0 ? 0 : (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    // Cap delta time to prevent spiral of death
    const cappedDeltaTime = Math.min(deltaTime, GAME_CONFIG.MAX_DELTA_TIME) * speed;

    if (cappedDeltaTime > 0) {
      tick(cappedDeltaTime, GAME_CONFIG.TILE_SIZE);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, paused, gameOver, speed, tick]);

  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, paused, gameOver, gameLoop]);

  return null;
}
