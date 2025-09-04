import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { MobileBuildPanel } from "./MobileBuildPanel";
import { MobileGameInfo } from "./MobileGameInfo";
import { Hammer, Info } from "lucide-react";

export function MobileTabs() {
  return (
    <Tabs defaultValue="build" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-card border border-border rounded-lg">
        <TabsTrigger 
          value="build" 
          className="
            flex items-center gap-2 px-4 py-2 h-full rounded-md font-medium transition-all duration-200
            data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
            data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
            data-[state=inactive]:hover:bg-accent/50
          "
        >
          <Hammer className="w-4 h-4" />
          <span>Build Towers</span>
        </TabsTrigger>
        <TabsTrigger 
          value="enemies" 
          className="
            flex items-center gap-2 px-4 py-2 h-full rounded-md font-medium transition-all duration-200
            data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
            data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
            data-[state=inactive]:hover:bg-accent/50
          "
        >
          <Info className="w-4 h-4" />
          <span>Enemy Types</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="build" className="mt-4">
        <MobileBuildPanel />
      </TabsContent>
      
      <TabsContent value="enemies" className="mt-4 px-2">
        <MobileGameInfo />
      </TabsContent>
    </Tabs>
  );
}