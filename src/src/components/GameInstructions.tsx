import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function GameInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium">How to Play</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 text-xs">
          <div>
            <h4 className="text-foreground mb-1 font-medium">Towers:</h4>
            <div className="text-muted-foreground space-y-0.5">
              <div>• <strong>Arrow:</strong> Fast single-target</div>
              <div>• <strong>Cannon:</strong> Splash damage</div>
              <div>• <strong>Frost:</strong> Slows enemies</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-foreground mb-1 font-medium">Enemies:</h4>
            <div className="text-muted-foreground space-y-0.5">
              <div>• <strong>Normal:</strong> Balanced</div>
              <div>• <strong>Fast:</strong> Quick but weak</div>
              <div>• <strong>Tank:</strong> High HP & armor</div>
              <div>• <strong>Flying:</strong> Arrow/Frost only</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-foreground mb-1 font-medium">Controls:</h4>
            <div className="text-muted-foreground space-y-0.5">
              <div>• Keys 1-3: Build towers</div>
              <div>• Space: Pause/Resume</div>
              <div>• ESC: Cancel building</div>
              <div>• R: Restart (when game over)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}