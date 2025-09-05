import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useGameStarted, useStartGame } from '../state/zustandStore';
import { Target } from 'lucide-react';

export function GameIntroModal() {
  const gameStarted = useGameStarted();
  const startGame = useStartGame();

  const handleStartGame = () => {
    startGame();
  };

  return (
    <Dialog open={!gameStarted} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6 text-primary" />
            Tower Defense
          </DialogTitle>
          <DialogDescription>
            Defend your base from enemy waves by building towers!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Survive <strong>10 waves</strong> with <strong className="text-red-400">20 lives</strong> and <strong className="text-yellow-400">$500</strong> starting money.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span>🏹</span>
                <span className="text-sm"><strong>Arrow:</strong> Fast single target</span>
              </div>
              <div className="flex items-center gap-3">
                <span>💣</span>
                <span className="text-sm"><strong>Cannon:</strong> Splash damage</span>
              </div>
              <div className="flex items-center gap-3">
                <span>❄️</span>
                <span className="text-sm"><strong>Frost:</strong> Slows enemies</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            • Click towers to upgrade • Waves auto-start in 30s • Earn money from kills
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button 
            onClick={handleStartGame}
            size="lg"
            className="px-8"
          >
            <Target className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}