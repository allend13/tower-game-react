
import { memo } from 'react';

export const LegendPanel = memo(function LegendPanel() {
  return (
    <div className="bg-card rounded-lg border border-border p-3 lg:p-4 h-full mt-[0px] mr-[0px] mb-[8px] ml-[0px]">
      <h3 className="mb-2 lg:mb-3 text-base lg:text-[20px]">Enemy types</h3>
      
      {/* Mobile: 2x2 grid */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-sm font-normal">Normal</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5">
                  <span>HP:</span><span>100</span>
                  <span>Gold:</span><span>10</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-sm">Fast</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5">
                  <span>HP:</span><span>60</span>
                  <span>Gold:</span><span>15</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-sm">Tank</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5">
                  <span>HP:</span><span>300</span>
                  <span>Armor:</span><span>5</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-sm">Flying</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5">
                  <span>HP:</span><span>80</span>
                  <span>Special:</span><span>Immune</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop: 1x4 grid */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-[14px] font-normal">Normal</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                  <span>HP:</span><span>100</span>
                  <span>Speed:</span><span>80</span>
                  <span>Armor:</span><span>No</span>
                  <span>Gold:</span><span>10</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-[14px]">Fast</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                  <span>HP:</span><span>60</span>
                  <span>Speed:</span><span>140</span>
                  <span>Armor:</span><span>No</span>
                  <span>Gold:</span><span>15</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-[14px]">Tank</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                  <span>HP:</span><span>300</span>
                  <span>Speed:</span><span>50</span>
                  <span>Armor:</span><span>5</span>
                  <span>Gold:</span><span>25</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-[14px]">Flying</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                  <span>HP:</span><span>80</span>
                  <span>Speed:</span><span>100</span>
                  <span>Special:</span><span>Cannon-immune</span>
                  <span>Gold:</span><span>20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});