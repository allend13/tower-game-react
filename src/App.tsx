
import { memo } from 'react';
import { GameInitializer } from './src/components/GameInitializer';
import { GameCanvas } from './src/components/GameCanvas';
import { TopBar } from './src/components/TopBar';
import { WaveBar } from './src/components/WaveBar';
import { BuildPanel } from './src/components/BuildPanel';  
import { LegendPanel } from './src/components/LegendPanel';
import { MobileTabs } from './src/components/MobileTabs';
import { TowerModal } from './src/components/TowerModal';
import { GameIntroModal } from './src/components/GameIntroModal';

const App = memo(function App() {
  return (
    <div className="h-screen bg-background dark flex flex-col">
        <GameInitializer />
        
        {/* Top Bar */}
        <TopBar />
        
        {/* Wave Bar */}
        <WaveBar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Layout */}
          <div className="lg:hidden flex-1 flex flex-col gap-2 p-2">
            {/* Game Canvas - centered */}
            <div className="flex-1 flex items-center justify-center">
              <GameCanvas />
            </div>
            
            {/* Mobile Bottom Panel */}
            <div className="pt-[0px] pr-[0px] pb-[16px] pl-[0px]">
              <MobileTabs />
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-1 flex-col gap-4 p-4">
            {/* Game Area with Sidebar */}
            <div className="flex gap-4 h-[480px]">
              {/* Game Canvas Area */}
              <div className="flex-1 flex items-center justify-center">
                <GameCanvas />
              </div>
              
              {/* Right Sidebar - constrained to game canvas height */}
              <div className="w-80 h-full">
                <BuildPanel />
              </div>
            </div>
            
            {/* Bottom panel - full width */}
            <div>
              <LegendPanel />
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <GameIntroModal />
        <TowerModal />
      </div>
  );
});

export default App;